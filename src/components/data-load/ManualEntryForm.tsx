import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import DatePicker from '@/components/ui/date-picker';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { readingService, meterService, siteService } from '@/services/api';

interface ManualEntryFormProps {
  onSave: () => void;
}

const ManualEntryForm: React.FC<ManualEntryFormProps> = ({ onSave }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sites, setSites] = useState<any[]>([]);
  const [meters, setMeters] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedMeter, setSelectedMeter] = useState('');
  const [readingValue, setReadingValue] = useState('');
  const [readingDate, setReadingDate] = useState<Date | undefined>(new Date());
  const [existingReading, setExistingReading] = useState<any | null>(null);

  // Fetch sites on component mount
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const sitesData = await siteService.getSites();
        setSites(sitesData);
      } catch (error) {
        console.error('Error fetching sites:', error);
        toast.error('Failed to load sites');
      }
    };

    fetchSites();
  }, []);

  // Fetch meters when selected site changes
  useEffect(() => {
    if (!selectedSite) {
      setMeters([]);
      setSelectedMeter('');
      return;
    }

    const fetchMeters = async () => {
      try {
        setIsLoading(true);
        const metersData = await meterService.getMetersBySite(selectedSite);
        setMeters(metersData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching meters:', error);
        toast.error('Failed to load meters');
        setIsLoading(false);
      }
    };

    fetchMeters();
  }, [selectedSite]);

  // Check for existing reading when meter and date are selected
  useEffect(() => {
    if (!selectedMeter || !readingDate) {
      setExistingReading(null);
      return;
    }

    const checkExistingReading = async () => {
      try {
        const formattedDate = readingDate.toISOString().split('T')[0];
        // Use getReadings and filter manually
        const readings = await readingService.getReadings();
        
        // Filter readings by date and meter id manually
        const existingData = readings.find(r => 
          r.ts.split('T')[0] === formattedDate && r.meter_id === selectedMeter
        );
        
        setExistingReading(existingData);
        if (existingData) {
          setReadingValue(existingData.value.toString());
        } else {
          setReadingValue('');
        }
      } catch (error) {
        console.error('Error checking for existing reading:', error);
      }
    };

    checkExistingReading();
  }, [selectedMeter, readingDate]);

  const handleSaveReading = async () => {
    if (!selectedMeter || !readingDate || !readingValue) {
      toast.error('Please complete all fields');
      return;
    }

    try {
      setIsLoading(true);
      
      // Create reading object
      const readingData = {
        id: existingReading?.id,
        meter_id: selectedMeter,
        ts: readingDate.toISOString(),
        value: parseFloat(readingValue)
      };

      // Insert or update reading depending on whether it exists
      if (existingReading?.id) {
        await readingService.updateReading(readingData);
      } else {
        await readingService.createReading(readingData);
      }
      
      toast.success('Reading saved');
      onSave();
      
      // Reset form if it's a new entry, otherwise keep values for editing
      if (!existingReading) {
        setReadingValue('');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error saving reading:', error);
      toast.error('Failed to save reading');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-dark mb-4" id="manual-entry-heading">
        Manual B1 Reading Entry
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="site-select">Site</Label>
          <select
            id="site-select"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            disabled={isLoading}
            aria-describedby="site-desc"
          >
            <option value="">Select a site</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
          <p id="site-desc" className="text-sm text-gray-500">
            Select the site for this reading
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="meter-select">Meter</Label>
          <select
            id="meter-select"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={selectedMeter}
            onChange={(e) => setSelectedMeter(e.target.value)}
            disabled={!selectedSite || isLoading}
            aria-describedby="meter-desc"
          >
            <option value="">Select a meter</option>
            {meters.map((meter) => (
              <option key={meter.id} value={meter.id}>
                {meter.name} ({meter.type})
              </option>
            ))}
          </select>
          <p id="meter-desc" className="text-sm text-gray-500">
            Select the meter to record a reading for
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="reading-date">Reading Date</Label>
          <DatePicker
            selected={readingDate}
            onSelect={setReadingDate}
            disabled={isLoading}
            label="Reading date"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="reading-value">Value</Label>
          <Input
            id="reading-value"
            type="number"
            min="0"
            step="0.001"
            value={readingValue}
            onChange={(e) => setReadingValue(e.target.value)}
            disabled={!selectedMeter || isLoading}
            aria-describedby="value-desc"
            placeholder="Enter reading value"
          />
          <p id="value-desc" className="text-sm text-gray-500">
            {existingReading 
              ? "Existing reading found - updating will overwrite the current value"
              : "Enter the B1 meter reading value"}
          </p>
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        <Button
          onClick={handleSaveReading}
          disabled={!selectedMeter || !readingValue || isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? 'Saving...' : existingReading ? 'Update Reading' : 'Save Reading'}
        </Button>
      </div>
      
      {/* Screen reader announcement */}
      <div aria-live="polite" className="sr-only">
        {existingReading ? 'Existing reading found and loaded' : ''}
      </div>
    </div>
  );
};

export default ManualEntryForm;
