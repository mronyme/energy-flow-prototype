
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Download, 
  FileText, 
  BarChart, 
  FileSpreadsheet, 
  Loader2 
} from 'lucide-react';
import { dateUtils } from '@/utils/validation';
import * as csvUtils from '@/utils/csvUtils';
import { KpiDaily } from '@/types';
import { toast } from 'sonner';

interface ExportPanelProps {
  data: KpiDaily[];
  siteName?: string;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
}

const ExportPanel: React.FC<ExportPanelProps> = ({ 
  data,
  siteName = 'All Sites',
  dateRange
}) => {
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExportCSV = () => {
    try {
      setIsExporting(true);
      
      // Format the data for CSV export
      const csvData = data.map(item => ({
        Date: dateUtils.formatDisplay(item.day),
        Site: siteName,
        'Energy (kWh)': item.kwh.toFixed(2),
        'CO2 (kg)': item.co2.toFixed(2),
        'Cost (EUR)': item.cost_eur.toFixed(2)
      }));
      
      // Generate a filename with the date range
      const fileName = `energy-data-${dateUtils.format(dateRange.startDate)}-to-${dateUtils.format(dateRange.endDate)}.csv`;
      
      // Download the CSV
      csvUtils.downloadCSV(csvData, fileName);
      
      toast.success('Data exported to CSV');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    // In a real implementation, this would generate a PDF report
    toast.info('PDF export feature coming soon');
  };
  
  const handleExportExcel = () => {
    // In a real implementation, this would export to Excel
    toast.info('Excel export feature coming soon');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="end">
        <div className="text-sm font-medium text-center p-2 border-b">
          Export Options
        </div>
        <div className="p-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={handleExportCSV}
            disabled={isExporting || data.length === 0}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            CSV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={handleExportPDF}
            disabled={data.length === 0}
          >
            <BarChart className="h-4 w-4 mr-2" />
            PDF Report
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={handleExportExcel}
            disabled={data.length === 0}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ExportPanel;
