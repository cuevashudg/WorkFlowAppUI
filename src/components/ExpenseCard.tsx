import React, { useRef } from 'react';
import type { ExpenseRequest } from '../types';
import { ExpenseStatus, ExpenseStatusNames } from '../types';
import { format } from 'date-fns';

interface ExpenseCardProps {
  expense: ExpenseRequest;
  onView: (expense: ExpenseRequest) => void;
  onEdit?: (expense: ExpenseRequest) => void;
  onSubmit?: (expenseId: string) => void;
  onDelete?: (expenseId: string) => void;
  onInlineEdit?: (expense: ExpenseRequest) => void;
  onUpload?: (expenseId: string, file: File) => void;
  onViewAudit?: (expense: ExpenseRequest) => void;
  isUploading?: boolean;
}

const getStatusBadgeClass = (status: ExpenseStatus): string => {
  switch (status) {
    case ExpenseStatus.Draft:
      return 'badge-draft';
    case ExpenseStatus.Submitted:
      return 'badge-submitted';
    case ExpenseStatus.Approved:
      return 'badge-approved';
    case ExpenseStatus.Rejected:
      return 'badge-rejected';
    default:
      return 'badge';
  }
};

export const ExpenseCard: React.FC<ExpenseCardProps> = ({ 
  expense, 
  onView, 
  onEdit, 
  onSubmit, 
  onDelete,
  onInlineEdit,
  onUpload,
  onViewAudit,
  isUploading = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(expense.id, file);
    }
  };

  const needsReceipt = expense.amount > 100 && expense.attachmentUrls.length === 0;

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{expense.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{expense.description}</p>
        </div>
        <span className={getStatusBadgeClass(expense.status)}>{ExpenseStatusNames[expense.status]}</span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Amount:</span>
          <span className="font-semibold text-gray-900">${expense.amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Expense Date:</span>
          <span className="text-gray-700">{format(new Date(expense.expenseDate), 'MMM d, yyyy')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Created:</span>
          <span className="text-gray-700">{format(new Date(expense.createdAt), 'MMM d, yyyy')}</span>
        </div>
        {expense.submittedAt && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Submitted:</span>
            <span className="text-gray-700">{format(new Date(expense.submittedAt), 'MMM d, yyyy')}</span>
          </div>
        )}
        {expense.attachmentUrls.length > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Attachments:</span>
            <span className="text-green-600 font-medium">✓ {expense.attachmentUrls.length} receipt(s)</span>
          </div>
        )}
      </div>

      {needsReceipt && expense.status === ExpenseStatus.Draft && (
        <div className="bg-amber-50 border border-amber-200 rounded p-2 mb-3">
          <p className="text-xs text-amber-800">
            ⚠️ Receipt required for expenses over $100
          </p>
        </div>
      )}

      {expense.rejectionReason && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
          <p className="text-sm text-red-800">
            <span className="font-semibold">Rejected:</span> {expense.rejectionReason}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <button onClick={() => onView(expense)} className="btn-secondary flex-1 text-sm">
            View
          </button>
          {onViewAudit && (
            <button onClick={() => onViewAudit(expense)} className="btn-secondary flex-1 text-sm">
              Audit
            </button>
          )}
        </div>

        {expense.status === ExpenseStatus.Draft && (
          <>
            <div className="flex gap-2">
              {onInlineEdit && (
                <button onClick={() => onInlineEdit(expense)} className="btn-secondary flex-1 text-sm">
                  Quick Edit
                </button>
              )}
              {onEdit && (
                <button onClick={() => onEdit(expense)} className="btn-primary flex-1 text-sm">
                  Edit Form
                </button>
              )}
            </div>

            {onUpload && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="btn-secondary text-sm w-full disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : '📎 Upload Receipt'}
                </button>
              </>
            )}

            <div className="flex gap-2">
              {onSubmit && (
                <button
                  onClick={() => onSubmit(expense.id)}
                  disabled={needsReceipt}
                  className="btn-success flex-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  title={needsReceipt ? 'Receipt required before submission' : 'Submit for approval'}
                >
                  Submit
                </button>
              )}
              {onDelete && (
                <button onClick={() => onDelete(expense.id)} className="btn-danger flex-1 text-sm">
                  Delete
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
