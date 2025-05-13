
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ChartBar, 
  GaugeCircle, 
  FileText, 
  Upload, 
  Database, 
  AlertTriangle, 
  ClipboardList, 
  Settings,
  Users
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Group states for expandable sections
  const [dataLoadOpen, setDataLoadOpen] = useState(false);
  const [dataQualityOpen, setDataQualityOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  
  // Update open states based on current route
  React.useEffect(() => {
    if (location.pathname.includes('/data-load')) {
      setDataLoadOpen(true);
    }
    if (location.pathname.includes('/data-quality')) {
      setDataQualityOpen(true);
    }
    if (location.pathname.includes('/admin')) {
      setAdminOpen(true);
    }
  }, [location.pathname]);
  
  const isActive = (path: string) => location.pathname === path;
  
  const navLinkClass = (active: boolean) => `
    flex items-center gap-3 px-4 py-2.5 text-sm 
    ${active 
      ? 'bg-primary text-white font-medium rounded-md' 
      : 'text-gray-700 hover:bg-gray-100 rounded-md transition-standard'
    }
  `;
  
  const groupHeaderClass = (open: boolean) => `
    flex items-center justify-between px-4 py-2.5 text-sm font-medium 
    ${open ? 'text-dark' : 'text-gray-700'} 
    cursor-pointer hover:bg-gray-100 rounded-md transition-standard
  `;
  
  const groupContentClass = (open: boolean) => `
    overflow-hidden transition-all pl-3
    ${open ? 'max-h-48' : 'max-h-0'}
  `;
  
  const roleHasAccess = (allowedRoles: string[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <div className={`
      fixed inset-y-0 left-0 z-20 
      w-64 bg-white border-r border-gray-200 
      transform transition-transform duration-200 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0 md:static
    `}>
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 md:hidden">
          <button 
            onClick={toggle}
            className="text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {/* Dashboard - All roles */}
            <Link to="/" className={navLinkClass(isActive('/'))}>
              <ChartBar size={18} />
              <span>Dashboard</span>
            </Link>
            
            {/* Data Loading - Operator, DataManager */}
            {roleHasAccess(['Operator', 'DataManager', 'Admin']) && (
              <div>
                <div 
                  className={groupHeaderClass(dataLoadOpen)}
                  onClick={() => setDataLoadOpen(!dataLoadOpen)}
                >
                  <div className="flex items-center gap-3">
                    <GaugeCircle size={18} />
                    <span>Data Loading</span>
                  </div>
                  <svg 
                    className={`w-4 h-4 transition-transform ${dataLoadOpen ? 'rotate-90' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                
                <div className={groupContentClass(dataLoadOpen)}>
                  <Link to="/data-load/manual-entry" className={navLinkClass(isActive('/data-load/manual-entry'))}>
                    <FileText size={18} />
                    <span>Manual Entry</span>
                  </Link>
                  
                  <Link to="/data-load/csv-import" className={navLinkClass(isActive('/data-load/csv-import'))}>
                    <Upload size={18} />
                    <span>CSV Import</span>
                  </Link>
                  
                  <Link to="/data-load/pi-preview" className={navLinkClass(isActive('/data-load/pi-preview'))}>
                    <Database size={18} />
                    <span>PI Preview</span>
                  </Link>
                </div>
              </div>
            )}
            
            {/* Data Quality - DataManager */}
            {roleHasAccess(['DataManager', 'Admin']) && (
              <div>
                <div 
                  className={groupHeaderClass(dataQualityOpen)}
                  onClick={() => setDataQualityOpen(!dataQualityOpen)}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={18} />
                    <span>Data Quality</span>
                  </div>
                  <svg 
                    className={`w-4 h-4 transition-transform ${dataQualityOpen ? 'rotate-90' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                
                <div className={groupContentClass(dataQualityOpen)}>
                  <Link to="/data-quality/anomalies" className={navLinkClass(isActive('/data-quality/anomalies'))}>
                    <AlertTriangle size={18} />
                    <span>Anomalies</span>
                  </Link>
                  
                  <Link to="/data-quality/journal" className={navLinkClass(isActive('/data-quality/journal'))}>
                    <ClipboardList size={18} />
                    <span>Import Journal</span>
                  </Link>
                </div>
              </div>
            )}
            
            {/* Admin - Admin */}
            {roleHasAccess(['Admin']) && (
              <div>
                <div 
                  className={groupHeaderClass(adminOpen)}
                  onClick={() => setAdminOpen(!adminOpen)}
                >
                  <div className="flex items-center gap-3">
                    <Settings size={18} />
                    <span>Administration</span>
                  </div>
                  <svg 
                    className={`w-4 h-4 transition-transform ${adminOpen ? 'rotate-90' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                
                <div className={groupContentClass(adminOpen)}>
                  <Link to="/admin/units-factors" className={navLinkClass(isActive('/admin/units-factors'))}>
                    <Settings size={18} />
                    <span>Emission Factors</span>
                  </Link>
                  
                  <Link to="/admin/users" className={navLinkClass(isActive('/admin/users'))}>
                    <Users size={18} />
                    <span>Users</span>
                  </Link>
                </div>
              </div>
            )}
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <p>MAXI V2 - Energy Monitoring</p>
            <p>© 2025 ENGIE</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
