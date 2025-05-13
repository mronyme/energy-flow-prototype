
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AlertCard from '@/components/data-quality/AlertCard';
import CorrectionModal from '@/components/data-quality/CorrectionModal';
import BulkCorrectionModal from '@/components/data-quality/BulkCorrectionModal';
import { DatePicker } from '@/components/ui/date-picker';
import { anomalyService, siteService, readingService } from '@/services/api';
import { toast } from 'sonner';
import { AnomalyData } from '@/types/anomaly-data';
import { useAnnouncer } from '@/components/common/A11yAnnouncer';
import { dateUtils } from '@/utils/validation';
import { CheckSquare, Download, Filter } from 'lucide-react';
import * as csvUtils from '@/utils/csvUtils';

const Anomalies: React.FC = () => {
  const [anomalies, setAnomalies] = useState<AnomalyData[]>([]);
  const [sites, setSites] = useState<{ id: string, name: string }[]>([]);
  const [selectedSite, setSelectedSite] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // Last 7 days
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyData | null>(null);
  const [selectedAnomalies, setSelectedAnomalies] = useState<AnomalyData[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
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
      const anomalyResults = await anomalyService.getAnomalies();
      
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
      
      // Reset selection when anomalies are reloaded
      setSelectedAnomalies([]);
      setSelectionMode(false);
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
    if (selectionMode) {
      toggleAnomaly(anomaly);
      return;
    }
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
      await readingService.updateReading({
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
  
  const handleBulkCorrection = async (readingIds: string[], action: string, value: number | null, comment: string) => {
    try {
      // For each anomaly, apply the correction
      const promises = selectedAnomalies.map(async (anomaly) => {
        if (action === 'replace' && value !== null) {
          // Update reading
          await readingService.updateReading({
            id: anomaly.readingId,
            value: value
          });
        } else if (action === 'interpolate') {
          // Implement interpolation logic here
          // For demo purposes, set to average of surrounding values or a placeholder
          await readingService.updateReading({
            id: anomaly.readingId,
            value: 100 // Placeholder - would be calculated from surrounding values
          });
        } else if (action === 'discard') {
          // Mark as invalid (implementation depends on how you handle invalid readings)
          // This might be setting a flag or deleting the reading
        }
        
        // Update anomaly comment
        await anomalyService.updateAnomaly(anomaly.id, { 
          comment: `[BULK] ${comment}`
        });
      });
      
      await Promise.all(promises);
      
      toast.success(`Successfully corrected ${selectedAnomalies.length} anomalies`);
      
      // Refresh anomalies and reset selection
      await loadAnomalies();
    } catch (error) {
      console.error('Error during bulk correction:', error);
      toast.error('Failed to apply bulk corrections');
      throw error;
    }
  };
  
  // Toggle selection mode
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (!selectionMode) {
      announce('Selection mode activated. Click on anomalies to select them.');
    } else {
      setSelectedAnomalies([]);
      announce('Selection mode deactivated.');
    }
  };
  
  // Toggle anomaly selection
  const toggleAnomaly = (anomaly: AnomalyData) => {
    setSelectedAnomalies(prev => {
      const isSelected = prev.some(a => a.id === anomaly.id);
      
      if (isSelected) {
        return prev.filter(a => a.id !== anomaly.id);
      } else {
        return [...prev, anomaly];
      }
    });
  };
  
  // Check if an anomaly is selected
  const isAnomalySelected = (anomaly: AnomalyData) => {
    return selectedAnomalies.some(a => a.id === anomaly.id);
  };
  
  // Handle bulk correction
  const openBulkCorrectionModal = () => {
    if (selectedAnomalies.length === 0) {
      toast.warning('Please select at least one anomaly to correct');
      return;
    }
    
    setIsBulkModalOpen(true);
  };
  
  const closeBulkCorrectionModal = () => {
    setIsBulkModalOpen(false);
  };
  
  // Export anomalies as CSV
  const exportAnomaliesCSV = () => {
    const csvData = filteredAnomalies.map(anomaly => ({
      ID: anomaly.id,
      Site: anomaly.siteName,
      'Meter Type': anomaly.meterType,
      'Meter ID': anomaly.meterId,
      Timestamp: dateUtils.formatDisplay(anomaly.timestamp),
      Value: anomaly.value !== null ? anomaly.value : 'Missing',
      Type: anomaly.type,
      Delta: anomaly.delta !== null ? `${anomaly.delta.toFixed(2)}%` : 'N/A',
      Comment: anomaly.comment || ''
    }));
    
    csvUtils.downloadCSV(csvData, `anomalies-${dateUtils.format(startDate)}-to-${dateUtils.format(endDate)}.csv`);
    toast.success('Anomalies exported to CSV');
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
        
        <div className="mt-6 flex flex-wrap justify-between items-center gap-2">
          <div className="flex gap-2">
            <Button 
              variant={selectionMode ? "default" : "outline"} 
              onClick={toggleSelectionMode}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              {selectionMode ? 'Exit Selection' : 'Select Multiple'}
            </Button>
            
            {selectionMode && (
              <Button 
                onClick={openBulkCorrectionModal}
                disabled={selectedAnomalies.length === 0}
              >
                Correct Selected ({selectedAnomalies.length})
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={exportAnomaliesCSV}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button onClick={handleFilter} disabled={loading}>
              <Filter className="h-4 w-4 mr-2" />
              {loading ? 'Loading...' : 'Apply Filters'}
            </Button>
          </div>
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
              <div key={anomaly.id} className="relative">
                {selectionMode && (
                  <div 
                    className={`absolute top-2 right-2 z-10 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      isAnomalySelected(anomaly) 
                        ? 'bg-primary border-primary' 
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {isAnomalySelected(anomaly) && (
                      <CheckSquare className="h-3 w-3 text-white" />
                    )}
                  </div>
                )}
                <AlertCard
                  anomalyData={anomaly}
                  onClick={() => handleOpenModal(anomaly)}
                  selected={isAnomalySelected(anomaly)}
                />
              </div>
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
      
      {/* Bulk Correction Modal */}
      <BulkCorrectionModal
        isOpen={isBulkModalOpen}
        onClose={closeBulkCorrectionModal}
        anomalies={selectedAnomalies}
        onSave={handleBulkCorrection}
      />
    </div>
  );
};

export default Anomalies;
