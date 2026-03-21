import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { User, LogOut } from 'lucide-react';
import logo from '../../assets/logo.png';
import BookStoreHome from '../Components/Customer/BookStoreHome';

function CustomerDashBoard() {
  const [user, setUser] = useState({ username: '', role: 'customer' });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username') || 'BookLover';
    const role = localStorage.getItem('role') || 'customer';

    if (!token) {
      navigate('/login');
      return;
    }

    setUser({ username, role });

    Swal.fire({
      icon: 'success',
      title: `Welcome back, ${username}!`,
      text: 'Explore books and enjoy your shopping experience.',
      timer: 2000,
      showConfirmButton: false,
      background: '#1e2937',
      color: '#fff',
    });
  }, [navigate]);

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout?',
      text: 'You will be redirected to login page.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Logout',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        navigate('/login');
      }
    });
  };

  return (
    <div className="min-vh-100 bg-dark text-white">
      {/* TOP NAV */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-black sticky-top shadow">
        <div className="container">
          <div className="d-flex align-items-center gap-3">
            <img src={logo} alt="BookCorner" width="45" className="rounded-circle" />
            <h4 className="mb-0 fw-bold text-purple">BookCorner</h4>
          </div>

          <div className="d-flex align-items-center gap-4">
            <div className="d-flex align-items-center gap-2">
              <User size={22} />
              <span className="fw-medium">{user.username}</span>
              <span className="badge bg-success">Customer</span>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-outline-danger d-flex align-items-center gap-2"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN LAYOUT */}
      <div className="container py-4">
        <div className="row">
          {/* MAIN CONTENT AREA */}
          <div className="col-lg-9">
            <BookStoreHome />
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="col-lg-3">
            <div className="sticky-top" style={{ top: '90px' }}>
              <div className="card bg-black border-0 shadow mb-4">
                <div className="card-body text-center py-4">
                  <h6 className="text-white-50 mb-1">Your Reading Points</h6>
                  <h2 className="fw-bold text-purple mb-0">1,245</h2>
                  <small className="text-success">+120 this month</small>
                </div>
              </div>

              <div className="card bg-black border-0 shadow mb-4">
                <div className="card-body">
                  <h6 className="mb-3">Quick Links</h6>
                  <div className="d-grid gap-2">
                    <button className="btn btn-outline-light text-start">📖 My Orders</button>
                    <button className="btn btn-outline-light text-start">❤️ Wishlist</button>
                    <button className="btn btn-outline-light text-start">🛒 Cart</button>
                    <button className="btn btn-outline-light text-start">📚 Reading List</button>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900 to-indigo-900 p-4 rounded-4 text-center">
                <h6 className="mb-3">Recommended for you</h6>
                <img
                  src="https://picsum.photos/id/201/280/180"
                  className="rounded-3 mb-3"
                  style={{ width: '100%' }}
                  alt="Recommended Book"
                />
                <p className="fw-medium mb-1">Project Hail Mary</p>
                <small className="text-white-50">Andy Weir • Sci-Fi</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-black py-4 text-center text-white-50 small">
        © 2026 BookCorner • Built for SE4010 Assignment • All rights reserved
      </footer>
    </div>
  );
}

export default CustomerDashBoard;