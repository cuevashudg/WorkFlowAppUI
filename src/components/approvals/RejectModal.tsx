import React from 'react';

interface RejectModalProps {
  expenseTitle: string;
  rejectionReason: string;
  isProcessing: boolean;
  onReasonChange: (reason: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const RejectModal: React.FC<RejectModalProps> = ({
  expenseTitle,
  rejectionReason,
  isProcessing,
  onReasonChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Expense</h3>
        <p className="text-gray-600 mb-4">
          Please provide a reason for rejecting &ldquo;{expenseTitle}&rdquo;
        </p>
        <textarea
          value={rejectionReason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="Enter rejection reason..."
          className="input w-full mb-4"
          rows={4}
          autoFocus
        />
        <div className="flex gap-3">
          <button
            onClick={onSubmit}
            disabled={isProcessing || !rejectionReason.trim()}
            className="btn-danger flex-1 disabled:opacity-50"
          >
            {isProcessing ? 'Rejecting...' : 'Reject Expense'}
          </button>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="btn-secondary flex-1 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
