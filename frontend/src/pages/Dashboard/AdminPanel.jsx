import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import axios from 'axios';
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
import { Line } from 'react-chartjs-2';
import { User, Edit2, Trash2, RefreshCw, Search, Filter } from 'lucide-react';

import logo from '../../assets/logo.png';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/auth';
const ADMIN_BASE = API_BASE.replace('/auth', '');

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [stats, setStats] = useState({ total_users: 0, customers: 0, owners: 0, admins: 0 });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    role: '',
    search: '',
    sortBy: 'created_at',
    order: 'DESC'
  });
  const [loading, setLoading] = useState(false);
  const [editUser, setEditUser] = useState(null); // for modal
  const [modalForm, setModalForm] = useState({ username: '', email: '', role: 'customer' });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Redirect if not admin
  useEffect(() => {
    if (!token || role !== 'admin') {
      navigate('/login');
    }
  }, [token, role, navigate]);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        role: filters.role,
        search: filters.search,
        sortBy: filters.sortBy,
        order: filters.order
      });

      const res = await axios.get(`${ADMIN_BASE}/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(res.data.users || []);
      setPagination(res.data.pagination || { page: 1, totalPages: 1 });
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await axios.get(`${ADMIN_BASE}/admin/users/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error('Stats error', err);
    }
  };

  useEffect(() => {
    if (token && role === 'admin') {
      fetchUsers();
      fetchStats();
    }
  }, [filters, token]);

  // Handle filters
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  // Edit modal
  const openEditModal = (user) => {
    setEditUser(user);
    setModalForm({
      username: user.username,
      email: user.email,
      role: user.role
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`${ADMIN_BASE}/admin/users/${editUser.id}`, modalForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Success', 'User updated successfully', 'success');
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Update failed', 'error');
    }
  };

  // Delete with confirmation
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete User?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Delete'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${ADMIN_BASE}/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire('Deleted!', 'User has been removed.', 'success');
        fetchUsers();
      } catch (err) {
        Swal.fire('Error', 'Delete failed', 'error');
      }
    }
  };

  // Fake monthly data for Line Chart (replace with real API later)
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'New Users',
      data: [42, 58, 73, 65, 89, 112],
      borderColor: '#7c3aed',
      backgroundColor: 'rgba(124, 58, 237, 0.2)',
      tension: 0.4,
      borderWidth: 3
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' } } }
  };

  return (
    <div className="min-vh-100 bg-dark text-white">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-black sticky-top shadow">
        <div className="container">
          <div className="d-flex align-items-center gap-3">
            <img src={logo} alt="BookCorner" width="45" className="rounded-circle" />
            <h4 className="mb-0 fw-bold text-purple">BookCorner Admin</h4>
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className="badge bg-danger fs-6">ADMIN PANEL</span>
            <button onClick={() => navigate('/login')} className="btn btn-outline-light">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-5">
        <div className="row">
          {/* SIDEBAR - STATS + CHART */}
          <div className="col-lg-4">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky-top" style={{ top: '90px' }}
            >
              {/* Stats Cards */}
              <div className="row g-3 mb-4">
                <div className="col-6">
                  <div className="card bg-black border-0 shadow h-100 text-center">
                    <div className="card-body">
                      <h2 className="text-purple fw-bold mb-0">{stats.total_users}</h2>
                      <small className="text-white-50">Total Users</small>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="card bg-black border-0 shadow h-100 text-center">
                    <div className="card-body">
                      <h2 className="text-success fw-bold mb-0">{stats.customers}</h2>
                      <small className="text-white-50">Customers</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Chart - Monthly Registrations */}
              <div className="card bg-black border-0 shadow mb-4">
                <div className="card-header bg-transparent border-0">
                  <h6 className="mb-0">New Users This Year</h6>
                </div>
                <div className="card-body">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="card bg-black border-0 shadow">
                <div className="card-body">
                  <h6 className="mb-3">Role Breakdown</h6>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Owners</span><span className="text-warning">{stats.owners}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Admins</span><span className="text-danger">{stats.admins}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* MAIN TABLE AREA */}
          <div className="col-lg-8">
            {/* Filters */}
            <div className="card bg-black border-0 shadow mb-4">
              <div className="card-body">
                <form onSubmit={handleSearchSubmit} className="row g-3">
                  <div className="col-md-5">
                    <div className="input-group">
                      <span className="input-group-text bg-dark text-white"><Search size={18} /></span>
                      <input
                        type="text"
                        name="search"
                        placeholder="Search username or email..."
                        className="form-control bg-dark text-white border-0"
                        value={filters.search}
                        onChange={handleFilterChange}
                      />
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
                    <select name="sortBy" className="form-select bg-dark text-white border-0" value={filters.sortBy} onChange={handleFilterChange}>
                      <option value="created_at">Date</option>
                      <option value="username">Username</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <button type="submit" className="btn btn-primary w-100">
                      <RefreshCw size={18} className="me-2" /> Refresh
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Users Table */}
            <div className="card bg-black border-0 shadow">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-dark table-hover mb-0">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan="6" className="text-center py-5">Loading users...</td></tr>
                      ) : users.length === 0 ? (
                        <tr><td colSpan="6" className="text-center py-5">No users found</td></tr>
                      ) : (
                        users.map(user => (
                          <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>
                              <span className={`badge ${user.role === 'admin' ? 'bg-danger' : user.role === 'owner' ? 'bg-warning' : 'bg-success'}`}>
                                {user.role}
                              </span>
                            </td>
                            <td>{new Date(user.created_at).toLocaleDateString()}</td>
                            <td className="text-end">
                              <button onClick={() => openEditModal(user)} className="btn btn-sm btn-outline-light me-2">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => handleDelete(user.id)} className="btn btn-sm btn-outline-danger">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              <div className="card-footer bg-black border-0 d-flex justify-content-between align-items-center">
                <span className="text-white-50">
                  Page {pagination.page} of {pagination.totalPages} • {users.length} users
                </span>
                <div>
                  <button
                    disabled={pagination.page === 1}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                    className="btn btn-outline-light btn-sm me-2"
                  >
                    Previous
                  </button>
                  <button
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    className="btn btn-outline-light btn-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editUser && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header border-0">
                <h5>Edit User #{editUser.id}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setEditUser(null)}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label>Username</label>
                    <input
                      type="text"
                      className="form-control bg-black text-white border-0"
                      value={modalForm.username}
                      onChange={e => setModalForm({ ...modalForm, username: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label>Email</label>
                    <input
                      type="email"
                      className="form-control bg-black text-white border-0"
                      value={modalForm.email}
                      onChange={e => setModalForm({ ...modalForm, email: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label>Role</label>
                    <select
                      className="form-select bg-black text-white border-0"
                      value={modalForm.role}
                      onChange={e => setModalForm({ ...modalForm, role: e.target.value })}
                    >
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