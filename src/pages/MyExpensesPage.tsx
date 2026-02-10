import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { ExpenseCard } from '../components/ExpenseCard';
import { ExpenseForm } from '../components/ExpenseForm';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Comments } from '../components/Comments';
import { expenseApi } from '../api/expenses';
import { ExpenseStatus, ExpenseStatusNames } from '../types';
import type { ExpenseRequest, CreateExpenseRequest, UpdateExpenseRequest, ExpenseQuery, AuditLog, ExpenseCategory } from '../types';
import { analyticsApi } from '../api/analytics';
import toast from 'react-hot-toast';
import { handleApiError } from '../api/client';
import { format } from 'date-fns';
import { exportExpensesToCSV, generateCSVFilename } from '../utils/csvExport';

type ViewMode = 'list' | 'create' | 'edit' | 'view' | 'audit';


export const MyExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseRequest[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRequest | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Query state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Advanced filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Inline edit state
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', amount: 0 });

  // Upload state
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [page, statusFilter, categoryFilter, sortBy, sortDir, fromDate, toDate, minAmount, maxAmount]);

  const loadCategories = async () => {
    try {
      const data = await analyticsApi.getCategories();
      setCategories(data);
    } catch (error) {
      // Optionally handle error
    }
  };

  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      const query: ExpenseQuery = {
        search: search || undefined,
        status: statusFilter,
        categoryId: categoryFilter || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        minAmount: minAmount ? parseFloat(minAmount) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
        page,
        pageSize,
        sortBy,
        sortDir,
      };
      const result = await expenseApi.getMyExpenses(query);
      setExpenses(result.items);
      setTotalCount(result.totalCount);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadExpenses();
  };

  const handleCreate = async (data: CreateExpenseRequest) => {
    try {
      await expenseApi.createExpense(data);
      toast.success('Expense created successfully');
      setViewMode('list');
      setPage(1);
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

  const handleInlineEditStart = (expense: ExpenseRequest) => {
    setEditingExpense(expense.id);
    setEditForm({
      title: expense.title,
      description: expense.description,
      amount: expense.amount,
    });
  };

  const handleInlineEditSave = async (expenseId: string) => {
    try {
      await expenseApi.updateExpense(expenseId, editForm);
      toast.success('Expense updated');
      setEditingExpense(null);
      await loadExpenses();
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const handleInlineEditCancel = () => {
    setEditingExpense(null);
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

  const handleDelete = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await expenseApi.deleteExpense(expenseId);
      toast.success('Expense deleted');
      await loadExpenses();
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const handleUpload = async (expenseId: string, file: File) => {
    try {
      setUploadingFor(expenseId);
      await expenseApi.uploadReceipt(expenseId, file);
      toast.success('Receipt uploaded');
      await loadExpenses();
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setUploadingFor(null);
    }
  };

  const handleViewAudit = async (expense: ExpenseRequest) => {
    try {
      setSelectedExpense(expense);
      setViewMode('audit');
      const logs = await expenseApi.getAuditHistory(expense.id);
      setAuditLogs(logs);
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const handleView = (expense: ExpenseRequest) => {
    setSelectedExpense(expense);
    setViewMode('view');
  };

  const handleEdit = (expense: ExpenseRequest) => {
    setSelectedExpense(expense);
    setViewMode('edit');
  };

  const totalPages = Math.ceil(totalCount / pageSize);

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
                  <p className="text-2xl font-bold text-gray-900">${selectedExpense.amount.toFixed(2)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Expense Date</h3>
                  <p className="text-gray-900">{format(new Date(selectedExpense.expenseDate), 'MMM d, yyyy')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
                  <p className="text-gray-900">{format(new Date(selectedExpense.createdAt), 'MMM d, yyyy h:mm a')}</p>
                </div>
                {selectedExpense.submittedAt && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Submitted</h3>
                    <p className="text-gray-900">{format(new Date(selectedExpense.submittedAt), 'MMM d, yyyy h:mm a')}</p>
                  </div>
                )}
              </div>

              {selectedExpense.attachmentUrls.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Attachments</h3>
                  <div className="space-y-2">
                    {selectedExpense.attachmentUrls.map((url, index) => (
                      <a
                        key={index}
                        href={`/api${url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-primary-600 hover:text-primary-700"
                      >
                        📎 Receipt {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedExpense.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded p-4">
                  <h3 className="text-sm font-medium text-red-800 mb-1">Rejection Reason</h3>
                  <p className="text-red-700">{selectedExpense.rejectionReason}</p>
                </div>
              )}

              {/* Comments Section */}
              <div className="border-t pt-4">
                <Comments expenseId={selectedExpense.id} />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleViewAudit(selectedExpense)}
                  className="btn-secondary"
                >
                  View Audit History
                </button>
                {selectedExpense.status === ExpenseStatus.Draft && (
                  <>
                    <button
                      onClick={() => setViewMode('edit')}
                      className="btn-primary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(selectedExpense.id)}
                      className="btn-danger"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (viewMode === 'audit' && selectedExpense) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => {
              setViewMode('view');
            }}
            className="mb-4 text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to expense
          </button>
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Audit History: {selectedExpense.title}</h2>
            
            {auditLogs.length === 0 ? (
              <p className="text-gray-500">No audit logs available</p>
            ) : (
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="border-l-4 border-primary-500 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{log.action}</p>
                        {log.details && <p className="text-gray-600 text-sm mt-1">{log.details}</p>}
                      </div>
                      <span className="text-sm text-gray-500">
                        {format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">My Expenses</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                if (expenses.length === 0) {
                  toast.error('No expenses to export');
                  return;
                }
                exportExpensesToCSV(expenses, generateCSVFilename('my-expenses'));
                toast.success('Expenses exported to CSV');
              }}
              className="btn-secondary"
              disabled={expenses.length === 0}
            >
              📥 Export CSV
            </button>
            <button onClick={() => setViewMode('create')} className="btn-primary">
              + New Expense
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search title or description..."
                  className="input flex-1"
                />
                <button onClick={handleSearch} className="btn-primary">
                  Search
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter ?? ''}
                onChange={(e) => {
                  setStatusFilter(e.target.value === '' ? undefined : Number(e.target.value) as ExpenseStatus);
                  setPage(1);
                }}
                className="input"
              >
                <option value="">All Statuses</option>
                <option value={ExpenseStatus.Draft}>Draft</option>
                <option value={ExpenseStatus.Submitted}>Submitted</option>
                <option value={ExpenseStatus.Approved}>Approved</option>
                <option value={ExpenseStatus.Rejected}>Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={`${sortBy}-${sortDir}`}
                onChange={(e) => {
                  const [newSortBy, newSortDir] = e.target.value.split('-');
                  setSortBy(newSortBy);
                  setSortDir(newSortDir as 'asc' | 'desc');
                }}
                className="input"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="amount-desc">Highest Amount</option>
                <option value="amount-asc">Lowest Amount</option>
                <option value="expenseDate-desc">Recent Expense Date</option>
                <option value="expenseDate-asc">Oldest Expense Date</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="border-t pt-4">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              {showAdvancedFilters ? '▼' : '▶'} Advanced Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Date Range</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setPage(1);
                    }}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setPage(1);
                    }}
                    className="input"
                  />
                </div>
              </div>

              <h4 className="text-sm font-semibold text-gray-700 mb-3">Amount Range</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={minAmount}
                    onChange={(e) => {
                      setMinAmount(e.target.value);
                      setPage(1);
                    }}
                    placeholder="0.00"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={maxAmount}
                    onChange={(e) => {
                      setMaxAmount(e.target.value);
                      setPage(1);
                    }}
                    placeholder="No limit"
                    className="input"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                  setMinAmount('');
                  setMaxAmount('');
                  setPage(1);
                }}
                className="btn-secondary text-sm"
              >
                Clear Advanced Filters
              </button>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600 mb-4">
          Showing {expenses.length} of {totalCount} expenses
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading expenses..." />
      ) : expenses.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">No expenses found</p>
          <button onClick={() => setViewMode('create')} className="btn-primary mt-4">
            Create Your First Expense
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expenses.map((expense) => (
              <div key={expense.id}>
                {editingExpense === expense.id ? (
                  <div className="card">
                    <h3 className="font-semibold mb-3">Edit Expense</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="input"
                        placeholder="Title"
                      />
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="input"
                        placeholder="Description"
                        rows={3}
                      />
                      <input
                        type="number"
                        value={editForm.amount}
                        onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                        className="input"
                        placeholder="Amount"
                        step="0.01"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleInlineEditSave(expense.id)}
                          className="btn-primary flex-1"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleInlineEditCancel}
                          className="btn-secondary flex-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <ExpenseCard
                    expense={expense}
                    onView={handleView}
                    onEdit={expense.status === ExpenseStatus.Draft ? handleEdit : undefined}
                    onSubmit={expense.status === ExpenseStatus.Draft ? handleSubmit : undefined}
                    onDelete={expense.status === ExpenseStatus.Draft ? handleDelete : undefined}
                    onInlineEdit={expense.status === ExpenseStatus.Draft ? handleInlineEditStart : undefined}
                    onUpload={expense.status === ExpenseStatus.Draft ? handleUpload : undefined}
                    onViewAudit={handleViewAudit}
                    isUploading={uploadingFor === expense.id}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <span className="text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </Layout>
  );
};
