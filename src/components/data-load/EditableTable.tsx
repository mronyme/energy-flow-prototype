
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save } from 'lucide-react';
import { readingService } from '@/services/api';
import { toast } from 'sonner';

interface EditableTableProps {
  data?: Array<{
    id: string;
    name: string;
    value: number | null;
    unit: string;
  }>;
  onSave?: (id: string, value: number) => void;
  refreshTrigger?: number;
}

const EditableTable: React.FC<EditableTableProps> = ({ data = [], onSave, refreshTrigger = 0 }) => {
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Load recent readings when component mounts or refreshTrigger changes
  useEffect(() => {
    const fetchRecentReadings = async () => {
      try {
        setLoading(true);
        // Using getReadings instead of getMeterReadings
        const readings = await readingService.getReadings();
        setTableData(readings || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching readings:', error);
        toast.error('Failed to load readings');
        setLoading(false);
      }
    };
    
    fetchRecentReadings();
  }, [refreshTrigger]);
  
  const handleInputChange = (id: string, value: string) => {
    setEditValues(prev => ({ ...prev, [id]: value }));
    
    // Validate the input
    if (value.trim() === '') {
      setEditErrors(prev => ({ ...prev, [id]: 'Value is required' }));
    } else if (isNaN(parseFloat(value)) || parseFloat(value) < 0) {
      setEditErrors(prev => ({ ...prev, [id]: 'Must be a positive number' }));
    } else {
      setEditErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };
  
  const handleSave = async (id: string) => {
    const value = editValues[id];
    
    if (!value || isNaN(parseFloat(value)) || parseFloat(value) < 0) {
      setEditErrors(prev => ({ ...prev, [id]: 'Invalid value' }));
      return;
    }
    
    if (onSave) {
      onSave(id, parseFloat(value));
    } else {
      try {
        // Fix: Use updateReading instead of saveReading
        await readingService.updateReading({
          id: id,
          value: parseFloat(value)
        });
        toast.success('Reading updated successfully');
        
        // Update the local table data
        setTableData(prev => 
          prev.map(item => 
            item.id === id ? { ...item, value: parseFloat(value) } : item
          )
        );
      } catch (error) {
        console.error('Error updating reading:', error);
        toast.error('Failed to update reading');
      }
    }
    
    // Clear the value from editValues after saving
    setEditValues(prev => {
      const newValues = { ...prev };
      delete newValues[id];
      return newValues;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm ring-1 ring-dark/10 overflow-hidden">
      {loading ? (
        <div className="flex justify-center items-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Meter</TableHead>
              <TableHead>Current Value</TableHead>
              <TableHead>New Value</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                  No recent readings found
                </TableCell>
              </TableRow>
            ) : (
              tableData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.value !== null ? `${row.value} ${row.unit || ''}` : 'N/A'}</TableCell>
                  <TableCell>
                    <div className="relative">
                      <Input
                        value={editValues[row.id] || ''}
                        onChange={(e) => handleInputChange(row.id, e.target.value)}
                        placeholder="Enter value"
                        className={editErrors[row.id] ? 'border-red-500' : ''}
                      />
                      {editErrors[row.id] && (
                        <p className="text-xs text-red-500 absolute">
                          {editErrors[row.id]}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSave(row.id)}
                      disabled={!!editErrors[row.id] || !editValues[row.id]}
                    >
                      <Save size={16} className="mr-1" />
                      Save
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default EditableTable;
