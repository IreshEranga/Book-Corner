import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { ShoppingBag, User, LogOut, Heart, ShoppingCart, Search, BookOpen } from 'lucide-react';
import logo from '../../assets/logo.png';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/auth';

function CustomerDashBoard() {
  const [user, setUser] = useState({ username: '', role: 'customer' });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fake featured books (later connect to product-catalog-service)
  const featuredBooks = [
    { id: 1, title: "The Midnight Library", author: "Matt Haig", price: 18.99, img: "https://picsum.photos/id/1015/300/400" },
    { id: 2, title: "Atomic Habits", author: "James Clear", price: 14.99, img: "https://picsum.photos/id/201/300/400" },
    { id: 3, title: "Dune Messiah", author: "Frank Herbert", price: 22.50, img: "https://picsum.photos/id/301/300/400" },
    { id: 4, title: "The Psychology of Money", author: "Morgan Housel", price: 16.99, img: "https://picsum.photos/id/401/300/400" },
  ];

  const categories = ["Fiction", "Non-Fiction", "Sci-Fi", "Self-Help", "Mystery", "Biography"];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username') || 'BookLover';
    const role = localStorage.getItem('role') || 'customer';

    if (!token) {
      navigate('/login');
      return;
    }

    setUser({ username, role });

    // Welcome SweetAlert on dashboard load
    Swal.fire({
      icon: 'success',
      title: `Welcome back, ${username}!`,
      text: 'Explore thousands of books and enjoy your shopping experience.',
      timer: 2500,
      showConfirmButton: false,
      background: '#1e2937',
      color: '#fff'
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
      confirmButtonText: 'Yes, Logout'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        navigate('/login');
      }
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Later: call product service
      Swal.fire('Search triggered!', `Looking for "${searchTerm}"... (integration coming soon)`, 'info');
    }
  };

  const addToCart = (book) => {
    Swal.fire({
      icon: 'success',
      title: 'Added to Cart!',
      text: `${book.title} has been added.`,
      toast: true,
      position: 'top-end',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const addToWishlist = (book) => {
    Swal.fire({
      icon: 'success',
      title: 'Added to Wishlist ❤️',
      toast: true,
      position: 'top-end',
      timer: 1800
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

            <button onClick={handleLogout} className="btn btn-outline-danger d-flex align-items-center gap-2">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* HERO BANNER */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 py-5">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-5"
          >
            <h1 className="display-3 fw-bold mb-3">Discover Your Next Great Read</h1>
            <p className="lead mb-4 text-white-50">Over 50,000 books • Free shipping on orders over $30</p>

            <form onSubmit={handleSearch} className="mx-auto" style={{ maxWidth: '600px' }}>
              <div className="input-group input-group-lg">
                <input
                  type="text"
                  className="form-control bg-white border-0"
                  placeholder="Search books, authors, genres..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="btn btn-primary px-5">
                  <Search size={24} />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      <div className="container py-5">
        <div className="row">
          {/* MAIN CONTENT */}
          <div className="col-lg-9">
            {/* CATEGORIES */}
            <div className="mb-5">
              <h5 className="mb-3 fw-semibold">Browse by Category</h5>
              <div className="d-flex gap-2 flex-wrap">
                {categories.map((cat, i) => (
                  <motion.span
                    key={i}
                    whileHover={{ scale: 1.1 }}
                    className="badge bg-white text-dark px-4 py-3 rounded-pill fs-6 cursor-pointer"
                    style={{ cursor: 'pointer' }}
                  >
                    {cat}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* FEATURED BOOKS - CREATIVE GRID */}
            <h5 className="mb-4 fw-semibold d-flex align-items-center gap-2">
              <BookOpen size={28} /> Featured This Week
            </h5>
            
            <div className="row g-4">
              {featuredBooks.map((book, index) => (
                <div key={book.id} className="col-md-6 col-lg-4">
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="card h-100 border-0 shadow-lg overflow-hidden bg-dark text-white"
                  >
                    <img 
                      src={book.img} 
                      className="card-img-top" 
                      alt={book.title}
                      style={{ height: '320px', objectFit: 'cover' }}
                    />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title fw-bold">{book.title}</h5>
                      <p className="text-white-50 small mb-3">by {book.author}</p>
                      <div className="mt-auto d-flex justify-content-between align-items-end">
                        <h4 className="text-purple mb-0">${book.price}</h4>
                        <div className="d-flex gap-2">
                          <button 
                            onClick={() => addToWishlist(book)}
                            className="btn btn-outline-light btn-sm"
                          >
                            <Heart size={18} />
                          </button>
                          <button 
                            onClick={() => addToCart(book)}
                            className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                          >
                            <ShoppingCart size={18} /> Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDEBAR - QUICK STATS & UX */}
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
                    <button className="btn btn-outline-light text-start">❤️ Wishlist (3)</button>
                    <button className="btn btn-outline-light text-start">🛒 Cart (2 items)</button>
                    <button className="btn btn-outline-light text-start">📚 Reading List</button>
                  </div>
                </div>
              </div>

              {/* MINI RECOMMENDATION */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="bg-gradient-to-br from-purple-900 to-indigo-900 p-4 rounded-4 text-center"
              >
                <h6 className="mb-3">Recommended for you</h6>
                <img 
                  src="https://picsum.photos/id/201/280/180" 
                  className="rounded-3 mb-3" 
                  style={{ width: '100%' }} 
                  alt="rec"
                />
                <p className="fw-medium mb-1">Project Hail Mary</p>
                <small className="text-white-50">Andy Weir • Sci-Fi</small>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER BAR */}
      <footer className="bg-black py-4 text-center text-white-50 small">
        © 2026 BookCorner • Built for SE4010 Assignment • All rights reserved
      </footer>
    </div>
  );
}

export default CustomerDashBoard;