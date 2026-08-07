import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@fundtogether.org');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!password || !password.trim()) {
        throw new Error('Password is required.');
      }
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('Admin Login Error:', err);
      const msg = err.response?.data?.message || err.message || 'Invalid admin credentials.';
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 p-3" style={{ background: '#090d16' }}>
      <div className="admin-card p-4 p-md-5 w-100" style={{ maxWidth: '450px' }}>
        {/* Logo Header */}
        <div className="text-center mb-4">
          <div className="admin-avatar-lg mb-3">
            <ShieldCheck size={36} color="#fff" />
          </div>

          <h3 className="fw-bold text-white mb-1" style={{ letterSpacing: '-0.5px' }}>
            Administrator Access
          </h3>
          <p className="admin-subtext">
            Sign in to FundTogether Verification &amp; Security Console
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded d-flex align-items-center gap-2 alert alert-danger">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <div>
            <label className="form-label small text-uppercase fw-bold text-white-50 mb-1">
              Admin Email Address
            </label>
            <div className="position-relative">
              <Mail size={18} className="admin-search-icon" />
              <input
                type="email"
                className="form-control admin-input w-100 ps-5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fundtogether.org"
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label small text-uppercase fw-bold text-white-50 mb-1">
              Admin Password
            </label>
            <div className="position-relative">
              <Lock size={18} className="admin-search-icon" />
              <input
                type="password"
                className="form-control admin-input w-100 ps-5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="admin-btn admin-btn-primary justify-content-center py-3 w-100 mt-2 fs-6"
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1"></span>
                <span>Authenticating JWT...</span>
              </>
            ) : (
              <>
                <span>Sign In to Admin Console</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-top border-secondary border-opacity-10">
          <small className="admin-subtext">
            Protected Area. Unauthorized access is logged and strictly prohibited.
          </small>
        </div>
      </div>
    </div>
  );
};
