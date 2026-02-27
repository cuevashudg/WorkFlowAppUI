/**
 * Builds the full URL for viewing/downloading an expense attachment.
 * Centralizes the URL construction so it's consistent across all components.
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5056';

export const getAttachmentUrl = (expenseId: string, fileName: string): string => {
  return `${API_URL}/api/expenses/${expenseId}/attachments/${encodeURIComponent(fileName)}`;
};
