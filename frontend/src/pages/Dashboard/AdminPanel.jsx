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
import { 
  Users, BookOpen, ShoppingCart, BarChart3, LogOut, RefreshCw, 
  Edit2, Trash2, Search 
} from 'lucide-react';
import BookManagement from '../Components/Admin/BookManagement';
import OrderManagement from '../Components/Admin/OrderManagement';
// COLLAB-SAFE: Reusing notification UI component in admin header.
import NotificationPanel from '../Components/Customer/NotificationPanel';
import logo from '../../assets/logo.png';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

function AdminPanel() {
  const [currentSection, setCurrentSection] = useState('overview');
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [stats, setStats] = useState({ total_users: 0, customers: 0, owners: 0, admins: 0 });
  const [monthlyData, setMonthlyData] = useState([]);
  const [filters, setFilters] = useState({ page: 1, limit: 10, role: '', search: '' });
  const [loading, setLoading] = useState(false);

  const [editUser, setEditUser] = useState(null);
  const [modalForm, setModalForm] = useState({ username: '', email: '', role: 'customer' });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (!token || role !== 'admin') navigate('/login');
  }, [token, role, navigate]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const usersRes = await axios.get(`${API_BASE}/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(usersRes.data.users || []);
      setPagination(usersRes.data.pagination || {});

      const statsRes = await axios.get(`${API_BASE}/admin/users/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(statsRes.data);
      setMonthlyData(statsRes.data.monthly || []);
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAllData();
  }, [filters, token]);

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

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users Management', icon: Users },
    { id: 'books', label: 'Books / Products', icon: BookOpen },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
  ];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const openEditModal = (user) => {
    setEditUser(user);
    setModalForm({ username: user.username, email: user.email, role: user.role });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`${API_BASE}/admin/users/${editUser.id}`, modalForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Success', 'User updated!', 'success');
      setEditUser(null);
      fetchAllData();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Update failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete User?', text: 'This cannot be undone!', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Yes, Delete'
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE}/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        Swal.fire('Deleted!', 'User removed.', 'success');
        fetchAllData();
      } catch (err) {
        Swal.fire('Error', 'Delete failed', 'error');
      }
    }
  };

  return (
    <div className="min-vh-100 bg-dark text-white d-flex">
      {/* ==================== STICKY SIDEBAR ==================== */}
      <div 
        className="col-lg-2 bg-black border-end border-white-10 p-4 d-none d-lg-flex flex-column position-sticky top-0"
        style={{ height: '100vh', overflowY: 'auto' }}
      >
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

        <div className="mt-auto pt-4">
          <button 
            onClick={() => navigate('/login')} 
            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* ==================== MAIN SCROLLABLE CONTENT ==================== */}
      <div className="flex-grow-1 p-4 overflow-auto" style={{ height: '100vh' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">{menuItems.find(m => m.id === currentSection).label}</h2>
          {/* COLLAB-SAFE: Added admin notification access in header actions. */}
          <div className="d-flex align-items-center gap-2">
            <NotificationPanel />
            <button onClick={fetchAllData} className="btn btn-outline-light d-flex align-items-center gap-2">
              <RefreshCw size={18} /> Refresh All
            </button>
          </div>
        </div>

        {/* Overview Section */}
        {currentSection === 'overview' && (
          <div className="row g-4">
            <div className="col-md-3"><div className="card bg-black h-100 text-center p-4"><h2 className="text-purple">{stats.total_users}</h2><small>Total Users</small></div></div>
            <div className="col-md-3"><div className="card bg-black h-100 text-center p-4"><h2 className="text-success">{stats.customers}</h2><small>Customers</small></div></div>
            <div className="col-md-3"><div className="card bg-black h-100 text-center p-4"><h2 className="text-warning">{stats.owners}</h2><small>Owners</small></div></div>
            <div className="col-md-3"><div className="card bg-black h-100 text-center p-4"><h2 className="text-danger">{stats.admins}</h2><small>Admins</small></div></div>

            <div className="col-12">
              <div className="card bg-black p-4">
                <h5>New Users This Year (Real Data)</h5>
                <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
            </div>
          </div>
        )}

        {/* Users Management Section - Full Table */}
        {currentSection === 'users' && (
          <>
            {/* Filters */}
            <div className="card bg-black mb-4">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-5">
                    <div className="input-group">
                      <span className="input-group-text bg-dark text-white"><Search size={18} /></span>
                      <input type="text" name="search" placeholder="Search username or email..." className="form-control bg-dark text-white border-0" value={filters.search} onChange={handleFilterChange} />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <select name="role" className="form-select bg-dark text-white border-0" value={filters.role} onChange={handleFilterChange}>
                      <option value="">All Roles</option>
                      <option value="customer">Customer</option>
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <button onClick={fetchAllData} className="btn btn-primary w-100">Apply Filter</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Table + Pagination */}
            <div className="card bg-black">
              <div className="table-responsive">
                <table className="table table-dark table-hover mb-0">
                  <thead>
                    <tr>
                      <th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Joined</th><th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? <tr><td colSpan="6" className="text-center py-5">Loading...</td></tr> : 
                     users.length === 0 ? <tr><td colSpan="6" className="text-center py-5">No users found</td></tr> :
                     users.map(user => (
                       <tr key={user.id}>
                         <td>{user.id}</td>
                         <td>{user.username}</td>
                         <td>{user.email}</td>
                         <td><span className={`badge ${user.role === 'admin' ? 'bg-danger' : user.role === 'owner' ? 'bg-warning' : 'bg-success'}`}>{user.role}</span></td>
                         <td>{new Date(user.created_at).toLocaleDateString()}</td>
                         <td className="text-end">
                           <button onClick={() => openEditModal(user)} className="btn btn-sm btn-outline-light me-2"><Edit2 size={16} /></button>
                           <button onClick={() => handleDelete(user.id)} className="btn btn-sm btn-outline-danger"><Trash2 size={16} /></button>
                         </td>
                       </tr>
                     ))}
                  </tbody>
                </table>
              </div>
              <div className="card-footer bg-black d-flex justify-content-between p-3">
                <span>Page {pagination.page} of {pagination.totalPages}</span>
                <div>
                  <button disabled={pagination.page === 1} onClick={() => setFilters(p => ({...p, page: p.page-1}))} className="btn btn-outline-light btn-sm me-2">Previous</button>
                  <button disabled={pagination.page === pagination.totalPages} onClick={() => setFilters(p => ({...p, page: p.page+1}))} className="btn btn-outline-light btn-sm">Next</button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Book Service Component */}
        {currentSection === 'books' && 
        
          <div className="text-center py-5">
            <BookManagement />
          </div>
          
        }


        {/* Orders Component - UPDATED */}
        {currentSection === 'orders' && 
          <OrderManagement />
        }
      </div>

      {/* EDIT MODAL */}
      {editUser && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header border-0"><h5>Edit User #{editUser.id}</h5><button className="btn-close btn-close-white" onClick={() => setEditUser(null)}></button></div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="mb-3"><label>Username</label><input type="text" className="form-control bg-black text-white" value={modalForm.username} onChange={e => setModalForm({...modalForm, username: e.target.value})} /></div>
                  <div className="mb-3"><label>Email</label><input type="email" className="form-control bg-black text-white" value={modalForm.email} onChange={e => setModalForm({...modalForm, email: e.target.value})} /></div>
                  <div className="mb-3"><label>Role</label>
                    <select className="form-select bg-black text-white" value={modalForm.role} onChange={e => setModalForm({...modalForm, role: e.target.value})}>
                      <option value="customer">Customer</option>
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditUser(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;