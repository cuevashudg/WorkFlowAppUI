import React from 'react';
import type { ExpenseRequest } from '../types';
import { ExpenseStatus, ExpenseStatusNames } from '../types';
import { format } from 'date-fns';

interface ExpenseCardProps {
  expense: ExpenseRequest;
  onView: (expense: ExpenseRequest) => void;
  onEdit?: (expense: ExpenseRequest) => void;
  onSubmit?: (expenseId: string) => void;
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

export const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onView, onEdit, onSubmit }) => {
  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{expense.title}</h3>
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
      </div>

      {expense.rejectionReason && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
          <p className="text-sm text-red-800">
            <span className="font-semibold">Rejection Reason:</span> {expense.rejectionReason}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={() => onView(expense)} className="btn-secondary flex-1">
          View Details
        </button>
        {expense.status === ExpenseStatus.Draft && onEdit && (
          <button onClick={() => onEdit(expense)} className="btn-primary flex-1">
            Edit
          </button>
        )}
        {expense.status === ExpenseStatus.Draft && onSubmit && (
          <button onClick={() => onSubmit(expense.id)} className="btn-success flex-1">
            Submit
          </button>
        )}
      </div>
    </div>
  );
};
