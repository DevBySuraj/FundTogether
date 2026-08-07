import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { Bell, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

export const AdminNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header */}
      <div className="admin-card p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="admin-avatar-md">
            <Bell size={20} />
          </div>
          <div>
            <h4 className="fw-bold text-white mb-0">System Notifications &amp; Audit Alerts</h4>
            <span className="admin-subtext">Real-time alerts for campaign submissions and AI risk flags.</span>
          </div>
        </div>

        <button className="admin-btn admin-btn-secondary" onClick={markAllRead}>
          Mark All as Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="d-flex flex-column gap-3">
        {isLoading ? (
          <div className="text-center py-5 text-white-50">
            <div className="spinner-border text-primary me-2"></div>
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="admin-card p-5 text-center text-white-50">
            <Bell size={32} className="mb-2" />
            <h5 className="fw-bold text-white">No Unread Notifications</h5>
          </div>
        ) : (
          notifications.map((item) => (
            <div key={item.id} className="admin-card p-4 d-flex align-items-start gap-3">
              <div className="p-2 rounded bg-dark border border-secondary border-opacity-20 text-white">
                {item.type === 'danger' ? (
                  <AlertTriangle size={20} className="text-danger" />
                ) : item.type === 'warning' ? (
                  <RefreshCw size={20} className="text-warning" />
                ) : (
                  <CheckCircle size={20} className="text-success" />
                )}
              </div>

              <div className="flex-fill">
                <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
                  <h6 className="fw-bold text-white mb-0">{item.title}</h6>
                  <span className="admin-subtext">{item.timestamp}</span>
                </div>
                <p className="small text-white-50 mb-0">{item.message}</p>
              </div>

              {item.unread && (
                <span className="badge rounded-pill bg-primary" style={{ fontSize: '0.65rem' }}>
                  NEW
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
