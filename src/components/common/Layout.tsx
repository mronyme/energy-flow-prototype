
import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  requiredRoles?: string[];
}

const Layout: React.FC<LayoutProps> = ({ requiredRoles = [] }) => {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  // Update sidebar state when screen size changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar on Escape key when mobile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isMobile && sidebarOpen && e.key === 'Escape') {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobile, sidebarOpen]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50" role="status" aria-live="polite">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto" aria-hidden="true"></div>
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
    toast.error("You don't have permission to access this page");
    return <Navigate to="/unauthorized" />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 relative">
        {/* Overlay for mobile sidebar */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10"
            onClick={toggleSidebar}
            aria-hidden="true"
            role="presentation"
          ></div>
        )}
        
        <Sidebar isOpen={sidebarOpen} toggle={toggleSidebar} />
        
        <main 
          className="flex-1 p-4 md:p-6 max-w-full overflow-x-auto transition-all duration-100 ease-out"
          id="main-content" 
          role="main"
          tabIndex={-1}
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
