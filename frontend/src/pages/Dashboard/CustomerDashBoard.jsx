// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Swal from 'sweetalert2';
// import { User, LogOut } from 'lucide-react';
// import logo from '../../assets/logo.png';
// import BookStoreHome from '../Components/Customer/BookStoreHome';

// function CustomerDashBoard() {
//   const [user, setUser] = useState({ username: '', role: 'customer' });
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const username = localStorage.getItem('username') || 'BookLover';
//     const role = localStorage.getItem('role') || 'customer';

//     if (!token) {
//       navigate('/login');
//       return;
//     }

//     setUser({ username, role });

//     Swal.fire({
//       icon: 'success',
//       title: `Welcome back, ${username}!`,
//       text: 'Explore books and enjoy your shopping experience.',
//       timer: 2000,
//       showConfirmButton: false,
//       background: '#1e2937',
//       color: '#fff',
//     });
//   }, [navigate]);

//   const handleLogout = () => {
//     Swal.fire({
//       title: 'Logout?',
//       text: 'You will be redirected to login page.',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#7c3aed',
//       cancelButtonColor: '#6b7280',
//       confirmButtonText: 'Yes, Logout',
//     }).then((result) => {
//       if (result.isConfirmed) {
//         localStorage.clear();
//         navigate('/login');
//       }
//     });
//   };

//   return (
//     <div className="min-vh-100 bg-dark text-white">
//       {/* TOP NAV */}
//       <nav className="navbar navbar-expand-lg navbar-dark bg-black sticky-top shadow">
//         <div className="container">
//           <div className="d-flex align-items-center gap-3">
//             <img src={logo} alt="BookCorner" width="45" className="rounded-circle" />
//             <h4 className="mb-0 fw-bold text-purple">BookCorner</h4>
//           </div>

//           <div className="d-flex align-items-center gap-4">
//             <div className="d-flex align-items-center gap-2">
//               <User size={22} />
//               <span className="fw-medium">{user.username}</span>
//               <span className="badge bg-success">Customer</span>
//             </div>

//             <button
//               onClick={handleLogout}
//               className="btn btn-outline-danger d-flex align-items-center gap-2"
//             >
//               <LogOut size={18} /> Logout
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* MAIN LAYOUT */}
//       <div className="container py-4">
//         <div className="row">
//           {/* MAIN CONTENT AREA */}
//           <div className="col-lg-9">
//             <BookStoreHome />
//           </div>

//           {/* RIGHT SIDEBAR */}
//           <div className="col-lg-3">
//             <div className="sticky-top" style={{ top: '90px' }}>
//               <div className="card bg-black border-0 shadow mb-4">
//                 <div className="card-body text-center py-4">
//                   <h6 className="text-white-50 mb-1">Your Reading Points</h6>
//                   <h2 className="fw-bold text-purple mb-0">1,245</h2>
//                   <small className="text-success">+120 this month</small>
//                 </div>
//               </div>

//               <div className="card bg-black border-0 shadow mb-4">
//                 <div className="card-body">
//                   <h6 className="mb-3">Quick Links</h6>
//                   <div className="d-grid gap-2">
//                     <button className="btn btn-outline-light text-start">📖 My Orders</button>
//                     <button className="btn btn-outline-light text-start">❤️ Wishlist</button>
//                     <button className="btn btn-outline-light text-start">🛒 Cart</button>
//                     <button className="btn btn-outline-light text-start">📚 Reading List</button>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-gradient-to-br from-purple-900 to-indigo-900 p-4 rounded-4 text-center">
//                 <h6 className="mb-3">Recommended for you</h6>
//                 <img
//                   src="https://picsum.photos/id/201/280/180"
//                   className="rounded-3 mb-3"
//                   style={{ width: '100%' }}
//                   alt="Recommended Book"
//                 />
//                 <p className="fw-medium mb-1">Project Hail Mary</p>
//                 <small className="text-white-50">Andy Weir • Sci-Fi</small>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* FOOTER */}
//       <footer className="bg-black py-4 text-center text-white-50 small">
//         © 2026 BookCorner • Built for SE4010 Assignment • All rights reserved
//       </footer>
//     </div>
//   );
// }

// export default CustomerDashBoard;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { User, LogOut, BookOpen, ShoppingBag, Box, Eye } from 'lucide-react';
import logo from '../../assets/logo.png';
import BookStoreHome from '../Components/Customer/BookStoreHome';
// COLLAB-SAFE: Added notification UI component import.
import NotificationPanel from '../Components/Customer/NotificationPanel';

const ORDER_API = import.meta.env.VITE_ORDER_API || 'http://localhost:3003/api/orders';

function CustomerDashBoard() {
  const [user, setUser] = useState({ username: '', role: 'customer' });
  const [activeTab, setActiveTab] = useState('home'); // 'home' or 'orders'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
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
  }, [navigate]);

  // Fetch orders when the tab switches to 'orders'
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchMyOrders();
    }
  }, [activeTab]);

  const fetchMyOrders = async () => {
    setLoadingOrders(true);
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${ORDER_API}/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not load your orders.',
        background: '#1e2937',
        color: '#fff',
      });
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout?',
      text: 'You will be redirected to login page.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Logout',
      background: '#1e2937',
      color: '#fff',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        navigate('/login');
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
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

            {/* COLLAB-SAFE: Added notification entry point in top navigation. */}
            <NotificationPanel />

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
          {/* LEFT SIDEBAR - Controls */}
          <div className="col-lg-3 mb-4 mb-lg-0">
             <div className="sticky-top" style={{ top: '90px' }}>
              {/* User Card */}
              <div className="card bg-black border-secondary mb-4">
                <div className="card-body text-center py-4">
                  <div className="bg-secondary bg-opacity-25 rounded-circle d-inline-flex p-3 mb-3">
                    <User size={32} className="text-purple" />
                  </div>
                  <h5 className="mb-0">{user.username}</h5>
                  <small className="text-white-50">Customer Dashboard</small>
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="card bg-black border-secondary">
                <div className="card-body p-2">
                  <div className="d-grid gap-2">
                    <button 
                      className={`btn d-flex align-items-center justify-content-start gap-2 ${activeTab === 'home' ? 'btn-primary' : 'btn-outline-light'}`}
                      onClick={() => setActiveTab('home')}
                    >
                      <BookOpen size={18} /> Browse Books
                    </button>
                    <button 
                      className={`btn d-flex align-items-center justify-content-start gap-2 ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline-light'}`}
                      onClick={() => setActiveTab('orders')}
                    >
                      <Box size={18} /> My Orders
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="col-lg-9">
            {activeTab === 'home' ? (
              <BookStoreHome />
            ) : (
              /* ORDERS VIEW */
              <div className="card bg-black border-secondary">
                <div className="card-header border-secondary bg-transparent d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 d-flex align-items-center gap-2">
                    <ShoppingBag size={20} /> My Orders
                  </h5>
                  <button className="btn btn-sm btn-outline-light" onClick={fetchMyOrders}>
                    Refresh
                  </button>
                </div>
                <div className="card-body">
                  {loadingOrders ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-5 text-white-50">
                      <Box size={48} className="mb-3 opacity-50" />
                      <h5>No Orders Found</h5>
                      <p>You haven't placed any orders yet.</p>
                      <button className="btn btn-primary mt-2" onClick={() => setActiveTab('home')}>
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-dark table-hover align-middle mb-0">
                        <thead>
                          <tr className="border-secondary text-white-50">
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr key={order._id} className="border-secondary">
                              <td className="fw-bold text-info">
                                #{order._id.substring(order._id.length - 8).toUpperCase()}
                              </td>
                              <td>
                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric', month: 'short', day: 'numeric'
                                })}
                              </td>
                              <td>
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="small">
                                    {item.name} <span className="text-white-50">(x{item.quantity})</span>
                                  </div>
                                ))}
                              </td>
                              <td className="fw-bold">${order.totalAmount.toFixed(2)}</td>
                              <td>
                                <span className={`badge bg-${getStatusColor(order.status)} text-capitalize`}>
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-black py-4 text-center text-white-50 small mt-auto">
        © 2026 BookCorner • Built for SE4010 Assignment • All rights reserved
      </footer>
    </div>
  );
}

export default CustomerDashBoard;