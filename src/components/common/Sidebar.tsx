
import React, { useState, useEffect } from 'react';
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
  Users,
  ChevronRight,
  ChevronsLeft,
  Menu
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle }) => {
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Group states for expandable sections
  const [dataLoadOpen, setDataLoadOpen] = useState(false);
  const [dataQualityOpen, setDataQualityOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  
  // Mini mode state - retrieve from localStorage or default to false
  const [miniMode, setMiniMode] = useState(() => {
    const saved = localStorage.getItem('sidebar-mini-mode');
    return saved ? JSON.parse(saved) : false;
  });
  
  // Save mini mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-mini-mode', JSON.stringify(miniMode));
  }, [miniMode]);
  
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
    flex items-center gap-3 px-4 py-2.5 text-sm overflow-hidden whitespace-nowrap
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

  const toggleMiniMode = () => {
    setMiniMode(!miniMode);
  };

  const sidebarWidth = miniMode && !isMobile ? 'w-16' : 'w-64';

  return (
    <div 
      id="main-sidebar"
      className={`
        fixed inset-y-0 left-0 z-20 
        ${sidebarWidth} bg-white border-r border-gray-200 
        transform transition-all duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static
      `}
      role="navigation"
      aria-label="Main navigation"
      aria-hidden={isMobile && !isOpen ? "true" : "false"}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 flex justify-between items-center border-b border-gray-200">
          {!miniMode && (
            <span className="font-semibold text-dark">ENGIE Monitor</span>
          )}
          
          {isMobile ? (
            <button 
              onClick={toggle}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close sidebar"
            >
              <ChevronsLeft size={20} />
            </button>
          ) : (
            <button
              onClick={toggleMiniMode}
              className="text-gray-500 hover:text-gray-700 ml-auto"
              aria-label={miniMode ? "Expand sidebar" : "Collapse sidebar"}
            >
              {miniMode ? <Menu size={18} /> : <ChevronsLeft size={18} />}
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {/* Dashboard - All roles */}
            <Link to="/" className={navLinkClass(isActive('/'))} aria-current={isActive('/') ? 'page' : undefined}>
              <ChartBar size={18} aria-hidden="true" />
              {!miniMode && <span>Dashboard</span>}
            </Link>
            
            {/* Data Loading - Operator, DataManager */}
            {roleHasAccess(['Operator', 'DataManager', 'Admin']) && (
              <div>
                <div 
                  className={groupHeaderClass(dataLoadOpen)}
                  onClick={() => !miniMode && setDataLoadOpen(!dataLoadOpen)}
                  role="button"
                  aria-expanded={dataLoadOpen}
                  aria-controls="data-loading-menu"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      !miniMode && setDataLoadOpen(!dataLoadOpen);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <GaugeCircle size={18} aria-hidden="true" />
                    {!miniMode && <span>Data Loading</span>}
                  </div>
                  {!miniMode && (
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${dataLoadOpen ? 'rotate-90' : ''}`}
                      aria-hidden="true"
                    />
                  )}
                </div>
                
                {(!miniMode || isMobile) && (
                  <div 
                    id="data-loading-menu" 
                    className={groupContentClass(dataLoadOpen)}
                    role="region" 
                    aria-labelledby="data-loading-header"
                  >
                    <Link 
                      to="/data-load/manual-entry" 
                      className={navLinkClass(isActive('/data-load/manual-entry'))}
                      aria-current={isActive('/data-load/manual-entry') ? 'page' : undefined}
                    >
                      <FileText size={18} aria-hidden="true" />
                      <span>Manual Entry</span>
                    </Link>
                    
                    <Link 
                      to="/data-load/csv-import" 
                      className={navLinkClass(isActive('/data-load/csv-import'))}
                      aria-current={isActive('/data-load/csv-import') ? 'page' : undefined}
                    >
                      <Upload size={18} aria-hidden="true" />
                      <span>CSV Import</span>
                    </Link>
                    
                    <Link 
                      to="/data-load/pi-preview" 
                      className={navLinkClass(isActive('/data-load/pi-preview'))}
                      aria-current={isActive('/data-load/pi-preview') ? 'page' : undefined}
                    >
                      <Database size={18} aria-hidden="true" />
                      <span>PI Preview</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {/* Data Quality - DataManager */}
            {roleHasAccess(['DataManager', 'Admin']) && (
              <div>
                <div 
                  className={groupHeaderClass(dataQualityOpen)}
                  onClick={() => !miniMode && setDataQualityOpen(!dataQualityOpen)}
                  role="button"
                  aria-expanded={dataQualityOpen}
                  aria-controls="data-quality-menu"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      !miniMode && setDataQualityOpen(!dataQualityOpen);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={18} aria-hidden="true" />
                    {!miniMode && <span>Data Quality</span>}
                  </div>
                  {!miniMode && (
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${dataQualityOpen ? 'rotate-90' : ''}`}
                      aria-hidden="true"
                    />
                  )}
                </div>
                
                {(!miniMode || isMobile) && (
                  <div 
                    id="data-quality-menu" 
                    className={groupContentClass(dataQualityOpen)}
                    role="region" 
                    aria-labelledby="data-quality-header"
                  >
                    <Link 
                      to="/data-quality/anomalies" 
                      className={navLinkClass(isActive('/data-quality/anomalies'))}
                      aria-current={isActive('/data-quality/anomalies') ? 'page' : undefined}
                    >
                      <AlertTriangle size={18} aria-hidden="true" />
                      <span>Anomalies</span>
                    </Link>
                    
                    <Link 
                      to="/data-quality/journal" 
                      className={navLinkClass(isActive('/data-quality/journal'))}
                      aria-current={isActive('/data-quality/journal') ? 'page' : undefined}
                    >
                      <ClipboardList size={18} aria-hidden="true" />
                      <span>Import Journal</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {/* Admin - Admin */}
            {roleHasAccess(['Admin']) && (
              <div>
                <div 
                  className={groupHeaderClass(adminOpen)}
                  onClick={() => !miniMode && setAdminOpen(!adminOpen)}
                  role="button"
                  aria-expanded={adminOpen}
                  aria-controls="admin-menu"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      !miniMode && setAdminOpen(!adminOpen);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Settings size={18} aria-hidden="true" />
                    {!miniMode && <span>Administration</span>}
                  </div>
                  {!miniMode && (
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${adminOpen ? 'rotate-90' : ''}`}
                      aria-hidden="true"
                    />
                  )}
                </div>
                
                {(!miniMode || isMobile) && (
                  <div 
                    id="admin-menu" 
                    className={groupContentClass(adminOpen)}
                    role="region" 
                    aria-labelledby="admin-header"
                  >
                    <Link 
                      to="/admin/units-factors" 
                      className={navLinkClass(isActive('/admin/units-factors'))}
                      aria-current={isActive('/admin/units-factors') ? 'page' : undefined}
                    >
                      <Settings size={18} aria-hidden="true" />
                      <span>Emission Factors</span>
                    </Link>
                    
                    <Link 
                      to="/admin/users" 
                      className={navLinkClass(isActive('/admin/users'))}
                      aria-current={isActive('/admin/users') ? 'page' : undefined}
                    >
                      <Users size={18} aria-hidden="true" />
                      <span>Users</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
        
        <div className={cn("p-4 border-t border-gray-200", miniMode && "text-center")}>
          <div className="text-xs text-gray-500">
            {!miniMode ? (
              <>
                <p>ENGIE Monitor V2</p>
                <p>© 2025 ENGIE</p>
              </>
            ) : (
              <p>ENGIE</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
