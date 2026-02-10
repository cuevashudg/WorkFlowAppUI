import React, { useState, useEffect } from 'react';
import type { ExpenseComment } from '../types';
import { expenseApi } from '../api/expenses';
import toast from 'react-hot-toast';
import { handleApiError } from '../api/client';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface CommentsProps {
  expenseId: string;
}

export const Comments: React.FC<CommentsProps> = ({ expenseId }) => {
  const [comments, setComments] = useState<ExpenseComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { hasRole } = useAuth();

  useEffect(() => {
    loadComments();
  }, [expenseId]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const data = await expenseApi.getComments(expenseId);
      setComments(data);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      setIsSubmitting(true);
      const comment = await expenseApi.addComment(expenseId, newComment);
      setComments([...comments, comment]);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const canAddComment = hasRole([UserRole.Manager, UserRole.Admin]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments & Notes</h3>
      
      {/* Comments List */}
      {isLoading ? (
        <p className="text-gray-500">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-sm italic">No comments yet</p>
      ) : (
        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div key={comment.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900">{comment.userName}</span>
                <span className="text-xs text-gray-500">
                  {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Comment Form - Only for Managers/Admins */}
      {canAddComment && (
        <form onSubmit={handleSubmit} className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Comment (Manager/Admin only)
          </label>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="input mb-3"
            placeholder="Add a note or request more information..."
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting || !newComment.trim()}
          >
            {isSubmitting ? 'Adding...' : 'Add Comment'}
          </button>
        </form>
      )}

      {!canAddComment && (
        <p className="text-xs text-gray-500 italic mt-4">
          Only managers and admins can add comments
        </p>
      )}
    </div>
  );
};
