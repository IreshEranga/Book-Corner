import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Minus, Plus, ShoppingBag, AlertCircle } from 'lucide-react';

// Adjust this if your Order Service runs on a different port
const ORDER_API = import.meta.env.VITE_ORDER_API || 'http://localhost:3003/api/orders';

function OrderPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // State for the specific book being purchased
  const [book, setBook] = useState(null);
  
  // Order state
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // Retrieve book data passed from BookStoreHome
  useEffect(() => {
    if (location.state) {
      setBook(location.state);
      // Set initial quantity if passed, otherwise default to 1
      setQuantity(location.state.quantity || 1);
    } else {
      // If no state, redirect back to home
      Swal.fire({
        icon: 'error',
        title: 'No Book Selected',
        text: 'Please select a book to buy first.',
        background: '#1e2937',
        color: '#fff',
      });
      navigate('/');
    }
  }, [location.state, navigate]);

  const handleQuantityChange = (type) => {
    if (type === 'inc') {
      // Prevent exceeding stock if data is available
      if (book.stock && quantity < book.stock) {
        setQuantity((prev) => prev + 1);
      } else if (!book.stock) {
        setQuantity((prev) => prev + 1);
      }
    } else if (type === 'dec') {
      setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
    }
  };

  const calculateTotal = () => {
    if (!book) return 0;
    const price = Number(book.price) || 0;
    return (price * quantity).toFixed(2);
  };

  const handlePlaceOrder = async () => {
    // 1. Check Authentication
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'You must be logged in to place an order.',
        background: '#1e2937',
        color: '#fff',
      });
      navigate('/login'); // Adjust this route if your login path is different
      return;
    }

    // 2. Prepare Payload based on your Backend Schema
    const orderData = {
      items: [
        {
          productId: book.bookId || book.id, // Handle potential ID field differences
          name: book.title,
          quantity: quantity,
          price: Number(book.price),
        },
      ],
      totalAmount: Number(calculateTotal()),
    };

    setLoading(true);

    try {
      const response = await fetch(ORDER_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Backend requires verifyToken
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }

      // Success
      Swal.fire({
        icon: 'success',
        title: 'Order Placed!',
        text: `Your order for "${book.title}" has been placed successfully.`,
        background: '#1e2937',
        color: '#fff',
      }).then(() => {
        navigate('/dashboard');
      });

    } catch (error) {
      console.error('Order error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Order Failed',
        text: error.message,
        background: '#1e2937',
        color: '#fff',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!book) {
    return (
      <div className="min-vh-100 bg-dark text-white d-flex align-items-center justify-content-center">
        <div className="text-center">
          <ShoppingBag size={48} className="mb-3 text-secondary" />
          <p>Loading book details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-dark text-white py-5">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <button
            className="btn btn-outline-light mb-3"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} className="me-2" />
            Back to Store
          </button>
          <h2 className="fw-bold">Checkout</h2>
          <p className="text-white-50">Review your order and confirm purchase</p>
        </motion.div>

        <div className="row g-4">
          {/* Left Column: Book Details */}
          <div className="col-lg-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card bg-black border-secondary h-100"
            >
              <div className="card-body d-flex flex-column align-items-center text-center p-4">
                <img
                  src={book.imageUrl || book.image || 'https://via.placeholder.com/200x300?text=Book'}
                  alt={book.title}
                  className="rounded mb-4"
                  style={{
                    width: '200px',
                    height: '280px',
                    objectFit: 'cover',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                  }}
                />
                <h4 className="fw-bold">{book.title}</h4>
                <p className="text-white-50 mb-1">by {book.author}</p>
                <span className="badge bg-secondary mb-3">
                  {book.category || 'General'}
                </span>
                <div className="mt-auto pt-3 border-top border-secondary w-100">
                  <p className="text-white-50 small mb-0">Price per unit</p>
                  <h3 className="text-info fw-bold mb-0">
                    ${Number(book.price).toFixed(2)}
                  </h3>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Order Form */}
          <div className="col-lg-7">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card bg-black border-secondary"
            >
              <div className="card-header border-secondary bg-transparent">
                <h5 className="mb-0">Order Summary</h5>
              </div>
              <div className="card-body">
                {/* Quantity Selector */}
                <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary">
                  <span className="text-white-50">Quantity</span>
                  <div className="d-flex align-items-center gap-3">
                    <button
                      className="btn btn-outline-light btn-sm px-2"
                      onClick={() => handleQuantityChange('dec')}
                      disabled={quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="fs-5 fw-bold px-3">{quantity}</span>
                    <button
                      className="btn btn-outline-light btn-sm px-2"
                      onClick={() => handleQuantityChange('inc')}
                      disabled={book.stock && quantity >= book.stock}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Stock Warning */}
                {book.stock && book.stock <= 5 && (
                  <div className="alert alert-warning d-flex align-items-center py-2 small" role="alert">
                    <AlertCircle size={16} className="me-2" />
                    Only {book.stock} items left in stock!
                  </div>
                )}

                {/* Calculations */}
                <div className="mb-2 d-flex justify-content-between">
                  <span className="text-white-50">Subtotal</span>
                  <span>${(Number(book.price) * quantity).toFixed(2)}</span>
                </div>
                <div className="mb-4 d-flex justify-content-between">
                  <span className="text-white-50">Shipping</span>
                  <span className="text-success">Free</span>
                </div>

                <div className="d-flex justify-content-between border-top border-secondary pt-3 mb-4">
                  <h5 className="mb-0">Total Amount</h5>
                  <h4 className="mb-0 text-info">${calculateTotal()}</h4>
                </div>

                <button
                  className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 fw-bold"
                  onClick={handlePlaceOrder}
                  disabled={loading || (book.stock !== undefined && book.stock <= 0)}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} />
                      Place Order
                    </>
                  )}
                </button>

                <p className="text-white-50 small text-center mt-3 mb-0">
                  By placing this order, you agree to our terms of service.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderPage;