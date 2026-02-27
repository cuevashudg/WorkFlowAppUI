import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Filters, BulkActions, ExpenseList, RejectModal } from '../components/approvals';
import { Pagination } from '../components/Pagination';
import { expenseApi } from '../api/expenses';
import type { ExpenseRequest, ExpenseQuery } from '../types';
import toast from 'react-hot-toast';
import { handleApiError } from '../api/client';
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

  const loadPendingExpenses = useCallback(async () => {
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
  }, [search, fromDate, toDate, minAmount, maxAmount, page, pageSize, sortBy, sortDir]);

  useEffect(() => {
    loadPendingExpenses();
  }, [loadPendingExpenses]);

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
    setSelectedIds(
      selectedIds.length === expenses.length ? [] : expenses.map((e) => e.id)
    );
  };

  const handleSortChange = (newSortBy: string, newSortDir: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortDir(newSortDir);
  };

  const handleClearAdvancedFilters = () => {
    setFromDate('');
    setToDate('');
    setMinAmount('');
    setMaxAmount('');
    setPage(1);
  };

  const handleExportCSV = () => {
    if (expenses.length === 0) {
      toast.error('No expenses to export');
      return;
    }
    exportExpensesToCSV(expenses, generateCSVFilename('pending-approvals'));
    toast.success('Expenses exported to CSV');
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
            onClick={handleExportCSV}
            className="btn-secondary"
            disabled={expenses.length === 0}
          >
            📥 Export CSV
          </button>
        </div>
        <p className="text-gray-600 mb-4">Review and approve or reject expense requests</p>

        <Filters
          search={search}
          onSearchChange={setSearch}
          onSearch={handleSearch}
          sortValue={`${sortBy}-${sortDir}`}
          onSortChange={handleSortChange}
          showAdvancedFilters={showAdvancedFilters}
          onToggleAdvancedFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
          fromDate={fromDate}
          onFromDateChange={(v) => { setFromDate(v); setPage(1); }}
          toDate={toDate}
          onToDateChange={(v) => { setToDate(v); setPage(1); }}
          minAmount={minAmount}
          onMinAmountChange={(v) => { setMinAmount(v); setPage(1); }}
          maxAmount={maxAmount}
          onMaxAmountChange={(v) => { setMaxAmount(v); setPage(1); }}
          onClearAdvancedFilters={handleClearAdvancedFilters}
        />

        <div className="text-sm text-gray-600 mb-4">
          Showing {expenses.length} of {totalCount} pending expenses
        </div>
      </div>

      <BulkActions
        selectedCount={selectedIds.length}
        totalCount={expenses.length}
        isProcessing={isProcessing}
        onToggleSelectAll={toggleSelectAll}
        onBulkApprove={handleBulkApprove}
        onBulkReject={handleBulkReject}
        allSelected={selectedIds.length === expenses.length && expenses.length > 0}
      />

      <ExpenseList
        expenses={expenses}
        selectedIds={selectedIds}
        isProcessing={isProcessing}
        onToggleSelect={toggleSelect}
        onApprove={handleApprove}
        onReject={handleRejectClick}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {showRejectModal && selectedExpense && (
        <RejectModal
          expenseTitle={selectedExpense.title}
          rejectionReason={rejectionReason}
          isProcessing={isProcessing}
          onReasonChange={setRejectionReason}
          onSubmit={handleRejectSubmit}
          onCancel={() => {
            setShowRejectModal(false);
            setRejectionReason('');
            setSelectedExpense(null);
          }}
        />
      )}
    </Layout>
  );
};

