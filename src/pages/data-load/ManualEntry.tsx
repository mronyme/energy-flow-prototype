
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EditableTable from '@/components/data-load/EditableTable';
import { meterService } from '@/services/api';
import { toast } from 'sonner';
import { CalendarIcon, Save } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface Meter {
  id: string;
  name: string;
  site_id: string;
  type: 'ELEC' | 'GAS' | 'WATER';
  value: number | null;
  unit: string;
}

const ManualEntry = () => {
  const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [meters, setMeters] = useState<Meter[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const sitesData = await meterService.getSites();
        setSites(sitesData);
        if (sitesData.length > 0) {
          setSelectedSite(sitesData[0].id);
        }
      } catch (error) {
        console.error('Error fetching sites:', error);
        toast.error('Failed to load sites');
      }
    };

    fetchSites();
  }, []);

  useEffect(() => {
    if (!selectedSite) return;
    
    const fetchMeters = async () => {
      try {
        setLoading(true);
        const metersData = await meterService.getMetersBySite(selectedSite);
        
        // Transform the data to include value field
        const transformedMeters = metersData.map(meter => ({
          ...meter,
          value: null,
          unit: meter.type === 'ELEC' ? 'kWh' : meter.type === 'GAS' ? 'm³' : 'L'
        }));
        
        setMeters(transformedMeters);
      } catch (error) {
        console.error('Error fetching meters:', error);
        toast.error('Failed to load meters');
      } finally {
        setLoading(false);
      }
    };

    fetchMeters();
  }, [selectedSite]);

  const handleSaveReading = async (meterId: string, value: number) => {
    if (!user) {
      toast.error('You must be logged in to save readings');
      return;
    }
    
    try {
      // Format date to YYYY-MM-DD
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      await meterService.saveReading({
        meter_id: meterId,
        value,
        ts: `${formattedDate}T12:00:00Z` // Use noon as default time
      });
      
      // Update the meters list with the new value
      setMeters(prev => 
        prev.map(meter => 
          meter.id === meterId ? { ...meter, value } : meter
        )
      );
      
      // IF-01: Green toast "Reading saved"
      toast.success('Reading saved');
      
    } catch (error) {
      console.error('Error saving reading:', error);
      toast.error('Failed to save reading');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-dark">Manual Entry</h1>
      </div>

      <Card className="shadow-sm ring-1 ring-dark/10">
        <CardHeader>
          <CardTitle>Enter B1 Reading</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Site
              </label>
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
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
                Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : meters.length > 0 ? (
            <EditableTable 
              data={meters} 
              onSave={handleSaveReading} 
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              {selectedSite 
                ? "No meters found for this site"
                : "Select a site to view meters"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualEntry;
