import axios from 'axios';
import { Campaign, TrustReport, VerificationRecord } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trustchain_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  connectWallet: async (walletAddress: string) => {
    const res = await api.post('/auth/connect-wallet', { walletAddress });
    return res.data;
  },
  verifySignature: async (walletAddress: string, signature: string) => {
    const res = await api.post('/auth/verify-signature', { walletAddress, signature });
    return res.data;
  },
};

export const campaignAPI = {
  create: async (data: {
    title: string;
    description: string;
    targetAmount: number;
    category: string;
    recipientWallet: string;
  }) => {
    const res = await api.post('/campaign/create', data);
    return res.data;
  },
  getAll: async (category?: string, status?: string) => {
    const params: any = {};
    if (category && category !== 'All') params.category = category;
    if (status) params.status = status;
    const res = await api.get<{ data: Campaign[] }>('/campaign/all', { params });
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
};

export const verificationAPI = {
  uploadDocument: async (file: File, campaignId?: string) => {
    const formData = new FormData();
    formData.append('document', file);
    if (campaignId) {
      formData.append('campaignId', campaignId);
    }

    const res = await api.post('/verification/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  getStatus: async (id: string) => {
    const res = await api.get<{ data: VerificationRecord }>(`/verification/status/${id}`);
    return res.data;
  },
};

export const adminAPI = {
  getPending: async (status?: string) => {
    const params: any = {};
    if (status) params.status = status;
    const res = await api.get<{ data: VerificationRecord[] }>('/admin/pending', { params });
    return res.data;
  },
  approve: async (verificationId: string, campaignId?: string, notes?: string) => {
    const res = await api.post('/admin/approve', { verificationId, campaignId, notes });
    return res.data;
  },
  reject: async (verificationId: string, reason?: string, requestReupload?: boolean) => {
    const res = await api.post('/admin/reject', { verificationId, reason, requestReupload });
    return res.data;
  },
};

export default api;
