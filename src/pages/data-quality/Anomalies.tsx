import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import AlertCard from '@/components/data-quality/AlertCard';
import CorrectionModal from '@/components/data-quality/CorrectionModal';
import { anomalyService } from '@/services/api';
import { toast } from 'sonner';
import { AnomalyType } from '@/types';
import { Anomaly, AnomalyFilter } from '@/types/pi-tag';

const Anomalies = () => {
  const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const sitesData = await anomalyService.getSites();
        setSites(sitesData);
      } catch (error) {
        console.error('Error fetching sites:', error);
      }
    };

    fetchSites();
  }, []);
  
  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      const filters: AnomalyFilter = {
        startDate: formattedStartDate,
        endDate: formattedEndDate
      };
      
      if (selectedSite !== 'all') {
        filters.siteId = selectedSite;
      }
      
      const anomaliesData = await anomalyService.getAnomalies(filters);
      setAnomalies(anomaliesData);
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      toast.error('Failed to load anomalies');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAnomalies();
  }, [selectedSite, startDate, endDate]);
  
  const handleAnomalyClick = (anomaly: Anomaly) => {
    // IF-05: Double-click row -> Open CorrectionModal pre-filled
    setSelectedAnomaly(anomaly);
    setModalOpen(true);
  };
  
  const handleSaveCorrection = async (readingId: string, newValue: number, comment: string) => {
    try {
      await anomalyService.correctAnomaly({
        readingId,
        value: newValue,
        comment
      });
      
      // IF-06: Green toast "Correction saved"
      toast.success('Correction saved');
      
      // Refresh anomalies list
      fetchAnomalies();
      
      // Close modal
      setModalOpen(false);
      setSelectedAnomaly(null);
    } catch (error) {
      console.error('Error saving correction:', error);
      toast.error('Failed to save correction');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-dark">Anomalies</h1>
      </div>
      
      <Card className="shadow-sm ring-1 ring-dark/10">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Site
              </label>
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sites</SelectItem>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Start Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                End Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : anomalies.length > 0 ? (
          anomalies.map((anomaly) => (
            <AlertCard
              key={anomaly.id}
              title={anomaly.meterName}
              type={anomaly.type}
              date={anomaly.date}
              value={anomaly.value}
              delta={anomaly.delta}
              site={anomaly.siteName}
              meter={anomaly.meterName}
              onClick={() => handleAnomalyClick(anomaly)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            No anomalies found for the selected criteria
          </div>
        )}
      </div>
      
      {selectedAnomaly && (
        <CorrectionModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedAnomaly(null);
          }}
          anomaly={{
            id: selectedAnomaly.id,
            readingId: selectedAnomaly.readingId,
            value: selectedAnomaly.value || 0,
            timestamp: selectedAnomaly.date,
            type: selectedAnomaly.type,
            delta: selectedAnomaly.delta || 0,
            comment: selectedAnomaly.comment || '',
            siteName: selectedAnomaly.siteName,
            meterType: selectedAnomaly.type
          }}
          onSave={handleSaveCorrection}
        />
      )}
    </div>
  );
};

export default Anomalies;
