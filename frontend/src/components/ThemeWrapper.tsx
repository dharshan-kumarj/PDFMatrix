import React from 'react';

interface ThemeWrapperProps {
  children: React.ReactNode;
}

const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl border border-green-500/20 overflow-hidden">
          {/* Decorative Header Gradient */}
          <div className="h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600" />
          
          {/* Content */}
          <div className="p-6 sm:p-8 lg:p-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeWrapper;
