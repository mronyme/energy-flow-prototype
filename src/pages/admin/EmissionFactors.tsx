
import React, { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import DataGridEditableAdapter from '@/components/admin/DataGridEditableAdapter';  
import SkipLinkAdapter from '@/components/common/SkipLinkAdapter';
import { adminService } from '@/services/api';
import { useAnnouncer } from '@/components/common/A11yAnnouncer';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';

interface EmissionFactor {
  id: string;
  name: string;
  value: number;
  unit: string;
  updatedAt: string;
}

const EmissionFactors = () => {
  const [factors, setFactors] = useState<EmissionFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { announce } = useAnnouncer();

  useEffect(() => {
    const loadFactors = async () => {
      try {
        const data = await adminService.getFactors();
        setFactors(data);
      } catch (error) {
        console.error('Error loading emission factors:', error);
        toast.error('Failed to load emission factors');
      } finally {
        setLoading(false);
      }
    };

    loadFactors();
  }, []);

  const handleSave = async (id: string, field: string, value: any) => {
    if (field !== 'value' || typeof value !== 'number') {
      toast.error('Only value field can be edited');
      return;
    }

    try {
      setSaving(true);
      await adminService.updateFactor(id, value);
      toast.success('Emission factor updated');

      // Update local state
      setFactors(prev => 
        prev.map(factor => 
          factor.id === id ? { ...factor, value, updatedAt: new Date().toISOString().split('T')[0] } : factor
        )
      );
    } catch (error) {
      console.error('Error updating emission factor:', error);
      toast.error('Failed to update emission factor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <SkipLinkAdapter href="#factors-grid" label="Skip to emission factors" />
      
      <h1 className="text-2xl font-bold mb-6">Emission Factors</h1>
      
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">CO₂ Emission Factors by Energy Source</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <DataGridEditableAdapter
            data={factors}
            columns={[
              { field: 'name', headerName: 'Energy Source', type: 'text' },
              { field: 'value', headerName: 'Value', type: 'number' },
              { field: 'unit', headerName: 'Unit', type: 'text' },
              { field: 'updatedAt', headerName: 'Last Updated', type: 'text' }
            ]}
            onRowUpdate={handleSave}
            isLoading={saving}
          />
        )}
      </Card>
    </div>
  );
};

export default EmissionFactors;
