
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const getPageTitle = () => {
    switch (true) {
      case location.pathname === '/':
        return 'Dashboard';
      case location.pathname.includes('/data-load/manual-entry'):
        return 'Manual Entry';
      case location.pathname.includes('/data-load/csv-import'):
        return 'CSV Import';
      case location.pathname.includes('/data-load/pi-preview'):
        return 'PI Preview';
      case location.pathname.includes('/data-quality/anomalies'):
        return 'Anomalies';
      case location.pathname.includes('/data-quality/journal'):
        return 'Import Journal';
      case location.pathname.includes('/admin/units-factors'):
        return 'Emission Factors';
      case location.pathname.includes('/admin/users'):
        return 'User Management';
      default:
        return 'MAXI V2';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm" role="banner">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-standard md:hidden"
          aria-label="Toggle sidebar navigation"
          aria-expanded={isMobile ? "false" : "true"}
          aria-controls="main-sidebar"
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="ENGIE Logo" className="h-8 w-auto" />
          <div className="flex flex-col">
            <span className="text-dark font-bold text-lg">MAXI V2</span>
            <span className="text-xs text-gray-500">Energy Monitoring Platform</span>
          </div>
        </div>
      </div>
      
      <h1 className="text-xl font-semibold text-dark hidden md:block" id="page-title">
        {getPageTitle()}
      </h1>
      
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user.email}</p>
              <p className="text-xs text-gray-500">Role: {user.role}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => logout()}
              aria-label="Log out"
            >
              Logout
            </Button>
          </>
        ) : (
          <Link to="/login">
            <Button size="sm" aria-label="Log in to the application">Login</Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
