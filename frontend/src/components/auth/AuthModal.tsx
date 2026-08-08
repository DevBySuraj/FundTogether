import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useWeb3 } from '../../context/Web3Context';
import { authAPI } from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { account, user, setUserSession, disconnectWallet } = useWeb3();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<'recipient' | 'donor'>(
    user?.role === 'recipient' || user?.role === 'user' ? 'recipient' : 'donor'
  );

  // Form input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI status states
  const [isLoading, setIsLoading] = useState(false);
  const [loginMessage, setLoginMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrorMessage(null);
    setLoginMessage(null);
  };

  const switchMode = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    resetForm();
  };

  // Google OAuth Login
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (!credentialResponse.credential) {
        throw new Error('No Google OAuth credential received.');
      }

      const res = await authAPI.googleLogin(credentialResponse.credential, activeTab);
      const token = res.data?.token || res.token;
      const loggedUser = res.data?.user || res.user;

      if (!token || !loggedUser) {
        throw new Error('Invalid authentication response from backend server.');
      }

      setUserSession(loggedUser, token);
      setLoginMessage(`Authenticated as ${loggedUser.name || loggedUser.email} (${loggedUser.role.toUpperCase()})`);

      setTimeout(() => {
        setIsLoading(false);
        onClose();
        handleRoleRedirect(loggedUser.role);
      }, 500);
    } catch (err: any) {
      console.error('Google Auth backend error:', err);
      const msg = err.response?.data?.message || err.message || 'Google authentication failed.';
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  // Email + Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authAPI.login({ email, password });
      const token = res.data?.token || res.token;
      const loggedUser = res.data?.user || res.user;

      if (!token || !loggedUser) {
        throw new Error('Invalid authentication response from server.');
      }

      setUserSession(loggedUser, token);
      setLoginMessage(`Login successful! Welcome back, ${loggedUser.name || loggedUser.email}`);

      setTimeout(() => {
        setIsLoading(false);
        onClose();
        handleRoleRedirect(loggedUser.role);
      }, 500);
    } catch (err: any) {
      console.error('Email Login Error:', err);
      const msg = err.response?.data?.message || err.message || 'Invalid email or password';
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  // Email + Password Registration
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name || name.trim() === '') {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please check and try again.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authAPI.register({
        name,
        email,
        password,
        role: activeTab,
      });

      const token = res.data?.token || res.token;
      const loggedUser = res.data?.user || res.user;

      if (!token || !loggedUser) {
        throw new Error('Invalid registration response from server.');
      }

      setUserSession(loggedUser, token);
      setLoginMessage(`Account registered successfully as ${loggedUser.role.toUpperCase()}!`);

      setTimeout(() => {
        setIsLoading(false);
        onClose();
        handleRoleRedirect(loggedUser.role);
      }, 500);
    } catch (err: any) {
      console.error('Registration Error:', err);
      const msg = err.response?.data?.message || err.message || 'Registration failed.';
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  // Role Redirect Handler
  const handleRoleRedirect = (role: string) => {
    const lower = (role || '').toLowerCase();
    if (lower === 'admin') {
      window.location.href = '/admin';
    } else if (lower === 'recipient' || lower === 'user') {
      window.location.hash = '#campaignsSection';
    } else {
      window.location.hash = '#campaignsSection';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content brutal-modal" style={{ maxWidth: '520px' }}>
          {/* Header */}
          <div className="modal-header d-flex justify-content-between align-items-center bg-dark text-white p-3">
            <div>
              <h4 className="modal-title fw-black text-uppercase mb-0 text-white">
                <i className="bi bi-shield-lock-fill text-warning me-2"></i>
                {user ? 'Account Status' : authMode === 'login' ? 'Sign In to FundTogether' : 'Register New Account'}
              </h4>
              <small className="text-warning fw-bold">
                {user
                  ? 'Authenticated User Session'
                  : authMode === 'login'
                    ? 'Google OAuth & Email / Password Login'
                    : 'Create Recipient or Donor Account'}
              </small>
            </div>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-white">
            {/* If user is ALREADY signed in */}
            {user ? (
              <div className="text-center py-4 brutal-card bg-white">
                <i className="bi bi-check-circle-fill text-success fs-1 mb-2"></i>
                <h5 className="fw-bold mb-1">Authenticated Session</h5>
                <p className="font-monospace fw-bold text-primary mb-2">
                  {user?.email || (account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Authenticated')}
                </p>
                <span className="brutal-badge badge-lime mb-3 text-uppercase">
                  Role: {user?.role}
                </span>

                <p className="small text-secondary px-3 mb-3">
                  You are currently logged in to FundTogether.
                </p>

                <div className="d-flex gap-2 mt-3 px-4">
                  <button
                    onClick={() => {
                      onClose();
                      handleRoleRedirect(user.role);
                    }}
                    className="btn brutal-btn brutal-btn-lime flex-fill py-2 fw-bold"
                  >
                    Continue to Dashboard
                  </button>
                  <button onClick={disconnectWallet} className="btn brutal-btn brutal-btn-magenta py-2 fw-bold">
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              /* Unauthenticated Visitors Auth Form */
              <>
                {errorMessage && (
                  <div className="alert alert-danger fw-bold small mb-3 text-center border border-2 border-dark">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i> {errorMessage}
                  </div>
                )}

                {loginMessage && (
                  <div className="alert alert-success fw-bold small mb-3 text-center border border-2 border-dark">
                    <i className="bi bi-check-circle-fill me-2"></i> {loginMessage}
                  </div>
                )}

                {/* ── LOGIN MODE ──────────────────────────────────────────────── */}
                {authMode === 'login' ? (
                  <div>
                    {/* Google OAuth Button */}
                    <div className="mb-3 text-center">
                      <label className="form-label fw-bold small text-uppercase text-secondary mb-2">
                        Fast Sign In with Google
                      </label>
                      <div className="d-flex justify-content-center border border-2 border-dark p-2 bg-light">
                        <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={() => setErrorMessage('Google authentication failed. Please try again.')}
                          useOneTap
                          theme="filled_blue"
                          shape="rectangular"
                          text="continue_with"
                        />
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="d-flex align-items-center my-3">
                      <hr className="flex-grow-1 border-secondary opacity-50" />
                      <span className="px-3 fw-bold text-secondary small text-uppercase">OR</span>
                      <hr className="flex-grow-1 border-secondary opacity-50" />
                    </div>

                    {/* Email + Password Form */}
                    <form onSubmit={handleEmailLogin}>
                      <div className="mb-3">
                        <label className="form-label fw-bold small text-uppercase">Email Address</label>
                        <input
                          type="email"
                          className="form-control fw-bold"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                      </div>

                      <div className="mb-4">
                        <label className="form-label fw-bold small text-uppercase">Password</label>
                        <input
                          type="password"
                          className="form-control fw-bold"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn brutal-btn brutal-btn-lime w-100 py-2 fw-black text-uppercase fs-6 mb-3"
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Authenticating...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-box-arrow-in-right me-2"></i> Log In
                          </>
                        )}
                      </button>
                    </form>

                    <div className="text-center pt-2 border-top border-1 border-dark">
                      <span className="small text-secondary fw-bold">Don't have an account? </span>
                      <button
                        type="button"
                        onClick={() => switchMode('register')}
                        className="btn btn-link text-primary fw-black p-0 text-decoration-underline small"
                      >
                        Register Now
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── REGISTRATION MODE ────────────────────────────────────────── */
                  <div>
                    {/* Role Selection Tabs (Recipient vs Donor ONLY - NO ADMIN) */}
                    <label className="form-label fw-bold small text-uppercase text-secondary mb-2 d-block text-center">
                      Select Account Type
                    </label>
                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <button
                          type="button"
                          onClick={() => setActiveTab('recipient')}
                          className={`btn brutal-btn w-100 py-2 fw-bold small ${activeTab === 'recipient' ? 'brutal-btn-lime' : ''}`}
                        >
                          <i className="bi bi-person-workspace me-1"></i> Recipient
                        </button>
                      </div>
                      <div className="col-6">
                        <button
                          type="button"
                          onClick={() => setActiveTab('donor')}
                          className={`btn brutal-btn w-100 py-2 fw-bold small ${activeTab === 'donor' ? 'brutal-btn-cyan' : ''}`}
                        >
                          <i className="bi bi-heart-fill text-danger me-1"></i> Donor
                        </button>
                      </div>
                    </div>

                    {/* Registration Form */}
                    <form onSubmit={handleEmailRegister}>
                      <div className="mb-2">
                        <label className="form-label fw-bold small text-uppercase mb-1">Full Name</label>
                        <input
                          type="text"
                          className="form-control fw-bold"
                          placeholder="Jane Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                      </div>

                      <div className="mb-2">
                        <label className="form-label fw-bold small text-uppercase mb-1">Email Address</label>
                        <input
                          type="email"
                          className="form-control fw-bold"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                      </div>

                      <div className="mb-2">
                        <label className="form-label fw-bold small text-uppercase mb-1">Password</label>
                        <input
                          type="password"
                          className="form-control fw-bold"
                          placeholder="At least 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                      </div>

                      <div className="mb-4">
                        <label className="form-label fw-bold small text-uppercase mb-1">Confirm Password</label>
                        <input
                          type="password"
                          className="form-control fw-bold"
                          placeholder="Re-enter password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn brutal-btn brutal-btn-yellow w-100 py-2 fw-black text-uppercase fs-6 mb-3"
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-person-plus-fill me-2"></i> Register {activeTab.toUpperCase()} Account
                          </>
                        )}
                      </button>
                    </form>

                    <div className="text-center pt-2 border-top border-1 border-dark">
                      <span className="small text-secondary fw-bold">Already have an account? </span>
                      <button
                        type="button"
                        onClick={() => switchMode('login')}
                        className="btn btn-link text-primary fw-black p-0 text-decoration-underline small"
                      >
                        Log In
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
