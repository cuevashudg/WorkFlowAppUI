import { apiClient } from './client';
import type {
  ExpenseRequest,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  RejectExpenseRequest,
  PagedResult,
  ExpenseQuery,
  AuditLog,
  ExpenseComment,
} from '../types';

export const expenseApi = {
  getMyExpenses: async (query: ExpenseQuery = {}): Promise<PagedResult<ExpenseRequest>> => {
    const params = new URLSearchParams();
    if (query.search) params.append('search', query.search);
    if (query.status !== undefined) params.append('status', query.status.toString());
    if (query.fromDate) params.append('fromDate', query.fromDate);
    if (query.toDate) params.append('toDate', query.toDate);
    if (query.minAmount !== undefined) params.append('minAmount', query.minAmount.toString());
    if (query.maxAmount !== undefined) params.append('maxAmount', query.maxAmount.toString());
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortDir) params.append('sortDir', query.sortDir);
    if (query.page) params.append('page', query.page.toString());
    if (query.pageSize) params.append('pageSize', query.pageSize.toString());
    
    const response = await apiClient.get<PagedResult<ExpenseRequest>>(`/expenses?${params.toString()}`);
    return response.data;
  },

  getPendingExpenses: async (query: ExpenseQuery = {}): Promise<PagedResult<ExpenseRequest>> => {
    const params = new URLSearchParams();
    if (query.search) params.append('search', query.search);
    if (query.fromDate) params.append('fromDate', query.fromDate);
    if (query.toDate) params.append('toDate', query.toDate);
    if (query.minAmount !== undefined) params.append('minAmount', query.minAmount.toString());
    if (query.maxAmount !== undefined) params.append('maxAmount', query.maxAmount.toString());
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortDir) params.append('sortDir', query.sortDir);
    if (query.page) params.append('page', query.page.toString());
    if (query.pageSize) params.append('pageSize', query.pageSize.toString());
    
    const response = await apiClient.get<PagedResult<ExpenseRequest>>(`/expenses/pending?${params.toString()}`);
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

  deleteExpense: async (id: string): Promise<void> => {
    await apiClient.delete(`/expenses/${id}`);
  },

  uploadReceipt: async (id: string, file: File): Promise<{ fileUrl: string }> => {
    const formData = new FormData();
    formData.append('receipt', file);
    const response = await apiClient.post<{ fileUrl: string }>(`/expenses/${id}/upload-receipt`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getAuditHistory: async (id: string): Promise<AuditLog[]> => {
    const response = await apiClient.get<AuditLog[]>(`/expenses/${id}/audit-history`);
    return response.data;
  },

  getComments: async (id: string): Promise<ExpenseComment[]> => {
    const response = await apiClient.get<ExpenseComment[]>(`/expenses/${id}/comments`);
    return response.data;
  },

  addComment: async (id: string, text: string): Promise<ExpenseComment> => {
    const response = await apiClient.post<ExpenseComment>(`/expenses/${id}/comments`, { text });
    return response.data;
  },

  addAttachment: async (id: string, attachmentUrl: string): Promise<void> => {
    await apiClient.post(`/expenses/${id}/attachments`, { attachmentUrl });
  },
};
