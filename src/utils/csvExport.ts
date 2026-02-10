import type { ExpenseRequest } from '../types';
import { ExpenseStatusNames } from '../types';
import { format } from 'date-fns';

/**
 * Converts an array of expenses to CSV format and triggers download
 */
export const exportExpensesToCSV = (expenses: ExpenseRequest[], filename: string = 'expenses.csv'): void => {
  // Define CSV headers
  const headers = [
    'ID',
    'Title',
    'Description',
    'Amount',
    'Status',
    'Category',
    'Expense Date',
    'Created Date',
    'Submitted Date',
    'Processed Date',
    'Creator',
    'Processed By',
    'Rejection Reason',
    'Attachments Count'
  ];

  // Convert expenses to CSV rows
  const rows = expenses.map(expense => [
    expense.id,
    `"${expense.title.replace(/"/g, '""')}"`, // Escape quotes
    `"${expense.description.replace(/"/g, '""')}"`,
    expense.amount.toFixed(2),
    ExpenseStatusNames[expense.status],
    expense.category?.name || 'Uncategorized',
    format(new Date(expense.expenseDate), 'yyyy-MM-dd'),
    format(new Date(expense.createdAt), 'yyyy-MM-dd HH:mm:ss'),
    expense.submittedAt ? format(new Date(expense.submittedAt), 'yyyy-MM-dd HH:mm:ss') : '',
    expense.processedAt ? format(new Date(expense.processedAt), 'yyyy-MM-dd HH:mm:ss') : '',
    expense.creatorName || expense.creatorId,
    expense.processedBy || '',
    expense.rejectionReason ? `"${expense.rejectionReason.replace(/"/g, '""')}"` : '',
    expense.attachmentUrls.length.toString()
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Generates a filename with current date
 */
export const generateCSVFilename = (prefix: string = 'expenses'): string => {
  const date = format(new Date(), 'yyyy-MM-dd_HHmmss');
  return `${prefix}_${date}.csv`;
};
