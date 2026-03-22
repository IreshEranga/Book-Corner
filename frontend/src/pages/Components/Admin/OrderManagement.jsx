// src/Components/Admin/OrderManagement.jsx
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Truck, Package, CheckCircle, XCircle, Clock, RefreshCw, Eye } from 'lucide-react';

const ORDER_API = import.meta.env.VITE_ORDER_API || 'http://localhost:3003/api/orders';

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1 });
  const [filters, setFilters] = useState({ page: 1, limit: 10, status: '' });
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`${ORDER_API}?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch orders');

      const data = await response.json();
      setOrders(data.orders || []);
      setPagination(data.pagination || { totalPages: 1, currentPage: filters.page });
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${ORDER_API}/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Update failed');

      Swal.fire('Updated!', 'Order status has been updated.', 'success');
      fetchOrders(); // Refresh list
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={14} className="me-1" />;
      case 'confirmed': return <Package size={14} className="me-1" />;
      case 'shipped': return <Truck size={14} className="me-1" />;
      case 'delivered': return <CheckCircle size={14} className="me-1" />;
      case 'cancelled': return <XCircle size={14} className="me-1" />;
      default: return null;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-warning text-dark',
      confirmed: 'bg-info',
      shipped: 'bg-primary',
      delivered: 'bg-success',
      cancelled: 'bg-danger'
    };
    return `${colors[status] || 'bg-secondary'} badge d-flex align-items-center`;
  };

  return (
    <div className="card bg-black border-secondary">
      <div className="card-header border-secondary bg-transparent d-flex justify-content-between align-items-center">
        <h5 className="mb-0">All Orders</h5>
        <button onClick={fetchOrders} className="btn btn-sm btn-outline-light">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Filters */}
      <div className="card-body border-bottom border-secondary">
        <div className="row g-3">
          <div className="col-md-4">
            <select 
              className="form-select bg-dark text-white border-secondary"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-dark table-hover align-middle mb-0">
          <thead>
            <tr className="border-secondary text-white-50">
              <th>Order ID</th>
              {/* <th>Customer</th> */}
              <th>Items</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-5 text-white-50">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="border-secondary">
                  <td className="text-info fw-bold">
                    #{order._id.substring(order._id.length - 8).toUpperCase()}
                  </td>
                  {/* <td>
                    <span className="fw-bold">{order.username}</span>
                    <br />
                    <small className="text-white-50">ID: {order.userId}</small>
                  </td> */}
                  <td style={{ maxWidth: '200px' }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="small text-truncate">
                        {item.name} <span className="text-white-50">(x{item.quantity})</span>
                      </div>
                    ))}
                  </td>
                  <td className="fw-bold">${order.totalAmount.toFixed(2)}</td>
                  <td>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={getStatusBadge(order.status)}>
                      {getStatusIcon(order.status)} {order.status}
                    </span>
                  </td>
                  <td className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                      <button 
                        className="btn btn-sm btn-outline-light"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye size={14} />
                      </button>
                      {/* Quick Status Update Dropdown */}
                      <select 
                        className="form-select form-select-sm bg-dark text-white border-secondary"
                        style={{ width: 'auto' }}
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirm</option>
                        <option value="shipped">Ship</option>
                        <option value="delivered">Deliver</option>
                        <option value="cancelled">Cancel</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="card-footer bg-black d-flex justify-content-between align-items-center p-3 border-top border-secondary">
        <small className="text-white-50">
          Page {pagination.currentPage} of {pagination.totalPages}
        </small>
        <div className="btn-group">
          <button 
            className="btn btn-sm btn-outline-light"
            disabled={pagination.currentPage === 1}
            onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
          >
            Previous
          </button>
          <button 
            className="btn btn-sm btn-outline-light"
            disabled={pagination.currentPage >= pagination.totalPages}
            onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
          >
            Next
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content bg-dark text-white border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title">
                  Order #{selectedOrder._id.substring(selectedOrder._id.length - 8).toUpperCase()}
                </h5>
                <button className="btn-close btn-close-white" onClick={() => setSelectedOrder(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="text-white-50 small">Customer</label>
                    <p className="fw-bold mb-0">{selectedOrder.username}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="text-white-50 small">Order Date</label>
                    <p className="fw-bold mb-0">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <h6 className="mb-3">Items Ordered</h6>
                <ul className="list-group list-group-flush bg-transparent">
                  {selectedOrder.items.map((item, idx) => (
                    <li key={idx} className="list-group-item bg-transparent border-secondary d-flex justify-content-between">
                      <div>
                        <span className="fw-bold">{item.name}</span>
                        <br />
                        <small className="text-white-50">Price: ${item.price.toFixed(2)}</small>
                      </div>
                      <div className="text-end">
                        <span className="badge bg-secondary">x{item.quantity}</span>
                        <br />
                        <small className="text-info fw-bold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </small>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="d-flex justify-content-between mt-4 pt-3 border-top border-secondary">
                  <h5 className="mb-0">Total Amount</h5>
                  <h4 className="mb-0 text-info">${selectedOrder.totalAmount.toFixed(2)}</h4>
                </div>
              </div>
              <div className="modal-footer border-secondary">
                <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderManagement;