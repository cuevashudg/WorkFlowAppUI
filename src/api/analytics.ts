import { apiClient } from './client';
import type { ExpenseAnalytics, ExpenseCategory, StatusDistribution, ApprovalRateData } from '../types';

export const analyticsApi = {
  getMyExpensesAnalytics: async (startDate?: string, endDate?: string): Promise<ExpenseAnalytics> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiClient.get<ExpenseAnalytics>(`/analytics/my-expenses?${params.toString()}`);
    return response.data;
  },

  getCategories: async (): Promise<ExpenseCategory[]> => {
    const response = await apiClient.get<ExpenseCategory[]>('/analytics/categories');
    return response.data;
  },

  getStatusDistribution: async (startDate?: string, endDate?: string): Promise<StatusDistribution[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiClient.get<StatusDistribution[]>(`/analytics/status-distribution?${params.toString()}`);
    return response.data;
  },

  getApprovalRates: async (monthsBack: number = 6): Promise<ApprovalRateData[]> => {
    const response = await apiClient.get<ApprovalRateData[]>(`/analytics/approval-rates?monthsBack=${monthsBack}`);
    return response.data;
  },

  // Manager/Admin endpoints
  getManagerStatusDistribution: async (startDate?: string, endDate?: string): Promise<StatusDistribution[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiClient.get<StatusDistribution[]>(`/analytics/manager/status-distribution?${params.toString()}`);
    return response.data;
  },

  getManagerApprovalRates: async (monthsBack: number = 6): Promise<ApprovalRateData[]> => {
    const response = await apiClient.get<ApprovalRateData[]>(`/analytics/manager/approval-rates?monthsBack=${monthsBack}`);
    return response.data;
  },
};
