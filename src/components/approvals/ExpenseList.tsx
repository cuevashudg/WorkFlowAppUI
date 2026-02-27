import React from 'react';
import type { ExpenseRequest } from '../../types';
import { ApprovalExpenseCard } from './ApprovalExpenseCard';

interface ExpenseListProps {
  expenses: ExpenseRequest[];
  selectedIds: string[];
  isProcessing: boolean;
  onToggleSelect: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (expense: ExpenseRequest) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  selectedIds,
  isProcessing,
  onToggleSelect,
  onApprove,
  onReject,
}) => {
  if (expenses.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 text-lg">No pending expenses to review</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <ApprovalExpenseCard
          key={expense.id}
          expense={expense}
          isSelected={selectedIds.includes(expense.id)}
          isProcessing={isProcessing}
          onToggleSelect={onToggleSelect}
          onApprove={onApprove}
          onReject={onReject}
        />
      ))}
    </div>
  );
};
