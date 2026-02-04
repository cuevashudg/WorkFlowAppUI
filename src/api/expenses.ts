import { apiClient } from './client';
import type {
  ExpenseRequest,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  RejectExpenseRequest,
  AuditLog,
} from '../types';

export const expenseApi = {
  getMyExpenses: async (): Promise<ExpenseRequest[]> => {
    const response = await apiClient.get<ExpenseRequest[]>('/expenses');
    return response.data;
  },

  getPendingExpenses: async (): Promise<ExpenseRequest[]> => {
    const response = await apiClient.get<ExpenseRequest[]>('/expenses/pending');
    return response.data;
  },

  getExpenseById: async (id: string): Promise<ExpenseRequest> => {
    const response = await apiClient.get<ExpenseRequest>(`/expenses/${id}`);
    return response.data;
  },

  createExpense: async (data: CreateExpenseRequest): Promise<{ id: string }> => {
    const response = await apiClient.post<{ id: string }>('/expenses', data);
    return response.data;
  },

  updateExpense: async (id: string, data: UpdateExpenseRequest): Promise<void> => {
    await apiClient.put(`/expenses/${id}`, data);
  },

  submitExpense: async (id: string): Promise<void> => {
    await apiClient.post(`/expenses/${id}/submit`);
  },

  approveExpense: async (id: string): Promise<void> => {
    await apiClient.post(`/expenses/${id}/approve`);
  },

  rejectExpense: async (id: string, data: RejectExpenseRequest): Promise<void> => {
    await apiClient.post(`/expenses/${id}/reject`, data);
  },

  addAttachment: async (id: string, attachmentUrl: string): Promise<void> => {
    await apiClient.post(`/expenses/${id}/attachments`, { attachmentUrl });
  },

  getAuditHistory: async (id: string): Promise<AuditLog[]> => {
    const response = await apiClient.get<AuditLog[]>(`/expenses/${id}/audit-history`);
    return response.data;
  },
};
