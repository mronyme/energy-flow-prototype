
import React, { useState, useEffect } from 'react';
import { AlertCardSummary } from '@/components/data-quality/AlertCard';
import CorrectionModal from '@/components/data-quality/CorrectionModal';
import AnomalyBadge from '@/components/data-quality/AnomalyBadge';
import { anomalyService } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAnnouncer } from '@/components/common/A11yAnnouncer';
import DatePicker from '@/components/ui/date-picker';
import { format, subDays } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Ban, Info } from 'lucide-react';
import { AnomalyType } from '@/types';

interface Anomaly {
  id: string;
  readingId: string;
  meterId: string;
  meterName: string;
  siteName: string;
  date: string;
  value: number | null;
  type: AnomalyType;
  delta: number | null;
  site: string;
  meter: string;
  comment: string;
}

const Anomalies: React.FC = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [sites, setSites] = useState<{id: string, name: string}[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();
  const { announcer, announce } = useAnnouncer();
  
  // Date filter state
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date>(new Date());
  
  // Correction modal state
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Reset modal state when closed
  useEffect(() => {
    if (!modalOpen) {
      setSelectedAnomaly(null);
    }
  }, [modalOpen]);
  
  // Load sites on mount
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const sitesData = await anomalyService.getSites();
        setSites(sitesData);
      } catch (error) {
        console.error('Error fetching sites:', error);
        toast.error({
          title: 'Error',
          description: 'Failed to load sites'
        });
      }
    };
    
    fetchSites();
  }, []);
  
  // Load anomalies based on selected filters
  const loadAnomalies = async () => {
    try {
      setLoading(true);
      const anomalyData = await anomalyService.getAnomalies({
        siteId: selectedSite,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd')
      });
      
      setAnomalies(anomalyData);
      setLoading(false);
      
      // Announce for screen readers
      announce(`Loaded ${anomalyData.length} anomalies`);
      
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      toast.error({
        title: 'Error',
        description: 'Failed to load anomalies'
      });
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadAnomalies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSite, startDate, endDate]);
  
  // Handle anomaly correction (IF-06)
  const handleSaveCorrection = async (
    readingId: string, 
    value: number, 
    comment: string
  ) => {
    try {
      // Call API to update the reading
      await anomalyService.correctAnomaly({
        readingId,
        value,
        comment
      });
      
      // Success message
      toast.success({
        title: 'Success',
        description: 'Correction saved'
      });
      announce("Anomaly correction saved successfully");
      
      // Close modal and refresh data
      setModalOpen(false);
      loadAnomalies();
      
    } catch (error) {
      console.error('Error correcting anomaly:', error);
      toast.error({
        title: 'Error',
        description: 'Failed to save correction'
      });
    }
  };
  
  // Handle row click to open correction modal (IF-05)
  const handleRowClick = (anomaly: Anomaly) => {
    setSelectedAnomaly(anomaly);
    setModalOpen(true);
    
    // Announce for screen readers
    announce(`Opening correction modal for ${anomaly.meterName} at ${anomaly.siteName}`);
  };
  
  // Handle filter updates
  const applyFilters = () => {
    loadAnomalies();
  };
  
  return (
    <>
      {announcer} {/* Screen reader announcements */}
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark mb-2">Anomalies</h1>
        <p className="text-gray-600">
          Detect and fix anomalies in meter readings.
        </p>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="site-select">Site</Label>
            <select
              id="site-select"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              disabled={loading}
              aria-label="Filter anomalies by site"
            >
              <option value="all">All Sites</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <Label htmlFor="start-date">From</Label>
            <DatePicker
              selected={startDate}
              onSelect={setStartDate}
              disabled={loading}
              label="Start date"
            />
          </div>
          
          <div>
            <Label htmlFor="end-date">To</Label>
            <DatePicker
              selected={endDate}
              onSelect={setEndDate}
              disabled={loading}
              label="End date"
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button onClick={applyFilters} disabled={loading}>
            Apply Filters
          </Button>
        </div>
      </div>
      
      {/* Anomaly summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <AlertCardSummary
          title="Missing Readings"
          count={anomalies.filter(a => a.type === 'MISSING').length}
          type="warning"
          icon={Ban}
        />
        <AlertCardSummary
          title="Spikes"
          count={anomalies.filter(a => a.type === 'SPIKE').length}
          type="error"
          icon={AlertTriangle}
        />
        <AlertCardSummary
          title="Flat Values"
          count={anomalies.filter(a => a.type === 'FLAT').length}
          type="info"
          icon={Info}
        />
      </div>
      
      {/* Anomalies table */}
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="sr-only">Loading anomalies...</span>
        </div>
      ) : (
        <div className={isMobile ? "overflow-x-auto" : ""}>
          <table className="w-full bg-white rounded-lg shadow-sm">
            <caption className="sr-only">
              List of detected anomalies in meter readings
            </caption>
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Site
                </th>
                <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Meter
                </th>
                <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Date
                </th>
                <th scope="col" className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                  Value
                </th>
                <th scope="col" className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                  Type
                </th>
                <th scope="col" className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                  Delta
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {anomalies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    No anomalies found for the selected filters
                  </td>
                </tr>
              ) : (
                anomalies.map((anomaly) => (
                  <tr 
                    key={anomaly.id}
                    className="cursor-pointer hover:bg-gray-50 transition-standard"
                    onClick={() => handleRowClick(anomaly)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleRowClick(anomaly);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Anomaly at ${anomaly.siteName}, ${anomaly.meterName}, ${anomaly.date}`}
                  >
                    <td className="px-4 py-3 text-sm">{anomaly.siteName}</td>
                    <td className="px-4 py-3 text-sm">{anomaly.meterName}</td>
                    <td className="px-4 py-3 text-sm">{anomaly.date}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      {anomaly.value === null ? '—' : anomaly.value.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <AnomalyBadge type={anomaly.type} />
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {anomaly.delta === null ? '—' : `${anomaly.delta.toFixed(2)}%`}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Correction Modal */}
      {selectedAnomaly && (
        <CorrectionModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          anomaly={selectedAnomaly}
          onSave={handleSaveCorrection}
        />
      )}
    </>
  );
};

export default Anomalies;
