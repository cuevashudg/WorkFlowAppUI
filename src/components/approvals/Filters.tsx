import React from 'react';

interface FiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  sortValue: string;
  onSortChange: (sortBy: string, sortDir: 'asc' | 'desc') => void;
  // Advanced filters
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
  fromDate: string;
  onFromDateChange: (value: string) => void;
  toDate: string;
  onToDateChange: (value: string) => void;
  minAmount: string;
  onMinAmountChange: (value: string) => void;
  maxAmount: string;
  onMaxAmountChange: (value: string) => void;
  onClearAdvancedFilters: () => void;
  sortOptions?: { value: string; label: string }[];
}

const DEFAULT_SORT_OPTIONS = [
  { value: 'submittedAt-asc', label: 'Oldest First' },
  { value: 'submittedAt-desc', label: 'Newest First' },
  { value: 'amount-desc', label: 'Highest Amount' },
  { value: 'amount-asc', label: 'Lowest Amount' },
  { value: 'expenseDate-desc', label: 'Recent Expense Date' },
  { value: 'expenseDate-asc', label: 'Oldest Expense Date' },
];

export const Filters: React.FC<FiltersProps> = ({
  search,
  onSearchChange,
  onSearch,
  sortValue,
  onSortChange,
  showAdvancedFilters,
  onToggleAdvancedFilters,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  minAmount,
  onMinAmountChange,
  maxAmount,
  onMaxAmountChange,
  onClearAdvancedFilters,
  sortOptions = DEFAULT_SORT_OPTIONS,
}) => {
  return (
    <div className="card mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              placeholder="Search title or description..."
              className="input flex-1"
            />
            <button onClick={onSearch} className="btn-primary">
              Search
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            value={sortValue}
            onChange={(e) => {
              const [newSortBy, newSortDir] = e.target.value.split('-');
              onSortChange(newSortBy, newSortDir as 'asc' | 'desc');
            }}
            className="input"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="border-t pt-4">
        <button
          onClick={onToggleAdvancedFilters}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          {showAdvancedFilters ? '▼' : '▶'} Advanced Filters
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Date Range</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => onFromDateChange(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => onToDateChange(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <h4 className="text-sm font-semibold text-gray-700 mb-3">Amount Range</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={minAmount}
                onChange={(e) => onMinAmountChange(e.target.value)}
                placeholder="0.00"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={maxAmount}
                onChange={(e) => onMaxAmountChange(e.target.value)}
                placeholder="No limit"
                className="input"
              />
            </div>
          </div>

          <button onClick={onClearAdvancedFilters} className="btn-secondary text-sm">
            Clear Advanced Filters
          </button>
        </div>
      )}
    </div>
  );
};
