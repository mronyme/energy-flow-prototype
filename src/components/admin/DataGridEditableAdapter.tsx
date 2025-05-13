
import React, { useState, useEffect } from 'react';
import DataGridEditable from './DataGridEditable';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Mock data for demo purposes - in a real app, this would be fetched from an API
const mockEmissionFactors = [
  {
    id: "1",
    country: "FR",
    co2_factor: 0.052,
    unit: "kgCO2/kWh",
    source: "National Registry 2024",
    notes: "Updated yearly"
  },
  {
    id: "2",
    country: "DE",
    co2_factor: 0.338,
    unit: "kgCO2/kWh",
    source: "Federal Environment Agency",
    notes: "Includes renewable mix"
  },
  {
    id: "3",
    country: "UK",
    co2_factor: 0.193,
    unit: "kgCO2/kWh",
    source: "Department for Energy",
    notes: "Updated quarterly"
  }
];

// Define the props for this component
interface DataGridEditableAdapterProps {
  entity: string;
  columns: { field: string; headerName: string; type: "number" | "text" }[];
  onAdd: () => void;
  onEdit: (row: any) => void;
  data?: any[];
}

// This is an adapter for DataGridEditable that matches the API expected by EmissionFactors.tsx
const DataGridEditableAdapter: React.FC<DataGridEditableAdapterProps> = ({
  entity,
  columns,
  onAdd,
  onEdit,
  data
}) => {
  const [gridData, setGridData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be an API call
    // For demo purposes, we're using mock data based on entity type
    const fetchData = async () => {
      setLoading(true);
      try {
        // Using the entity prop to determine what data to load
        let mockData;
        switch(entity) {
          case "emission_factor":
            mockData = mockEmissionFactors;
            break;
          default:
            mockData = [];
        }
        
        setGridData(mockData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [entity]);

  const handleRowUpdate = async (id: string, field: string, value: any) => {
    // In a real app, this would be an API call to update the data
    try {
      // Find the row to update
      const updatedData = gridData.map(row => {
        if (row.id === id) {
          return { ...row, [field]: value };
        }
        return row;
      });
      
      setGridData(updatedData);
      toast.success(`Updated ${field}`);
      
      // In a real app, you would make an API call here
      return Promise.resolve();
    } catch (error) {
      console.error("Error updating row:", error);
      toast.error("Failed to update data");
      return Promise.reject(error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">{entity === 'emission_factor' ? 'Emission Factors' : 'Data'}</h2>
        <button 
          onClick={onAdd}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Add New
        </button>
      </div>
      
      <DataGridEditable
        data={gridData}
        columns={columns}
        onRowUpdate={handleRowUpdate}
        isLoading={loading}
      />
    </div>
  );
};

export default DataGridEditableAdapter;
