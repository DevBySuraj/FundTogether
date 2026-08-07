import React, { createContext, useContext, useEffect, useState } from 'react';
import { adminService, AdminUser } from '../services/adminService';

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('trustchain_admin_token');
    const savedUser = localStorage.getItem('trustchain_admin_user');

    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setAdminUser(parsed);
        setToken(savedToken);
      } catch {
        localStorage.removeItem('trustchain_admin_token');
        localStorage.removeItem('trustchain_admin_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await adminService.login(email, password);
      const authToken = res.token;
      const userPayload = res.user;

      setToken(authToken);
      setAdminUser(userPayload);

      localStorage.setItem('trustchain_admin_token', authToken);
      localStorage.setItem('trustchain_admin_user', JSON.stringify(userPayload));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setAdminUser(null);
    localStorage.removeItem('trustchain_admin_token');
    localStorage.removeItem('trustchain_admin_user');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        token,
        isAuthenticated: !!token && !!adminUser,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
