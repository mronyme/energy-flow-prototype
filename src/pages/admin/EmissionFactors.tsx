
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DataGridEditableAdapter from '@/components/admin/DataGridEditableAdapter';
import EmissionFactorForm from '@/components/admin/EmissionFactorForm';
import AuditLogViewer from '@/components/admin/AuditLogViewer';

// Sample columns for the emission factors grid
const columns = [
  { name: 'country', header: 'Country', width: 100 },
  { name: 'co2_factor', header: 'CO₂ Factor', width: 120, type: 'number' },
  { name: 'unit', header: 'Unit', width: 120 },
  { name: 'source', header: 'Source', width: 200 },
  { name: 'notes', header: 'Notes', width: 250 },
];

interface EmissionFactor {
  id: string;
  country: string;
  co2_factor: number;
  unit: string;
  source: string;
  notes?: string;
}

const EmissionFactors: React.FC = () => {
  const [activeTab, setActiveTab] = useState('factors');
  const [editMode, setEditMode] = useState<boolean>(false);
  const [selectedFactor, setSelectedFactor] = useState<EmissionFactor | null>(null);

  const handleEdit = (factor: EmissionFactor) => {
    setSelectedFactor(factor);
    setEditMode(true);
  };

  const handleAdd = () => {
    setSelectedFactor(null);
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setSelectedFactor(null);
  };

  const handleSave = async (factor: EmissionFactor) => {
    // This would normally make an API call to save the factor
    console.log('Saving factor:', factor);
    
    // Return to grid view
    setEditMode(false);
    setSelectedFactor(null);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Emission Factors</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="factors">Factors</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>
        
        <TabsContent value="factors" className="pt-4">
          {editMode ? (
            <EmissionFactorForm
              factor={selectedFactor || undefined}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : (
            <DataGridEditableAdapter
              entity="emission_factor"
              columns={columns}
              onAdd={handleAdd}
              onEdit={handleEdit}
            />
          )}
        </TabsContent>
        
        <TabsContent value="audit" className="pt-4">
          <AuditLogViewer tableName="emission_factor" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmissionFactors;
