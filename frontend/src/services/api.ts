import axios from 'axios';
import type { Campaign, TrustReport, VerificationRecord } from '../types';

// Determine base URL: use env variable in production, fallback to localhost for dev
const rawBase = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000';
// Normalize: strip trailing slash, ensure /api suffix
const API_BASE_URL = rawBase.replace(/\/+$/, '').replace(/\/api$/, '') + '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trustchain_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const path = window.location.pathname;
      if (!path.startsWith('/admin')) {
        localStorage.removeItem('trustchain_token');
        localStorage.removeItem('trustchain_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  googleLogin: async (credentialToken: string, role: 'recipient' | 'donor') => {
    const res = await api.post('/auth/google', { token: credentialToken, role });
    return res.data;
  },
  connectWallet: async (walletAddress: string) => {
    const res = await api.post('/auth/connect-wallet', { walletAddress });
    return res.data;
  },
  verifySignature: async (walletAddress: string, signature: string) => {
    const res = await api.post('/auth/verify-signature', { walletAddress, signature });
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get('/auth/profile');
    return res.data;
  },
};

export const campaignAPI = {
  getAll: async (category?: string) => {
    const params = category && category !== 'All' ? { category } : {};
    const res = await api.get<{ data: Campaign[] }>('/campaign/all', { params });
    return res.data;
  },
  getVerified: async (category?: string) => {
    const params = category && category !== 'All' ? { category } : {};
    const res = await api.get<{ data: Campaign[] }>('/campaign/verified', { params });
    return res.data;
  },
  getMy: async () => {
    const res = await api.get<{ data: Campaign[] }>('/campaign/my');
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get<{ data: Campaign }>(`/campaign/${id}`);
    return res.data;
  },
  getTrustReport: async (id: string) => {
    const res = await api.get<{ data: TrustReport }>(`/campaign/${id}/trust-report`);
    return res.data;
  },
  create: async (data: Partial<Campaign>) => {
    const res = await api.post<{ data: Campaign }>('/campaign/create', data);
    return res.data;
  },
};

export const verificationAPI = {
  uploadDocument: async (file: File, campaignId?: string) => {
    const formData = new FormData();
    formData.append('document', file);
    if (campaignId) {
      formData.append('campaignId', campaignId);
    }
    const res = await api.post('/verification/upload-doc', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

export const walletAPI = {
  getNonce: async () => {
    const res = await api.get<{ data: { message: string; nonce: string; expiresAt: string } }>('/wallet/nonce');
    return res.data;
  },
  verifySignature: async (walletAddress: string, signature: string, campaignId?: string) => {
    const res = await api.post('/wallet/verify', { walletAddress, signature, campaignId });
    return res.data;
  },
  getStatus: async () => {
    const res = await api.get<{ data: { walletConnected: boolean; walletVerified: boolean; walletAddress: string } }>('/wallet/status');
    return res.data;
  },
};

export const adminAPI = {
  login: async (email: string, password: string) => {
    const res = await api.post('/admin/login', { email, password });
    return res.data;
  },
  getPendingVerifications: async (status?: string) => {
    const params = status ? { status } : {};
    const res = await api.get<{ data: VerificationRecord[] }>('/admin/pending', { params });
    return res.data;
  },
  getPending: async (status?: string) => {
    const params = status ? { status } : {};
    const res = await api.get<{ data: VerificationRecord[] }>('/admin/pending', { params });
    return res.data;
  },
  approveVerification: async (verificationId: string, campaignId?: string, notes?: string) => {
    const res = await api.post('/admin/approve', { verificationId, campaignId, notes });
    return res.data;
  },
  approve: async (verificationId: string, campaignId?: string, notes?: string) => {
    const res = await api.post('/admin/approve', { verificationId, campaignId, notes });
    return res.data;
  },
  rejectVerification: async (verificationId: string, campaignId?: string, reason?: string) => {
    const res = await api.post('/admin/reject', { verificationId, campaignId, reason });
    return res.data;
  },
  reject: async (verificationId: string, campaignId?: string, reason?: string) => {
    const res = await api.post('/admin/reject', { verificationId, campaignId, reason });
    return res.data;
  },
};
