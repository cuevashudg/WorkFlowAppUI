import axios, { type AxiosError, type AxiosInstance } from 'axios';
import type { ApiError } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: unwrap ApiResponse wrapper and handle errors
    this.client.interceptors.response.use(
      (response) => {
        // Unwrap { success, data, error } envelope from backend
        const body = response.data;
        if (body && typeof body === 'object' && 'success' in body) {
          if (!body.success) {
            // Turn failed ApiResponse into a rejected promise
            const err = new Error(body.error || 'Request failed') as Error & { response: typeof response };
            err.response = { ...response, data: { error: body.error } };
            return Promise.reject(err);
          }
          // Unwrap so callers still see response.data as the payload
          response.data = body.data;
        }
        return response;
      },
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        // Unwrap error body if it's an ApiResponse envelope
        const body = error.response?.data as Record<string, unknown> | undefined;
        if (body && typeof body === 'object' && 'success' in body && body.error) {
          error.response!.data = { error: body.error } as ApiError;
        }
        return Promise.reject(error);
      }
    );
  }

  getInstance(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient().getInstance();

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;
    
    if (apiError?.error) {
      return apiError.error;
    }
    
    if (apiError?.message) {
      return apiError.message;
    }
    
    if (apiError?.errors && Array.isArray(apiError.errors)) {
      return apiError.errors.join(', ');
    }
    
    return error.message || 'An unexpected error occurred';
  }
  
  return 'An unexpected error occurred';
};
