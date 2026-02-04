import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginRequest, RegisterRequest, UserRole } from '../types';
import { parseUserRole } from '../types';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';
import { handleApiError } from '../api/client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Verify token is still valid by fetching current user
          const currentUser = await authApi.getCurrentUser();
          // Convert role if it's a string
          if (typeof currentUser.role === 'string') {
            currentUser.role = parseUserRole(currentUser.role);
          }
          setUser(currentUser);
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authApi.login(credentials);
      
      const userData: User = {
        userId: response.userId,
        email: response.email,
        fullName: response.fullName,
        role: typeof response.role === 'string' ? parseUserRole(response.role) : response.role,
      };

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast.success(`Welcome back, ${userData.fullName}!`);
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      await authApi.register(data);
      toast.success('Registration successful! Please login.');
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
