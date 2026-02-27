import React from 'react';

interface BulkActionsProps {
  selectedCount: number;
  totalCount: number;
  isProcessing: boolean;
  onToggleSelectAll: () => void;
  onBulkApprove: () => void;
  onBulkReject: () => void;
  allSelected: boolean;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  isProcessing,
  onToggleSelectAll,
  onBulkApprove,
  onBulkReject,
  allSelected,
}) => {
  return (
    <div className="mb-4 flex gap-2 items-center">
      <input
        type="checkbox"
        checked={allSelected}
        onChange={onToggleSelectAll}
        className="mr-2"
      />
      <span className="text-sm">Select All</span>
      {selectedCount > 0 && (
        <span className="text-sm text-gray-500 ml-2">({selectedCount} selected)</span>
      )}
      <button
        onClick={onBulkApprove}
        className="btn-success ml-4"
        disabled={selectedCount === 0 || isProcessing}
      >
        ✓ Bulk Approve
      </button>
      <button
        onClick={onBulkReject}
        className="btn-danger ml-2"
        disabled={selectedCount === 0 || isProcessing}
      >
        ✗ Bulk Reject
      </button>
    </div>
  );
};
