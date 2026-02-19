import { apiClient } from './client';
import type { Budget, BudgetStatus, CreateBudgetRequest, UpdateBudgetRequest } from '../types';

export const budgetApi = {
  getMyBudgets: async (activeOnly: boolean = false): Promise<Budget[]> => {
    const response = await apiClient.get<Budget[]>(`/budgets?activeOnly=${activeOnly}`);
    return response.data;
  },

  getBudgetStatus: async (): Promise<BudgetStatus[]> => {
    const response = await apiClient.get<BudgetStatus[]>('/budgets/status');
    return response.data;
  },

  createBudget: async (data: CreateBudgetRequest): Promise<{ id: string }> => {
    const response = await apiClient.post<{ id: string }>('/budgets', data);
    return response.data;
  },

  updateBudget: async (id: string, data: UpdateBudgetRequest): Promise<void> => {
    await apiClient.put(`/budgets/${id}`, data);
  },

  activateBudget: async (id: string): Promise<void> => {
    await apiClient.post(`/budgets/${id}/activate`);
  },

  deactivateBudget: async (id: string): Promise<void> => {
    await apiClient.post(`/budgets/${id}/deactivate`);
  },

  deleteBudget: async (id: string): Promise<void> => {
    await apiClient.delete(`/budgets/${id}`);
  },
};
