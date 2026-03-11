import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { budgetApi } from '../api/budgets';
import { analyticsApi } from '../api/analytics';
import type { Budget, BudgetStatus, ExpenseCategory, CreateBudgetRequest } from '../types';
import toast from 'react-hot-toast';
import { handleApiError } from '../api/client';
import { format } from 'date-fns';

export const BudgetsPage: React.FC = () => {
  const [budgetStatuses, setBudgetStatuses] = useState<BudgetStatus[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateBudgetRequest>({
    name: '',
    description: '',
    amount: 0,
    startDate: '',
    endDate: '',
    categoryId: undefined,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [statusData, budgetsData, categoriesData] = await Promise.all([
        budgetApi.getBudgetStatus(),
        budgetApi.getMyBudgets(true),
        analyticsApi.getCategories(),
      ]);
      setBudgetStatuses(statusData);
      setBudgets(budgetsData);
      setCategories(categoriesData);
    } catch (error) {
      const message = handleApiError(error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await budgetApi.createBudget(formData);
      toast.success('Budget created successfully!');
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (error) {
      const message = handleApiError(error);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    try {
      await budgetApi.deleteBudget(id);
      toast.success('Budget deleted successfully');
      loadData();
    } catch (error) {
      const message = handleApiError(error);
      toast.error(message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      amount: 0,
      startDate: '',
      endDate: '',
      categoryId: undefined,
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner message="Loading budgets..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Budget Management</h1>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            + Create Budget
          </button>
        </div>

        {/* Budget Status Cards */}
        {budgetStatuses.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active Budgets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgetStatuses.map((budget) => (
                <div key={budget.budgetId} className="card">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      {budget.categoryIcon && <span className="text-2xl">{budget.categoryIcon}</span>}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {budget.budgetName}
                        </h3>
                        {budget.categoryName && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{budget.categoryName}</p>
                        )}
                      </div>
                    </div>
                    {budget.isOverBudget && (
                      <span className="px-2 py-1 text-xs font-semibold bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-300 rounded-full">
                        Over Budget
                      </span>
                    )}
                  </div>

                  {budget.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{budget.description}</p>
                  )}

                  {/* Budget Progress */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        ${budget.spentAmount.toFixed(2)} spent of ${budget.budgetAmount.toFixed(2)}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {budget.percentageUsed.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          budget.isOverBudget
                            ? 'bg-red-600'
                            : budget.percentageUsed > 80
                            ? 'bg-amber-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Budget Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Remaining</p>
                      <p className={`font-medium ${budget.isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                        ${budget.remainingAmount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Days Left</p>
                      <p className="font-medium text-gray-900 dark:text-white">{budget.daysRemaining}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Start Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {format(new Date(budget.startDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">End Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {format(new Date(budget.endDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Budgets List */}
        {budgets.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Budgets</h2>
            <div className="card overflow-hidden p-0">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {budgets.map((budget) => (
                    <tr key={budget.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{budget.name}</div>
                        {budget.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">{budget.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${budget.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {format(new Date(budget.startDate), 'MMM d')} - {format(new Date(budget.endDate), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {budget.category ? (
                          <span>
                            {budget.category.icon} {budget.category.name}
                          </span>
                        ) : (
                          'All Categories'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            budget.isActive
                              ? 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {budget.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(budget.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {budgetStatuses.length === 0 && budgets.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No budgets created yet</p>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              Create Your First Budget
            </button>
          </div>
        )}
      </div>

      {/* Create Budget Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Create Budget</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Budget Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="e.g., Q1 2026 Budget"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={3}
                  placeholder="Optional description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount ($) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category (Optional)
                </label>
                <select
                  value={formData.categoryId || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value || undefined })
                  }
                  className="input"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
                  {isSubmitting ? 'Creating...' : 'Create Budget'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};
