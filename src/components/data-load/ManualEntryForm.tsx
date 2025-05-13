
import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { DatePicker } from '@/components/ui/date-picker';
import { meterService, readingService, siteService } from '@/services/api';
import RealTimeValidation from './RealTimeValidation';
import { useAnnouncer } from '@/components/common/A11yAnnouncer';

const formSchema = z.object({
  meter_id: z.string().min(1, { message: 'Meter is required' }),
  date: z.date(),
  value: z.number().min(0, { message: 'Value must be a positive number' })
});

type FormValues = z.infer<typeof formSchema>;

interface ManualEntryFormProps {
  onSave: () => void;
}

interface Meter {
  id: string;
  name: string;
  type: string;
}

const ManualEntryForm: React.FC<ManualEntryFormProps> = ({ onSave }) => {
  const [sites, setSites] = useState<{id: string, name: string}[]>([]);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [historicalValues, setHistoricalValues] = useState<number[]>([]);
  const [loadingHistorical, setLoadingHistorical] = useState(false);
  const { announce } = useAnnouncer();
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = 
    useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        date: new Date(),
        value: 0
      }
    });
  
  const watchedMeterId = watch('meter_id');
  const watchedValue = watch('value');
  
  // Load sites on mount
  useEffect(() => {
    const loadSites = async () => {
      try {
        const sitesData = await siteService.getSites();
        setSites(sitesData);
        
        if (sitesData.length > 0) {
          setSelectedSite(sitesData[0].id);
        }
      } catch (error) {
        console.error('Error loading sites:', error);
      }
    };
    
    loadSites();
  }, []);
  
  // Load meters when site changes
  useEffect(() => {
    const loadMeters = async () => {
      if (!selectedSite) return;
      
      try {
        const metersData = await meterService.getMetersBySite(selectedSite);
        setMeters(metersData);
        
        if (metersData.length > 0) {
          setValue('meter_id', metersData[0].id);
        } else {
          setValue('meter_id', '');
        }
      } catch (error) {
        console.error('Error loading meters:', error);
      }
    };
    
    loadMeters();
  }, [selectedSite, setValue]);
  
  // Load historical data for the selected meter to provide validation context
  useEffect(() => {
    const loadHistoricalData = async () => {
      if (!watchedMeterId) {
        setHistoricalValues([]);
        return;
      }
      
      setLoadingHistorical(true);
      
      try {
        // Get readings for the last 30 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        const readings = await readingService.getReadingsByMeter(
          watchedMeterId,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );
        
        // Extract just the values for validation
        const values = readings.map(r => r.value).filter(v => v !== null) as number[];
        setHistoricalValues(values);
      } catch (error) {
        console.error('Error loading historical data:', error);
      } finally {
        setLoadingHistorical(false);
      }
    };
    
    loadHistoricalData();
  }, [watchedMeterId]);
  
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setSubmitting(true);
    
    try {
      // Format the date as ISO string
      const formattedDate = data.date.toISOString();
      
      await readingService.createReading({
        meter_id: data.meter_id,
        ts: formattedDate,
        value: data.value
      });
      
      toast.success('Reading saved successfully');
      announce('Reading saved successfully');
      
      // Reset form values
      reset({
        meter_id: data.meter_id, // Keep the same meter selected
        date: new Date(),
        value: 0
      });
      
      // Notify parent component that a save occurred
      onSave();
    } catch (error) {
      console.error('Error saving reading:', error);
      toast.error('Error saving reading');
      announce('Error saving reading', true);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="site">Site</Label>
          <Select 
            value={selectedSite} 
            onValueChange={setSelectedSite}
          >
            <SelectTrigger id="site" aria-label="Select site">
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
          <Label htmlFor="meter">Meter</Label>
          <Select 
            value={watchedMeterId || ''} 
            onValueChange={(value) => setValue('meter_id', value)}
            disabled={meters.length === 0}
          >
            <SelectTrigger id="meter" aria-label="Select meter">
              <SelectValue placeholder={meters.length > 0 ? "Select meter" : "No meters available"} />
            </SelectTrigger>
            <SelectContent>
              {meters.map(meter => (
                <SelectItem key={meter.id} value={meter.id}>
                  {meter.name || `Meter ${meter.id} (${meter.type})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.meter_id && (
            <p className="text-red-500 text-sm">{errors.meter_id.message}</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <DatePicker
            id="date"
            selected={watch('date')}
            onSelect={(date) => setValue('date', date)}
          />
          {errors.date && (
            <p className="text-red-500 text-sm">{errors.date.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="value">Value</Label>
          <Input
            id="value"
            type="number"
            step="0.01"
            min="0"
            {...register('value', { valueAsNumber: true })}
            aria-invalid={!!errors.value}
          />
          {errors.value && (
            <p className="text-red-500 text-sm">{errors.value.message}</p>
          )}
          
          {watchedMeterId && watchedValue !== undefined && (
            <RealTimeValidation 
              value={watchedValue} 
              historicalValues={historicalValues}
              loading={loadingHistorical}
            />
          )}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Reading'}
        </Button>
      </div>
    </form>
  );
};

export default ManualEntryForm;
