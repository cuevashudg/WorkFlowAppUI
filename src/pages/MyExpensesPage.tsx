import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { ExpenseCard } from '../components/ExpenseCard';
import { ExpenseForm } from '../components/ExpenseForm';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { expenseApi } from '../api/expenses';
import { ExpenseStatus, ExpenseStatusNames } from '../types';
import type { ExpenseRequest, CreateExpenseRequest, UpdateExpenseRequest, AuditLog } from '../types';
import toast from 'react-hot-toast';
import { handleApiError } from '../api/client';
import { format } from 'date-fns';

type ViewMode = 'list' | 'create' | 'edit' | 'view';

export const MyExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRequest | null>(null);
  const [filter, setFilter] = useState<ExpenseStatus | 'all'>('all');
  const [auditHistory, setAuditHistory] = useState<AuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      const data = await expenseApi.getMyExpenses();
      setExpenses(data);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: CreateExpenseRequest) => {
    try {
      await expenseApi.createExpense(data);
      toast.success('Expense created successfully');
      setViewMode('list');
      await loadExpenses();
    } catch (error) {
      toast.error(handleApiError(error));
      throw error;
    }
  };

  const handleUpdate = async (data: UpdateExpenseRequest) => {
    if (!selectedExpense) return;
    try {
      await expenseApi.updateExpense(selectedExpense.id, data);
      toast.success('Expense updated successfully');
      setViewMode('list');
      setSelectedExpense(null);
      await loadExpenses();
    } catch (error) {
      toast.error(handleApiError(error));
      throw error;
    }
  };

  const handleSubmit = async (expenseId: string) => {
    try {
      await expenseApi.submitExpense(expenseId);
      toast.success('Expense submitted for approval');
      await loadExpenses();
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const handleView = (expense: ExpenseRequest) => {
    setSelectedExpense(expense);
    setViewMode('view');
    loadAuditHistory(expense.id);
  };

  const loadAuditHistory = async (expenseId: string) => {
    try {
      setLoadingAudit(true);
      const history = await expenseApi.getAuditHistory(expenseId);
      setAuditHistory(history);
    } catch (error) {
      console.error('Failed to load audit history:', error);
      setAuditHistory([]);
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleEdit = (expense: ExpenseRequest) => {
    setSelectedExpense(expense);
    setViewMode('edit');
  };

  const filteredExpenses = filter === 'all'
    ? expenses
    : expenses.filter(e => e.status === filter);

  if (viewMode === 'create') {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Expense</h2>
          <div className="card">
            <ExpenseForm
              onSubmit={handleCreate}
              onCancel={() => setViewMode('list')}
            />
          </div>
        </div>
      </Layout>
    );
  }

  if (viewMode === 'edit' && selectedExpense) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Expense</h2>
          <div className="card">
            <ExpenseForm
              initialData={selectedExpense}
              onSubmit={handleUpdate}
              onCancel={() => {
                setViewMode('list');
                setSelectedExpense(null);
              }}
              isEdit
            />
          </div>
        </div>
      </Layout>
    );
  }

  if (viewMode === 'view' && selectedExpense) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => {
              setViewMode('list');
              setSelectedExpense(null);
            }}
            className="mb-4 text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to list
          </button>
          <div className="card">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{selectedExpense.title}</h2>
              <span className={`badge badge-${ExpenseStatusNames[selectedExpense.status].toLowerCase()}`}>
                {ExpenseStatusNames[selectedExpense.status]}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                <p className="text-gray-900">{selectedExpense.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Amount</h3>
                  <p className="text-xl font-bold text-gray-900">${selectedExpense.amount.toFixed(2)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Expense Date</h3>
                  <p className="text-gray-900">{format(new Date(selectedExpense.expenseDate), 'MMMM d, yyyy')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
                  <p className="text-gray-900">{format(new Date(selectedExpense.createdAt), 'MMM d, yyyy HH:mm')}</p>
                </div>
                {selectedExpense.submittedAt && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Submitted</h3>
                    <p className="text-gray-900">{format(new Date(selectedExpense.submittedAt), 'MMM d, yyyy HH:mm')}</p>
                  </div>
                )}
              </div>

              {selectedExpense.processedAt && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    {selectedExpense.status === ExpenseStatus.Approved ? 'Approved' : 'Rejected'} At
                  </h3>
                  <p className="text-gray-900">{format(new Date(selectedExpense.processedAt), 'MMM d, yyyy HH:mm')}</p>
                </div>
              )}

              {selectedExpense.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded p-4">
                  <h3 className="text-sm font-medium text-red-800 mb-1">Rejection Reason</h3>
                  <p className="text-red-700">{selectedExpense.rejectionReason}</p>
                </div>
              )}

              {selectedExpense.attachmentUrls.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Attachments</h3>
                  <ul className="space-y-1">
                    {selectedExpense.attachmentUrls.map((url, index) => (
                      <li key={index}>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                          Attachment {index + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Audit History Section */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit History</h3>
                {loadingAudit ? (
                  <LoadingSpinner message="Loading audit history..." />
                ) : auditHistory.length === 0 ? (
                  <p className="text-gray-500 text-sm">No audit history available</p>
                ) : (
                  <div className="space-y-3">
                    {auditHistory.map((log) => (
                      <div key={log.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-medium text-gray-900">{log.action}</span>
                            {log.previousStatus !== undefined && log.newStatus !== undefined && (
                              <span className="text-sm text-gray-600 ml-2">
                                ({ExpenseStatusNames[log.previousStatus]} → {ExpenseStatusNames[log.newStatus]})
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                          </span>
                        </div>
                        {log.details && (
                          <p className="text-sm text-gray-700">{log.details}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Expenses</h2>
        <button onClick={() => setViewMode('create')} className="btn-primary">
          + Create Expense
        </button>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
        >
          All ({expenses.length})
        </button>
        <button
          onClick={() => setFilter(ExpenseStatus.Draft)}
          className={`px-4 py-2 rounded-lg ${filter === ExpenseStatus.Draft ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
        >
          Draft ({expenses.filter(e => e.status === ExpenseStatus.Draft).length})
        </button>
        <button
          onClick={() => setFilter(ExpenseStatus.Submitted)}
          className={`px-4 py-2 rounded-lg ${filter === ExpenseStatus.Submitted ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
        >
          Submitted ({expenses.filter(e => e.status === ExpenseStatus.Submitted).length})
        </button>
        <button
          onClick={() => setFilter(ExpenseStatus.Approved)}
          className={`px-4 py-2 rounded-lg ${filter === ExpenseStatus.Approved ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
        >
          Approved ({expenses.filter(e => e.status === ExpenseStatus.Approved).length})
        </button>
        <button
          onClick={() => setFilter(ExpenseStatus.Rejected)}
          className={`px-4 py-2 rounded-lg ${filter === ExpenseStatus.Rejected ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
        >
          Rejected ({expenses.filter(e => e.status === ExpenseStatus.Rejected).length})
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading expenses..." />
      ) : filteredExpenses.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            {filter === 'all' ? 'No expenses yet' : `No ${filter} expenses`}
          </p>
          {filter === 'all' && (
            <button onClick={() => setViewMode('create')} className="btn-primary">
              Create your first expense
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onView={handleView}
              onEdit={expense.status === ExpenseStatus.Draft ? handleEdit : undefined}
              onSubmit={expense.status === ExpenseStatus.Draft ? handleSubmit : undefined}
            />
          ))}
        </div>
      )}
    </Layout>
  );
};
