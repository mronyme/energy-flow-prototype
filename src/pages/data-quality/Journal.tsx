
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Download } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import LogTable from '@/components/data-quality/LogTable';
import { journalService } from '@/services/api';
import { toast } from 'sonner';
import { JournalFilter } from '@/types/pi-tag';

const Journal = () => {
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      const filters: JournalFilter = {
        startDate: formattedStartDate,
        endDate: formattedEndDate
      };
      
      const logsData = await journalService.getImportLogs(filters);
      
      setLogs(logsData);
    } catch (error) {
      console.error('Error fetching import logs:', error);
      toast.error('Failed to load import logs');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLogs();
  }, [startDate, endDate]);
  
  const handleExportCsv = async () => {
    try {
      // IF-08: Export CSV functionality
      setExporting(true);
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      const filters: JournalFilter = {
        startDate: formattedStartDate,
        endDate: formattedEndDate
      };
      
      await journalService.exportCsv(filters);
      
      // Toast is not needed as the file download is the feedback
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-dark">Import Journal</h1>
        
        <Button 
          onClick={handleExportCsv} 
          disabled={exporting || logs.length === 0}
          className="transition-all duration-100 ease-out"
        >
          {exporting ? (
            <>
              <span className="mr-2">Exporting...</span>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </>
          )}
        </Button>
      </div>
      
      <Card className="shadow-sm ring-1 ring-dark/10">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Start Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                End Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm ring-1 ring-dark/10">
        <CardHeader>
          <CardTitle>Import Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : logs.length > 0 ? (
            <LogTable data={logs} onExport={handleExportCsv} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              No import logs found for the selected period
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Journal;
