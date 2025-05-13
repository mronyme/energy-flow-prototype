
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { auditService } from '@/services/auditService';
import { useAuth } from '@/hooks/useAuth';

const formSchema = z.object({
  id: z.string().optional(),
  country: z.string().min(2, { message: 'Country code is required' }),
  co2_factor: z.number().min(0, { message: 'Factor must be a positive number' }),
  unit: z.string().min(1, { message: 'Unit is required' }),
  source: z.string().min(1, { message: 'Source is required' }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EmissionFactorFormProps {
  factor?: {
    id: string;
    country: string;
    co2_factor: number;
    unit: string;
    source: string;
    notes?: string;
  };
  onSave: (factor: FormValues) => Promise<void>;
  onCancel: () => void;
}

const EmissionFactorForm: React.FC<EmissionFactorFormProps> = ({
  factor,
  onSave,
  onCancel
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: factor?.id || undefined,
      country: factor?.country || '',
      co2_factor: factor?.co2_factor || 0,
      unit: factor?.unit || 'kgCO2/kWh',
      source: factor?.source || '',
      notes: factor?.notes || '',
    },
  });
  
  // Update form values when factor changes
  useEffect(() => {
    if (factor) {
      form.reset({
        id: factor.id,
        country: factor.country,
        co2_factor: factor.co2_factor,
        unit: factor.unit,
        source: factor.source,
        notes: factor.notes || '',
      });
    }
  }, [factor, form]);
  
  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Record the old values for audit
      const oldValue = factor ? JSON.stringify({
        country: factor.country,
        co2_factor: factor.co2_factor,
        unit: factor.unit,
        source: factor.source,
      }) : null;
      
      // Save the factor
      await onSave(values);
      
      // Log the action for audit purposes
      if (user) {
        const isNew = !factor;
        
        await auditService.createAuditLog({
          ts: new Date().toISOString(),
          user_email: user.email || 'unknown',
          action: isNew ? 'CREATE' : 'UPDATE',
          table_name: 'emission_factor',
          record_id: values.id,
          old_value: oldValue,
          new_value: JSON.stringify({
            country: values.country,
            co2_factor: values.co2_factor,
            unit: values.unit,
            source: values.source,
          }),
          description: isNew 
            ? `Created emission factor for ${values.country}`
            : `Updated emission factor for ${values.country}`
        });
      }
      
      toast.success(factor ? 'Factor updated successfully' : 'Factor created successfully');
      
    } catch (error) {
      console.error('Error saving emission factor:', error);
      toast.error('Failed to save emission factor');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input placeholder="Country code (e.g. FR)" {...field} />
              </FormControl>
              <FormDescription>
                ISO country code (2 letters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="co2_factor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CO2 Factor</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.0001"
                    min="0"
                    placeholder="0.0"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. kgCO2/kWh" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Government Publication 2025" {...field} />
              </FormControl>
              <FormDescription>
                Reference source for the emission factor
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional information about this factor" 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Factor
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EmissionFactorForm;
