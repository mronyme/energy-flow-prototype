
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { siteService, meterService, readingService } from '../../services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import EditableTable from '../../components/data-load/EditableTable';
import { toast } from 'sonner';
import { Site, Meter, Reading } from '../../types';
import { dateUtils } from '../../utils/validation';

const ManualEntry = () => {
  const { user } = useAuth();
  
  const [sites, setSites] = useState<Site[]>([]);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tableData, setTableData] = useState<Array<{
    id: string;
    name: string;
    value: number | null;
    unit: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  
  // Load sites on component mount
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const sitesData = await siteService.getAll();
        setSites(sitesData);
        
        // Pre-select the first site if available
        if (sitesData.length > 0) {
          setSelectedSite(sitesData[0].id);
        }
      } catch (error) {
        console.error('Error fetching sites:', error);
        toast.error('Failed to load sites');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSites();
  }, []);
  
  // Load meters when site changes
  useEffect(() => {
    if (!selectedSite) return;
    
    const fetchMeters = async () => {
      setLoading(true);
      try {
        const metersData = await meterService.getBySiteId(selectedSite);
        setMeters(metersData);
        
        // Now get readings for these meters for the selected date
        await loadReadings(metersData, selectedDate);
      } catch (error) {
        console.error('Error fetching meters:', error);
        toast.error('Failed to load meters');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMeters();
  }, [selectedSite]);
  
  // Load readings when date changes
  useEffect(() => {
    if (meters.length > 0) {
      loadReadings(meters, selectedDate);
    }
  }, [selectedDate]);
  
  const loadReadings = async (metersToLoad: Meter[], date: Date) => {
    setLoading(true);
    
    try {
      // Format date as YYYY-MM-DD
      const formattedDate = dateUtils.format(date);
      
      // Get all readings
      const allReadings = await readingService.getAll();
      
      // Prepare table data
      const newTableData = metersToLoad.map(meter => {
        // Find reading for this meter on the selected date (if exists)
        const reading = allReadings.find(r => 
          r.meter_id === meter.id && 
          r.ts.split('T')[0] === formattedDate
        );
        
        // Get meter type to determine unit
        const unit = meter.type === 'ELEC' ? 'kWh' : meter.type === 'GAS' ? 'm³' : 'm³';
        
        return {
          id: meter.id,
          name: `${getSelectedSiteName()} - ${meter.type}`,
          value: reading ? reading.value : null,
          unit
        };
      });
      
      setTableData(newTableData);
    } catch (error) {
      console.error('Error loading readings:', error);
      toast.error('Failed to load readings');
    } finally {
      setLoading(false);
    }
  };
  
  const getSelectedSiteName = () => {
    const site = sites.find(s => s.id === selectedSite);
    return site ? site.name : '';
  };
  
  const handleSaveReading = async (meterId: string, value: number) => {
    if (!user) return;
    
    try {
      // Format date as YYYY-MM-DD
      const formattedDate = dateUtils.format(selectedDate);
      
      // Create ISO timestamp for selected date at midnight UTC
      const timestamp = `${formattedDate}T00:00:00Z`;
      
      // Get all readings to check if one already exists
      const allReadings = await readingService.getAll();
      
      // Check if reading already exists for this meter on this date
      const existingReading = allReadings.find(r => 
        r.meter_id === meterId && 
        r.ts.split('T')[0] === formattedDate
      );
      
      if (existingReading) {
        // Update existing reading
        await readingService.update({
          ...existingReading,
          value
        });
      } else {
        // Create new reading
        await readingService.create({
          meter_id: meterId,
          ts: timestamp,
          value
        });
      }
      
      // Refresh the table
      await loadReadings(meters, selectedDate);
      
      toast.success('Reading saved');
    } catch (error) {
      console.error('Error saving reading:', error);
      toast.error('Failed to save reading');
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark">Manual Entry</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Enter Meter Readings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Site</label>
              <Select value={selectedSite} onValueChange={setSelectedSite} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map(site => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <DatePicker
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={loading}
                className="w-full"
              />
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            tableData.length > 0 ? (
              <EditableTable 
                data={tableData} 
                onSave={handleSaveReading} 
              />
            ) : (
              <div className="text-center py-10 text-gray-500">
                No meters available for the selected site
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualEntry;
