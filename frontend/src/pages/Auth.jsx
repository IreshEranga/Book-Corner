// frontend/src/pages/Auth.jsx
// UPDATED WITH ROLE-BASED NAVIGATION (Customer / Admin / Owner)

import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User, Mail, Lock } from 'lucide-react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

import logo from '../assets/logo.png';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // ==================== LOGIN WITH ROLE-BASED NAVIGATION ====================
        const res = await axios.post(`${API_BASE}/auth/login`, {
          email: formData.email,
          password: formData.password
        });

        // Store data
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
        localStorage.setItem('userId', res.data.userId);
        // username is not returned from backend yet - using email as fallback
        localStorage.setItem('username', formData.email.split('@')[0]);

        const role = res.data.role;

        // SweetAlert with role-specific message
        await Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: `Welcome back, ${role.charAt(0).toUpperCase() + role.slice(1)}! Redirecting...`,
          timer: 2200,
          showConfirmButton: false,
          background: '#1e2937',
          color: '#fff'
        });

        // === ROLE-BASED NAVIGATION ===
        if (role === 'customer') {
          navigate('/dashboard');
        } else if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'owner') {
          navigate('/owner');
        } else {
          navigate('/dashboard'); // fallback
        }
      } else {
        // ==================== REGISTER (CUSTOMER ONLY) ====================
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        await axios.post(`${API_BASE}/auth/register`, {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: 'customer'
        });

        await Swal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          text: 'Your customer account has been created. Please login now.',
          timer: 2500,
          showConfirmButton: false,
          background: '#1e2937',
          color: '#fff'
        });

        setIsLogin(true);
        setFormData({ username: '', email: '', password: '', confirmPassword: '' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        overflow: 'hidden'
      }}
    >
      {/* Floating background icons */}
      <motion.div
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="position-absolute top-10 start-10 d-none d-lg-block"
        style={{ fontSize: '6rem', opacity: 0.08 }}
      >
        📚
      </motion.div>
      <motion.div
        animate={{ y: [0, 40, 0] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="position-absolute bottom-20 end-10 d-none d-lg-block"
        style={{ fontSize: '5rem', opacity: 0.08 }}
      >
        📖
      </motion.div>

      <div className="container">
        <div className="row g-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          {/* LEFT SIDE - IMAGE + BRANDING */}
          <div 
            className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center position-relative"
            style={{
              backgroundImage: `url(${logo})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              minHeight: '600px'
            }}
          >
            <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-60"></div>
            
            <div className="position-relative text-center text-white px-5">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mx-auto mb-4"
              >
                <div className="bg-white bg-opacity-20 rounded-4 p-4 d-inline-flex">
                  <ShoppingBag size={80} color="#fff" />
                </div>
              </motion.div>
              
              <h1 className="display-4 fw-bold mb-3">BookCorner</h1>
              <p className="lead mb-5">Your modern bookstore marketplace</p>
            </div>
          </div>

          {/* RIGHT SIDE - FORM */}
          <div className="col-lg-6 bg-white bg-opacity-10 backdrop-blur-3xl p-5 p-lg-5" style={{ minHeight: '600px' }}>
            
            <div className="d-flex align-items-center gap-3 mb-4">
              <img 
                src={logo} 
                alt="BookCorner Logo" 
                className="rounded-circle" 
                width="50" 
                height="50"
              />
              <h2 className="text-white fw-bold mb-0">Welcome to BookCorner</h2>
            </div>

            {/* Tabs */}
            <ul className="nav nav-tabs nav-fill mb-4 border-0" role="tablist">
              <li className="nav-item">
                <button 
                  className={`nav-link fw-semibold fs-5 ${isLogin ? 'active text-white border-white' : 'text-white-50'}`}
                  onClick={() => setIsLogin(true)}
                  style={{ background: 'transparent' }}
                >
                  Login
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link fw-semibold fs-5 ${!isLogin ? 'active text-white border-white' : 'text-white-50'}`}
                  onClick={() => setIsLogin(false)}
                  style={{ background: 'transparent' }}
                >
                  Register (Customer)
                </button>
              </li>
            </ul>

            <AnimatePresence mode="wait">
              <motion.form
                key={isLogin ? 'login' : 'register'}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                onSubmit={handleSubmit}
                className="text-white"
              >
                {!isLogin && (
                  <div className="mb-3">
                    <label className="form-label text-white-50">Username</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white bg-opacity-10 border-0 text-white"><User size={20} /></span>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="form-control bg-white bg-opacity-10 border-0 text-white placeholder:text-white-50"
                        placeholder="JohnDoe"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label text-white-50">Email address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white bg-opacity-10 border-0 text-white"><Mail size={20} /></span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-control bg-white bg-opacity-10 border-0 text-white placeholder:text-white-50"
                      placeholder="you@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label text-white-50">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white bg-opacity-10 border-0 text-white"><Lock size={20} /></span>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="form-control bg-white bg-opacity-10 border-0 text-white placeholder:text-white-50"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className="mb-3">
                    <label className="form-label text-white-50">Confirm Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white bg-opacity-10 border-0 text-white"><Lock size={20} /></span>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="form-control bg-white bg-opacity-10 border-0 text-white placeholder:text-white-50"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                )}

                {error && <div className="alert alert-danger py-2 text-center">{error}</div>}

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={loading}
                  type="submit"
                  className="btn btn-primary w-100 py-3 fw-bold fs-5 rounded-3 shadow"
                  style={{ background: 'linear-gradient(90deg, #7c3aed, #4f46e5)', border: 'none' }}
                >
                  {loading 
                    ? 'Processing...' 
                    : isLogin 
                      ? 'Sign In' 
                      : 'Create Customer Account'
                  }
                </motion.button>

                <div className="text-center mt-4 text-white-50">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-decoration-underline text-white fw-medium border-0 bg-transparent"
                  >
                    {isLogin ? 'Register now' : 'Login'}
                  </button>
                </div>
              </motion.form>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;