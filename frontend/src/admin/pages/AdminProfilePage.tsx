import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminService } from '../services/adminService';
import { ShieldCheck, LogOut, Lock } from 'lucide-react';

export const AdminProfilePage: React.FC = () => {
  const { adminUser, logout } = useAdminAuth();
  const [profile, setProfile] = useState<any>(adminUser);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await adminService.getProfile();
      if (res.data) setProfile(res.data);
    } catch {
      // Keep adminUser fallback
    }
  };

  const initial = profile?.name ? profile.name.charAt(0).toUpperCase() : 'A';

  return (
    <div className="d-flex flex-column gap-4 mx-auto" style={{ maxWidth: '650px' }}>
      {/* Profile Overview Card */}
      <div className="admin-card p-4 p-md-5 text-center">
        <div className="admin-avatar-lg mb-3">
          {initial}
        </div>

        <h3 className="fw-bold text-white mb-1">{profile?.name || 'Platform Administrator'}</h3>
        <p className="font-monospace text-info small mb-3">{profile?.email || 'admin@fundtogether.org'}</p>

        <div className="d-inline-flex align-items-center gap-2 mb-4">
          <span className="admin-badge admin-badge-warning py-1 px-3 fs-6">
            <ShieldCheck size={16} className="me-1" /> Role: {profile?.role?.toUpperCase() || 'ADMINISTRATOR'}
          </span>
        </div>

        <div className="p-3 rounded border border-secondary border-opacity-10 text-start font-monospace small mb-4 bg-dark">
          <div className="d-flex justify-content-between py-1">
            <span className="text-white-50">Admin User ID:</span>
            <span className="text-white fw-bold">{profile?.id || profile?._id || '65b2a3f1...'}</span>
          </div>
          <div className="d-flex justify-content-between py-1">
            <span className="text-white-50">Account Status:</span>
            <span className="text-success fw-bold">Active Master Administrator</span>
          </div>
          <div className="d-flex justify-content-between py-1">
            <span className="text-white-50">Authentication Type:</span>
            <span className="text-warning fw-bold">Email + Bcrypt Password + JWT</span>
          </div>
        </div>

        <button onClick={logout} className="admin-btn admin-btn-danger w-100 justify-content-center py-3 fs-6">
          <LogOut size={18} /> Sign Out of Admin Session
        </button>
      </div>

      {/* Security & Token Info Card */}
      <div className="admin-card p-4">
        <h6 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
          <Lock size={18} color="var(--admin-accent-primary)" />
          <span>Admin Authorization Guidelines</span>
        </h6>

        <ul className="list-unstyled text-white-50 small mb-0 d-flex flex-column gap-2">
          <li className="d-flex align-items-start gap-2">
            <span className="text-success fw-bold">&bull;</span>
            <span>Admin accounts are pre-created in MongoDB via developers using <code>npm run seed:admin</code> script.</span>
          </li>
          <li className="d-flex align-items-start gap-2">
            <span className="text-success fw-bold">&bull;</span>
            <span>JWT tokens expire after 7 days. Upon expiration, you will be automatically redirected to <code>/admin/login</code>.</span>
          </li>
          <li className="d-flex align-items-start gap-2">
            <span className="text-success fw-bold">&bull;</span>
            <span>All campaign approval and rejection audit actions are logged on-chain and in MongoDB.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
