import React, { useState } from 'react';
import type { ExpenseRequest, CreateExpenseRequest, UpdateExpenseRequest } from '../types';

interface ExpenseFormProps {
  initialData?: ExpenseRequest;
  onSubmit: (data: CreateExpenseRequest) => Promise<void> | ((data: UpdateExpenseRequest) => Promise<void>);
  onCancel: () => void;
  isEdit?: boolean;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [expenseDate, setExpenseDate] = useState(
    initialData?.expenseDate.split('T')[0] || new Date().toISOString().split('T')[0]
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEdit) {
        const data: UpdateExpenseRequest = { title, description, amount: parseFloat(amount) };
        await (onSubmit as (data: UpdateExpenseRequest) => Promise<void>)(data);
      } else {
        const data: CreateExpenseRequest = { 
          title, 
          description, 
          amount: parseFloat(amount), 
          expenseDate: new Date(expenseDate).toISOString() 
        };
        await (onSubmit as (data: CreateExpenseRequest) => Promise<void>)(data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          id="title"
          type="text"
          required
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Office Supplies"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          id="description"
          required
          rows={4}
          className="input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide details about this expense..."
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
          Amount ($) *
        </label>
        <input
          id="amount"
          type="number"
          required
          min="0.01"
          step="0.01"
          className="input"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          disabled={isLoading}
        />
        {parseFloat(amount) > 100 && (
          <p className="mt-1 text-xs text-amber-600">
            ⚠️ Expenses over $100 require a receipt attachment before submission
          </p>
        )}
      </div>

      {!isEdit && (
        <div>
          <label htmlFor="expenseDate" className="block text-sm font-medium text-gray-700 mb-2">
            Expense Date *
          </label>
          <input
            id="expenseDate"
            type="date"
            required
            max={new Date().toISOString().split('T')[0]}
            className="input"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-gray-500">Cannot be in the future or older than 90 days</p>
        </div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1" disabled={isLoading}>
          Cancel
        </button>
        <button type="submit" className="btn-primary flex-1" disabled={isLoading}>
          {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};
