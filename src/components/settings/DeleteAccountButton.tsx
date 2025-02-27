import { useState } from 'react';
import { signOut } from 'next-auth/react';

interface DeleteAccountButtonProps {
  setIsLoading: (isLoading: boolean) => void;
}

export default function DeleteAccountButton({ setIsLoading }: DeleteAccountButtonProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  
  const handleDelete = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // If successful, sign out and redirect
        signOut({ callbackUrl: '/' });
      } else {
        const error = await response.json();
        console.error('Failed to delete account:', error);
        alert('Failed to delete account. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('An error occurred while deleting your account. Please try again.');
    } finally {
      setIsLoading(false);
      setShowConfirmation(false);
    }
  };
  
  if (showConfirmation) {
    return (
      <div className="border border-red-300 rounded-lg p-4 bg-red-50">
        <h3 className="text-lg font-medium text-red-700 mb-2">Confirm Account Deletion</h3>
        <p className="mb-4 text-gray-700">
          This action cannot be undone. Please type <strong>delete my account</strong> to confirm.
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="delete my account"
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            disabled={confirmText !== 'delete my account'}
            className={`px-4 py-2 rounded-md ${
              confirmText === 'delete my account'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Delete Permanently
          </button>
          <button
            onClick={() => setShowConfirmation(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <button
      onClick={() => setShowConfirmation(true)}
      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
    >
      Delete Account
    </button>
  );
}
