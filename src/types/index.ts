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

export interface CreateExpenseRequest {
  title: string;
  description: string;
  amount: number;
  expenseDate: string;
}

export interface UpdateExpenseRequest {
  title: string;
  description: string;
  amount: number;
}

export interface RejectExpenseRequest {
  reason: string;
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

export interface ApiError {
  error?: string;
  message?: string;
  errors?: string[];
}
