import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { analyticsApi } from '../api/analytics';
import type { ExpenseAnalytics, StatusDistribution, ApprovalRateData } from '../types';
import toast from 'react-hot-toast';
import { handleApiError } from '../api/client';

export const DashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<ExpenseAnalytics | null>(null);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
  const [approvalRates, setApprovalRates] = useState<ApprovalRateData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const [analyticsData, statusData, ratesData] = await Promise.all([
        analyticsApi.getMyExpensesAnalytics(),
        analyticsApi.getStatusDistribution(),
        analyticsApi.getApprovalRates(6),
      ]);
      setAnalytics(analyticsData);
      setStatusDistribution(statusData);
      setApprovalRates(ratesData);
    } catch (error) {
      const message = handleApiError(error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner message="Loading analytics..." />
      </Layout>
    );
  }

  if (!analytics) {
    return (
      <Layout>
        <div className="text-center text-gray-600">No analytics data available</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <button
            onClick={loadAnalytics}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Expenses */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${analytics.totalExpenses.toFixed(2)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{analytics.totalCount} expenses</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          {/* Approved Amount */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">${analytics.approvedAmount.toFixed(2)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{analytics.approvedCount} approved</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          {/* Pending Amount */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">${analytics.pendingAmount.toFixed(2)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{analytics.pendingCount} pending</p>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-full">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          {/* Average Expense */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Expense</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">${analytics.averageExpense.toFixed(2)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{analytics.rejectedCount} rejected</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Grid - 4 charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Spending by Category</h2>
            {analytics.categoryBreakdown.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No category data available</p>
            ) : (
              <div className="space-y-4">
                {analytics.categoryBreakdown.map((category) => {
                  const percentage = analytics.totalExpenses > 0 
                    ? (category.totalAmount / analytics.totalExpenses * 100).toFixed(1)
                    : 0;
                  
                  return (
                    <div key={category.categoryId || 'uncategorized'} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{category.categoryIcon}</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{category.categoryName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{category.count} expenses</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">${category.totalAmount.toFixed(2)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{percentage}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: category.categoryColor
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Status Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Status Distribution</h2>
            {statusDistribution.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No status data available</p>
            ) : (
              <div className="space-y-4">
                {statusDistribution.map((status) => {
                  const statusColors: Record<string, { bg: string; text: string }> = {
                    Draft: { bg: 'bg-gray-500', text: 'text-gray-600 dark:text-gray-400' },
                    Submitted: { bg: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
                    Approved: { bg: 'bg-green-500', text: 'text-green-600 dark:text-green-400' },
                    Rejected: { bg: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
                  };
                  const colors = statusColors[status.status] || statusColors.Draft;
                  
                  return (
                    <div key={status.status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${colors.bg}`} />
                          <div>
                            <p className={`font-medium ${colors.text}`}>{status.status}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{status.count} expenses</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">${status.totalAmount.toFixed(2)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{status.percentage}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${colors.bg}`}
                          style={{ width: `${status.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Monthly Trends */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Monthly Trends</h2>
            {analytics.monthlyTrends.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No trend data available</p>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  {analytics.monthlyTrends.map((trend) => {
                    const maxAmount = Math.max(...analytics.monthlyTrends.map(t => t.totalAmount), 1);
                    const widthPercentage = (trend.totalAmount / maxAmount * 100).toFixed(1);
                    
                    return (
                      <div key={`${trend.year}-${trend.month}`} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{trend.monthName}</span>
                          <div className="text-right">
                            <span className="font-semibold text-gray-900 dark:text-white">${trend.totalAmount.toFixed(2)}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({trend.count})</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                          <div
                            className="h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-end pr-2 transition-all duration-300"
                            style={{ width: `${widthPercentage}%`, minWidth: '40%' }}
                          >
                            <span className="text-xs font-medium text-white">
                              {trend.count} {trend.count === 1 ? 'expense' : 'expenses'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Approval Rates */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Approval Rates</h2>
            {approvalRates.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No approval data available</p>
            ) : (
              <div className="space-y-4">
                {approvalRates.map((rate) => (
                  <div key={rate.period} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{rate.period}</span>
                      <div className="text-right">
                        <span className="font-semibold text-green-600 dark:text-green-400">{rate.approvalRate}%</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          ({rate.approved}/{rate.totalSubmitted})
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <div
                        className="h-4 bg-green-500 rounded-l transition-all duration-300"
                        style={{ width: `${rate.approvalRate}%` }}
                        title={`Approved: ${rate.approvalRate}%`}
                      />
                      <div
                        className="h-4 bg-red-500 rounded-r transition-all duration-300"
                        style={{ width: `${rate.rejectionRate}%` }}
                        title={`Rejected: ${rate.rejectionRate}%`}
                      />
                      {rate.approvalRate + rate.rejectionRate < 100 && (
                        <div
                          className="h-4 bg-gray-300 dark:bg-gray-600 rounded-r"
                          style={{ width: `${100 - rate.approvalRate - rate.rejectionRate}%` }}
                          title="Pending"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{analytics.totalCount}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Expenses</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{analytics.approvedCount}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Approved</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{analytics.pendingCount}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pending</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{analytics.rejectedCount}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Rejected</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
