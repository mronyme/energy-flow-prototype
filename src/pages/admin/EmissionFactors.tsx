
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DataGridEditable from '../../components/admin/DataGridEditable';
import { toast } from 'sonner';
import { factorService } from '../../services/api';

interface EmissionFactor {
  id: string;
  name: string;
  value: number;
  unit: string;
}

const EmissionFactors = () => {
  const [factors, setFactors] = useState<EmissionFactor[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadFactors();
  }, []);
  
  const loadFactors = async () => {
    setLoading(true);
    try {
      const factorsData = await factorService.getEmissionFactors();
      setFactors(factorsData);
    } catch (error) {
      console.error('Error fetching emission factors:', error);
      toast.error('Failed to load emission factors');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveFactor = async (id: string, value: number) => {
    try {
      await factorService.updateFactor(id, value);
      
      // Update local state
      setFactors(prev => 
        prev.map(factor => 
          factor.id === id ? { ...factor, value } : factor
        )
      );
      
      // Show success badge
      toast.success('Factor updated');
    } catch (error) {
      console.error('Error updating emission factor:', error);
      throw new Error('Failed to update factor');
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark">Emission Factors</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Emission Factors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <DataGridEditable data={factors} onSave={handleSaveFactor} />
              
              <div className="bg-blue-50 p-4 rounded-md border border-blue-100 text-sm text-blue-700">
                <p className="font-medium mb-1">Note:</p>
                <p>Changes to emission factors will affect all future CO₂ calculations in the system. Historical data will not be recalculated.</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmissionFactors;
