export const UserRole = {
  Employee: 0,
  Manager: 1,
  Admin: 2,
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const UserRoleNames: Record<number, string> = {
  0: 'Employee',
  1: 'Manager',
  2: 'Admin',
};

// Helper to convert role string from backend to number
export const parseUserRole = (roleString: string): UserRole => {
  const roleMap: Record<string, UserRole> = {
    'Employee': UserRole.Employee,
    'Manager': UserRole.Manager,
    'Admin': UserRole.Admin,
  };
  return roleMap[roleString] ?? UserRole.Employee;
};

export const ExpenseStatus = {
  Draft: 0,
  Submitted: 1,
  Approved: 2,
  Rejected: 3,
} as const;

export type ExpenseStatus = typeof ExpenseStatus[keyof typeof ExpenseStatus];

export const ExpenseStatusNames: Record<number, string> = {
  0: 'Draft',
  1: 'Submitted',
  2: 'Approved',
  3: 'Rejected',
};

// Helper to convert status string from backend to number
export const parseExpenseStatus = (statusString: string): ExpenseStatus => {
  const statusMap: Record<string, ExpenseStatus> = {
    'Draft': ExpenseStatus.Draft,
    'Submitted': ExpenseStatus.Submitted,
    'Approved': ExpenseStatus.Approved,
    'Rejected': ExpenseStatus.Rejected,
  };
  return statusMap[statusString] ?? ExpenseStatus.Draft;
};

export interface User {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
}

export interface LoginResponse {
  token: string;
  userId: string;
  email: string;
  fullName: string;
  role: UserRole | string; // Backend sends string, we convert to number
  expiresIn: string;
}

export interface ExpenseRequest {
  id: string;
  creatorId: string;
  creatorName?: string;
  categoryId?: string;
  category?: ExpenseCategory;
  title: string;
  description: string;
  amount: number;
  status: ExpenseStatus;
  expenseDate: string;
  createdAt: string;
  updatedAt?: string;
  submittedAt?: string;
  processedAt?: string;
  processedBy?: string;
  rejectionReason?: string;
  attachmentUrls: string[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ExpenseQuery {
  search?: string;
  status?: ExpenseStatus;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface AuditLog {
  id: string;
  expenseRequestId: string;
  userId: string;
  action: string;
  previousStatus?: ExpenseStatus;
  newStatus?: ExpenseStatus;
  details?: string;
  timestamp: string;
}

export interface ExpenseComment {
  id: string;
  expenseRequestId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface CreateExpenseRequest {
  title: string;
  description: string;
  amount: number;
  expenseDate: string;
  categoryId?: string;
}

export interface UpdateExpenseRequest {
  title: string;
  description: string;
  amount: number;
  categoryId?: string;
}

export interface RejectExpenseRequest {
  reason: string;
}

export interface ApiError {
  error?: string;
  message?: string;
  errors?: string[];
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  createdAt: string;
}

export interface ExpenseAnalytics {
  totalExpenses: number;
  approvedAmount: number;
  pendingAmount: number;
  totalCount: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  averageExpense: number;
  categoryBreakdown: CategorySpending[];
  monthlyTrends: MonthlyTrend[];
}

export interface CategorySpending {
  categoryId: string | null;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  totalAmount: number;
  count: number;
}

export interface MonthlyTrend {
  year: number;
  month: number;
  monthName: string;
  totalAmount: number;
  count: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface ApprovalRateData {
  period: string;
  totalSubmitted: number;
  approved: number;
  rejected: number;
  approvalRate: number;
  rejectionRate: number;
}

export interface Budget {
  id: string;
  name: string;
  description?: string;
  amount: number;
  startDate: string;
  endDate: string;
  userId?: string;
  categoryId?: string;
  category?: ExpenseCategory;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface BudgetStatus {
  budgetId: string;
  budgetName: string;
  description?: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  categoryName?: string;
  categoryIcon?: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  isOverBudget: boolean;
  isActive: boolean;
}

export interface CreateBudgetRequest {
  name: string;
  description?: string;
  amount: number;
  startDate: string;
  endDate: string;
  categoryId?: string;
}

export interface UpdateBudgetRequest {
  name: string;
  description?: string;
  amount: number;
  startDate: string;
  endDate: string;
}
