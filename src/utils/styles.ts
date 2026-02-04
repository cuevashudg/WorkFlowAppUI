// Button utility classes
export const btnBase = "px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
export const btnPrimary = `${btnBase} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`;
export const btnSecondary = `${btnBase} bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500`;
export const btnDanger = `${btnBase} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`;
export const btnSuccess = `${btnBase} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500`;

// Input utility classes
export const inputBase = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

// Card utility classes
export const card = "bg-white rounded-lg shadow-md p-6";

// Badge utility classes
export const badgeBase = "px-2 py-1 text-xs font-semibold rounded-full";
export const badgeDraft = `${badgeBase} bg-gray-200 text-gray-800`;
export const badgeSubmitted = `${badgeBase} bg-blue-200 text-blue-800`;
export const badgeApproved = `${badgeBase} bg-green-200 text-green-800`;
export const badgeRejected = `${badgeBase} bg-red-200 text-red-800`;

export const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'Draft':
      return badgeDraft;
    case 'Submitted':
      return badgeSubmitted;
    case 'Approved':
      return badgeApproved;
    case 'Rejected':
      return badgeRejected;
    default:
      return badgeBase;
  }
};
