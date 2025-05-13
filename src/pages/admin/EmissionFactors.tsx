
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DataGridEditable from '@/components/admin/DataGridEditable';
import { adminService } from '@/services/api';
import { toast } from 'sonner';

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
    const fetchFactors = async () => {
      try {
        setLoading(true);
        const factorsData = await adminService.getEmissionFactors();
        setFactors(factorsData);
      } catch (error) {
        console.error('Error fetching emission factors:', error);
        toast.error('Failed to load emission factors');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFactors();
  }, []);
  
  const handleSaveValue = async (id: string, value: number) => {
    try {
      // Call service to update emission factor
      const result = await adminService.updateEmissionFactor({ id, value });
      
      if (result.success) {
        // Update value in list
        setFactors(prev => 
          prev.map(factor => 
            factor.id === id ? { ...factor, value } : factor
          )
        );
        
        // IF-10: Blue badge "Saved" - handled in DataGridEditable component
        return Promise.resolve();
      }
    } catch (error) {
      console.error('Error updating emission factor:', error);
      return Promise.reject('Failed to update emission factor');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-dark">Emission Factors</h1>
      </div>
      
      <Card className="shadow-sm ring-1 ring-dark/10">
        <CardHeader>
          <CardTitle>Emission Factors</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : factors.length > 0 ? (
            <DataGridEditable 
              data={factors} 
              onSave={handleSaveValue} 
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              No emission factors found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmissionFactors;
