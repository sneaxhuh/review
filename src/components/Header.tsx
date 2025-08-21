import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm bg-white/95">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-full">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              <Link to="/">Social Feed</Link>
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link to="/profile" className="text-right hidden sm:block hover:bg-gray-100 rounded-lg p-2 transition-colors">
              <p className="text-sm font-medium text-gray-900">
                {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-500">{currentUser?.email}</p>
            </Link>
            
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};