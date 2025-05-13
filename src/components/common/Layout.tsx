
import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  requiredRoles?: string[];
}

const Layout: React.FC<LayoutProps> = ({ requiredRoles = [] }) => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Check if user has required role
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 relative">
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
            onClick={toggleSidebar}
          ></div>
        )}
        
        <Sidebar isOpen={sidebarOpen} toggle={toggleSidebar} />
        
        <main className="flex-1 p-4 md:p-6 max-w-full overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
