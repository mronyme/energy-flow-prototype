
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AlertCard from '@/components/data-quality/AlertCard';
import CorrectionModal from '@/components/data-quality/CorrectionModal';
import { DatePicker } from '@/components/ui/date-picker';
import { anomalyService, siteService, readingService } from '@/services/api';
import { toast } from 'sonner';
import { AnomalyData } from '@/types/anomaly-data';
import { useAnnouncer } from '@/components/common/A11yAnnouncer';
import { dateUtils } from '@/utils/validation';

const Anomalies: React.FC = () => {
  const [anomalies, setAnomalies] = useState<AnomalyData[]>([]);
  const [sites, setSites] = useState<{ id: string, name: string }[]>([]);
  const [selectedSite, setSelectedSite] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // Last 7 days
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyData | null>(null);
  const { announce } = useAnnouncer();
  
  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Load sites
        const sitesData = await siteService.getSites();
        setSites(sitesData);
        
        // Load anomalies
        await loadAnomalies();
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error('Failed to load anomaly data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Load anomalies based on filters
  const loadAnomalies = async () => {
    try {
      setLoading(true);
      
      // Get all anomalies - in a real implementation, we would filter by date range and site
      const anomalyResults = await anomalyService.getAnomalies(100);
      
      // Process the results into the expected format
      const processedAnomalies: AnomalyData[] = anomalyResults.map(anomaly => {
        // Extract nested data from the joined query
        const reading = anomaly.reading_id ? { id: anomaly.reading_id, ts: '', value: 0 } : null;
        const meterId = '';
        const meterType = 'ELEC'; // Default to ELEC as fallback
        
        return {
          id: anomaly.id,
          readingId: reading?.id || '',
          timestamp: reading?.ts || new Date().toISOString(),
          value: reading?.value || null,
          meterId: meterId,
          meterName: 'Unknown',
          meterType: meterType,
          siteId: '',
          siteName: 'Unknown',
          type: anomaly.type || 'MISSING',
          delta: anomaly.delta || null,
          comment: anomaly.comment || null
        };
      });
      
      setAnomalies(processedAnomalies);
    } catch (error) {
      console.error('Error loading anomalies:', error);
      toast.error('Failed to load anomalies');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilter = async () => {
    await loadAnomalies();
    announce('Anomalies filtered', false);
  };
  
  const handleOpenModal = (anomaly: AnomalyData) => {
    setSelectedAnomaly(anomaly);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAnomaly(null);
  };
  
  const handleSaveCorrection = async (readingId: string, newValue: number, comment: string, anomalyId: string) => {
    try {
      // Update the reading's value
      await readingService.saveReading({
        id: readingId,
        value: newValue
      });
      
      // Update the anomaly with the comment
      await anomalyService.updateAnomaly(anomalyId, { comment });
      
      toast.success('Correction saved');
      
      // Refresh the anomaly list
      await loadAnomalies();
    } catch (error) {
      console.error('Error saving correction:', error);
      toast.error('Failed to save correction');
      throw error; // Re-throw to let the modal handle the error
    }
  };
  
  // Filter anomalies based on selection
  const filteredAnomalies = anomalies.filter(anomaly => {
    if (selectedSite !== 'all' && anomaly.siteId !== selectedSite) return false;
    if (selectedType !== 'all' && anomaly.type !== selectedType) return false;
    
    // Filter by date range
    const anomalyDate = new Date(anomaly.timestamp);
    return anomalyDate >= startDate && anomalyDate <= endDate;
  });
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Anomaly Detection & Correction</h1>
      
      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label htmlFor="site-filter">Site</Label>
            <Select
              value={selectedSite}
              onValueChange={setSelectedSite}
            >
              <SelectTrigger id="site-filter">
                <SelectValue placeholder="Select a site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                {sites.map(site => (
                  <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type-filter">Anomaly Type</Label>
            <Select
              value={selectedType}
              onValueChange={setSelectedType}
            >
              <SelectTrigger id="type-filter">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="SPIKE">Spike</SelectItem>
                <SelectItem value="MISSING">Missing</SelectItem>
                <SelectItem value="FLAT">Flat</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Start Date</Label>
            <DatePicker
              selected={startDate}
              onSelect={setStartDate}
            />
          </div>
          
          <div className="space-y-2">
            <Label>End Date</Label>
            <DatePicker
              selected={endDate}
              onSelect={setEndDate}
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button onClick={handleFilter} disabled={loading}>
            {loading ? 'Loading...' : 'Apply Filters'}
          </Button>
        </div>
      </Card>
      
      {/* Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Anomalies {filteredAnomalies.length > 0 && `(${filteredAnomalies.length})`}
        </h2>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredAnomalies.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            No anomalies found for the selected filters
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAnomalies.map(anomaly => (
              <AlertCard
                key={anomaly.id}
                anomalyData={anomaly}
                onClick={() => handleOpenModal(anomaly)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Correction Modal */}
      <CorrectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        anomaly={selectedAnomaly}
        onSave={handleSaveCorrection}
      />
    </div>
  );
};

export default Anomalies;
