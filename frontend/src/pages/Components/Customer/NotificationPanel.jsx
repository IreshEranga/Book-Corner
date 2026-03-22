import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { Bell, CheckCheck } from 'lucide-react';

const NOTIFICATION_API =
  import.meta.env.VITE_NOTIFICATION_API || 'http://localhost:3004/api/notifications';

function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const token = localStorage.getItem('token');

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.readAt).length,
    [notifications]
  );

  const fetchNotifications = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${NOTIFICATION_API}/me?limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load notifications');
      }

      const data = await response.json();
      setNotifications(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Notification Error',
        text: 'Could not load notifications.',
        background: '#1e2937',
        color: '#fff',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Keep polling lightweight for prototype UX.
    const id = setInterval(fetchNotifications, 30000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`${NOTIFICATION_API}/${id}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, readAt: new Date().toISOString(), status: 'read' } : item
        )
      );
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Could not mark notification as read.',
        background: '#1e2937',
        color: '#fff',
      });
    }
  };

  return (
    <>
      <button
        className="btn btn-outline-light position-relative d-flex align-items-center"
        onClick={() => {
          setOpen(true);
          fetchNotifications();
        }}
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="modal-dialog modal-dialog-scrollable modal-md modal-dialog-centered">
            <div className="modal-content bg-dark text-white border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title d-flex align-items-center gap-2 mb-0">
                  <Bell size={18} /> Notifications
                </h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                ></button>
              </div>

              <div className="modal-body">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-light" role="status"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <p className="text-white-50 mb-0">No notifications yet.</p>
                ) : (
                  <div className="list-group list-group-flush">
                    {notifications.map((item) => (
                      <div
                        key={item._id}
                        className="list-group-item bg-transparent border-secondary text-white"
                      >
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <div>
                            <h6 className="mb-1">{item.title}</h6>
                            <p className="mb-1 small text-white-50">{item.message}</p>
                            <small className="text-white-50">
                              {new Date(item.createdAt).toLocaleString()}
                            </small>
                          </div>
                          {!item.readAt && (
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => markAsRead(item._id)}
                              title="Mark as read"
                            >
                              <CheckCheck size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-footer border-secondary">
                <button className="btn btn-outline-light" onClick={fetchNotifications}>
                  Refresh
                </button>
                <button className="btn btn-secondary" onClick={() => setOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default NotificationPanel;
