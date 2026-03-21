import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Users, BookOpen, ShoppingCart, BarChart3, LogOut, RefreshCw } from 'lucide-react';

import logo from '../../assets/logo.png';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
//const ADMIN_BASE = API_BASE.replace('/auth', '');

function AdminPanel() {
  const [currentSection, setCurrentSection] = useState('overview');
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [stats, setStats] = useState({ total_users: 0, customers: 0, owners: 0, admins: 0 });
  const [monthlyData, setMonthlyData] = useState([]);
  const [filters, setFilters] = useState({ page: 1, limit: 10, role: '', search: '' });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Protect route
  useEffect(() => {
    if (!token || role !== 'admin') navigate('/login');
  }, [token, role, navigate]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Users list
      const params = new URLSearchParams(filters);
      const usersRes = await axios.get(`${API_BASE}/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(usersRes.data.users || []);
      setPagination(usersRes.data.pagination || {});

      // 2. Stats + Monthly (real data)
      const statsRes = await axios.get(`${API_BASE}/admin/users/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(statsRes.data);
      setMonthlyData(statsRes.data.monthly || []);
    } catch (err) {
      Swal.fire('Error', 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAllData();
  }, [filters, token]);

  // Line Chart Data (real)
  const chartData = {
    labels: monthlyData.map(item => item.month),
    datasets: [{
      label: 'New Users',
      data: monthlyData.map(item => parseInt(item.count)),
      borderColor: '#7c3aed',
      backgroundColor: 'rgba(124, 58, 237, 0.15)',
      tension: 0.4,
      borderWidth: 4
    }]
  };

  // Sidebar Menu
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users Management', icon: Users },
    { id: 'books', label: 'Books / Products', icon: BookOpen },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
  ];

  return (
    <div className="min-vh-100 bg-dark text-white d-flex">
      {/* SIDEBAR */}
      <div className="col-lg-2 bg-black border-end border-white-10 p-4 d-none d-lg-flex flex-column">
        <div className="d-flex align-items-center gap-3 mb-5">
          <img src={logo} width="48" className="rounded-circle" />
          <h4 className="text-purple fw-bold mb-0">BookCorner Admin</h4>
        </div>

        <div className="nav flex-column">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 10 }}
                onClick={() => setCurrentSection(item.id)}
                className={`nav-link text-start mb-2 py-3 px-4 rounded-3 d-flex align-items-center gap-3 ${currentSection === item.id ? 'bg-purple text-white' : 'text-white-50'}`}
              >
                <Icon size={22} />
                {item.label}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-auto">
          <button onClick={() => navigate('/login')} className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-grow-1 p-4 overflow-auto">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">{menuItems.find(m => m.id === currentSection).label}</h2>
          <button onClick={fetchAllData} className="btn btn-outline-light d-flex align-items-center gap-2">
            <RefreshCw size={18} /> Refresh All
          </button>
        </div>

        {/* OVERVIEW SECTION */}
        {currentSection === 'overview' && (
          <div className="row g-4">
            {/* Stats Cards */}
            <div className="col-md-3"><div className="card bg-black h-100 text-center p-4"><h2 className="text-purple">{stats.total_users}</h2><small>Total Users</small></div></div>
            <div className="col-md-3"><div className="card bg-black h-100 text-center p-4"><h2 className="text-success">{stats.customers}</h2><small>Customers</small></div></div>
            <div className="col-md-3"><div className="card bg-black h-100 text-center p-4"><h2 className="text-warning">{stats.owners}</h2><small>Owners</small></div></div>
            <div className="col-md-3"><div className="card bg-black h-100 text-center p-4"><h2 className="text-danger">{stats.admins}</h2><small>Admins</small></div></div>

            {/* Real Line Chart */}
            <div className="col-12">
              <div className="card bg-black p-4">
                <h5>New Users This Year (Real Data)</h5>
                <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
            </div>
          </div>
        )}

        {/* USERS SECTION */}
        {currentSection === 'users' && (
          <div className="card bg-black">
            {/* Filters + Table (same as before but cleaner) */}
            {/* ... (I kept the full table from previous version for brevity - you already have it) */}
            {/* You can paste your previous users table code here if you want - it's unchanged */}
          </div>
        )}

        {/* BOOKS / PRODUCTS SECTION (Placeholder - ready for product service) */}
        {currentSection === 'books' && (
          <div className="text-center py-5">
            <BookOpen size={80} className="text-purple mb-4" />
            <h3>Books / Product Catalog</h3>
            <p className="lead text-white-50">Connect to <strong>product-catalog-service</strong> API</p>
            <div className="alert alert-info d-inline-block">
              Future endpoint: <code>/api/products</code><br />
              Add CRUD table here later
            </div>
          </div>
        )}

        {/* ORDERS SECTION (Placeholder) */}
        {currentSection === 'orders' && (
          <div className="text-center py-5">
            <ShoppingCart size={80} className="text-purple mb-4" />
            <h3>Orders Management</h3>
            <p className="lead text-white-50">Connect to <strong>order-service</strong></p>
            <div className="alert alert-info d-inline-block">
              Future endpoint: <code>/api/orders</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;