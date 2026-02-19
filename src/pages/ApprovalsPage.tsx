import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Comments } from '../components/Comments';
import { expenseApi } from '../api/expenses';
import type { ExpenseRequest, ExpenseQuery } from '../types';
import toast from 'react-hot-toast';
import { handleApiError } from '../api/client';
import { format } from 'date-fns';
import { exportExpensesToCSV, generateCSVFilename } from '../utils/csvExport';

export const ApprovalsPage: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseRequest[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRequest | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Query state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('submittedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  
  // Advanced filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    loadPendingExpenses();
  }, [page, sortBy, sortDir, fromDate, toDate, minAmount, maxAmount]);

  const loadPendingExpenses = async () => {
    try {
      setIsLoading(true);
      const query: ExpenseQuery = {
        search: search || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        minAmount: minAmount ? parseFloat(minAmount) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
        page,
        pageSize,
        sortBy,
        sortDir,
      };
      const result = await expenseApi.getPendingExpenses(query);
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
    loadPendingExpenses();
  };

  const handleApprove = async (expenseId: string) => {
    if (!confirm('Are you sure you want to approve this expense?')) return;

    try {
      setIsProcessing(true);
      await expenseApi.approveExpense(expenseId);
      toast.success('Expense approved successfully');
      await loadPendingExpenses();
      setSelectedExpense(null);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectClick = (expense: ExpenseRequest) => {
    setSelectedExpense(expense);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedExpense || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setIsProcessing(true);
      await expenseApi.rejectExpense(selectedExpense.id, { reason: rejectionReason });
      toast.success('Expense rejected successfully');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedExpense(null);
      await loadPendingExpenses();
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      toast.error('Select at least one expense to approve.');
      return;
    }
    if (!confirm(`Approve ${selectedIds.length} selected expenses?`)) return;
    try {
      setIsProcessing(true);
      const result = await expenseApi.bulkApprove(selectedIds);
      toast.success(`Approved ${result.approved.length} expenses.`);
      setSelectedIds([]);
      await loadPendingExpenses();
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) {
      toast.error('Select at least one expense to reject.');
      return;
    }
    const reason = prompt(`Enter a rejection reason for ${selectedIds.length} expenses:`);
    if (!reason || !reason.trim()) {
      toast.error('Rejection reason is required.');
      return;
    }
    if (!confirm(`Reject ${selectedIds.length} selected expenses?`)) return;
    try {
      setIsProcessing(true);
      // Sequentially reject each expense (API does not support bulk reject yet)
      for (const id of selectedIds) {
        await expenseApi.rejectExpense(id, { reason });
      }
      toast.success(`Rejected ${selectedIds.length} expenses.`);
      setSelectedIds([]);
      await loadPendingExpenses();
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === expenses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(expenses.map((e) => e.id));
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (isLoading && expenses.length === 0) {
    return (
      <Layout>
        <LoadingSpinner message="Loading pending expenses..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-2xl font-bold text-gray-900">Pending Approvals</h2>
          <button 
            onClick={() => {
              if (expenses.length === 0) {
                toast.error('No expenses to export');
                return;
              }
              exportExpensesToCSV(expenses, generateCSVFilename('pending-approvals'));
              toast.success('Expenses exported to CSV');
            }}
            className="btn-secondary"
            disabled={expenses.length === 0}
          >
            📥 Export CSV
          </button>
        </div>
        <p className="text-gray-600 mb-4">Review and approve or reject expense requests</p>

        {/* Search and Sort */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                <option value="submittedAt-asc">Oldest First</option>
                <option value="submittedAt-desc">Newest First</option>
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
          Showing {expenses.length} of {totalCount} pending expenses
        </div>
      </div>

      <div className="mb-4 flex gap-2 items-center">
        <input
          type="checkbox"
          checked={selectedIds.length === expenses.length && expenses.length > 0}
          onChange={toggleSelectAll}
          className="mr-2"
        />
        <span className="text-sm">Select All</span>
        <button
          onClick={handleBulkApprove}
          className="btn-success ml-4"
          disabled={selectedIds.length === 0 || isProcessing}
        >
          ✓ Bulk Approve
        </button>
        <button
          onClick={handleBulkReject}
          className="btn-danger ml-2"
          disabled={selectedIds.length === 0 || isProcessing}
        >
          ✗ Bulk Reject
        </button>
      </div>

      {expenses.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">No pending expenses to review</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div key={expense.id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(expense.id)}
                        onChange={() => toggleSelect(expense.id)}
                        className="mr-2"
                      />
                      <h3 className="text-xl font-semibold text-gray-900">{expense.title}</h3>
                      {expense.creatorName && (
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          by {expense.creatorName}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">{expense.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="text-lg font-bold text-gray-900">${expense.amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Expense Date</p>
                        <p className="text-gray-900">{format(new Date(expense.expenseDate), 'MMM d, yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Submitted</p>
                        <p className="text-gray-900">
                          {expense.submittedAt && format(new Date(expense.submittedAt), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Creator</p>
                        <p className="text-gray-900 text-sm truncate">{expense.creatorName || expense.creatorId.substring(0, 8) + '...'}</p>
                      </div>
                    </div>

                    {expense.attachmentUrls.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">Attachments:</p>
                        <div className="flex flex-wrap gap-2">
                          {expense.attachmentUrls.map((url, index) => (
                            <a
                              key={index}
                              href={`/api${url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary-600 hover:underline bg-primary-50 px-3 py-1 rounded"
                            >
                              📎 Receipt {index + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {expense.amount > 100 && expense.attachmentUrls.length === 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4">
                        <p className="text-sm text-amber-800">
                          ⚠️ Warning: This expense exceeds $100 but has no receipt attached
                        </p>
                      </div>
                    )}

                    {/* Comments Section */}
                    <div className="border-t pt-4 mb-4">
                      <Comments expenseId={expense.id} />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(expense.id)}
                        disabled={isProcessing}
                        className="btn-success disabled:opacity-50"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleRejectClick(expense)}
                        disabled={isProcessing}
                        className="btn-danger disabled:opacity-50"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                </div>
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

      {/* Reject Modal */}
      {showRejectModal && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Expense</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting "{selectedExpense.title}"
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="input w-full mb-4"
              rows={4}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleRejectSubmit}
                disabled={isProcessing || !rejectionReason.trim()}
                className="btn-danger flex-1 disabled:opacity-50"
              >
                {isProcessing ? 'Rejecting...' : 'Reject Expense'}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedExpense(null);
                }}
                disabled={isProcessing}
                className="btn-secondary flex-1 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
