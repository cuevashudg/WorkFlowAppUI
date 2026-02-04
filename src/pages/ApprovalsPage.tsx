import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { expenseApi } from '../api/expenses';
import type { ExpenseRequest } from '../types';
import toast from 'react-hot-toast';
import { handleApiError } from '../api/client';
import { format } from 'date-fns';

export const ApprovalsPage: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRequest | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadPendingExpenses();
  }, []);

  const loadPendingExpenses = async () => {
    try {
      setIsLoading(true);
      const data = await expenseApi.getPendingExpenses();
      setExpenses(data);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsLoading(false);
    }
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

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner message="Loading pending expenses..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Pending Approvals</h2>
        <p className="text-gray-600 mt-1">Review and approve or reject expense requests</p>
      </div>

      {expenses.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">No pending expenses to review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div key={expense.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{expense.title}</h3>
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
                        {expense.submittedAt && format(new Date(expense.submittedAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Creator ID</p>
                      <p className="text-gray-900 text-sm truncate">{expense.creatorId.substring(0, 8)}...</p>
                    </div>
                  </div>

                  {expense.attachmentUrls.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Attachments:</p>
                      <div className="flex flex-wrap gap-2">
                        {expense.attachmentUrls.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-600 hover:underline bg-primary-50 px-3 py-1 rounded"
                          >
                            📎 Attachment {index + 1}
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
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleApprove(expense.id)}
                  className="btn-success flex-1"
                  disabled={isProcessing}
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => handleRejectClick(expense)}
                  className="btn-danger flex-1"
                  disabled={isProcessing}
                >
                  ✗ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Expense</h3>
            <p className="text-gray-600 mb-4">
              You are about to reject <strong>{selectedExpense.title}</strong>. Please provide a reason:
            </p>
            
            <textarea
              className="input mb-4"
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              disabled={isProcessing}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedExpense(null);
                }}
                className="btn-secondary flex-1"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                className="btn-danger flex-1"
                disabled={isProcessing || !rejectionReason.trim()}
              >
                {isProcessing ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
