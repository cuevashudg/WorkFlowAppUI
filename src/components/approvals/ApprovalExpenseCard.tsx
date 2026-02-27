import React from 'react';
import { Comments } from '../Comments';
import type { ExpenseRequest } from '../../types';
import { format } from 'date-fns';
import { getAttachmentUrl } from '../../utils/attachments';

interface ApprovalExpenseCardProps {
  expense: ExpenseRequest;
  isSelected: boolean;
  isProcessing: boolean;
  onToggleSelect: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (expense: ExpenseRequest) => void;
}

export const ApprovalExpenseCard: React.FC<ApprovalExpenseCardProps> = ({
  expense,
  isSelected,
  isProcessing,
  onToggleSelect,
  onApprove,
  onReject,
}) => {
  return (
    <div className="card">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(expense.id)}
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
              <p className="text-gray-900 text-sm truncate">
                {expense.creatorName || expense.creatorId.substring(0, 8) + '...'}
              </p>
            </div>
          </div>

          {expense.attachmentUrls.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Attachments:</p>
              <div className="flex flex-wrap gap-2">
                {expense.attachmentUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 bg-primary-50 px-3 py-1 rounded text-sm">
                    <span className="text-gray-600">📎 Receipt {index + 1}</span>
                    <a
                      href={getAttachmentUrl(expense.id, url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      View
                    </a>
                    <span className="text-gray-300">|</span>
                    <a
                      href={getAttachmentUrl(expense.id, url)}
                      download
                      className="text-green-600 hover:underline font-medium"
                    >
                      Download
                    </a>
                  </div>
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
              onClick={() => onApprove(expense.id)}
              disabled={isProcessing}
              className="btn-success disabled:opacity-50"
            >
              ✓ Approve
            </button>
            <button
              onClick={() => onReject(expense)}
              disabled={isProcessing}
              className="btn-danger disabled:opacity-50"
            >
              ✗ Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
