import React, { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import LogTableAdapter from '@/components/data-quality/LogTableAdapter';
import { journalService } from '@/services/api';
import { useAnnouncer } from '@/components/common/A11yAnnouncer';
import { format, subDays } from 'date-fns';

const Journal = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { announce } = useAnnouncer();
  
  useEffect(() => {
    fetchLogs();
  }, [startDate, endDate]);
  
  const fetchLogs = async () => {
    setLoading(true);
    try {
      if (startDate && endDate) {
        const formattedStartDate = format(startDate, 'yyyy-MM-dd');
        const formattedEndDate = format(endDate, 'yyyy-MM-dd');
        const data = await journalService.getJournalEntriesByDateRange(formattedStartDate, formattedEndDate);
        setLogs(data);
      } else {
        const data = await journalService.getJournalEntries();
        setLogs(data);
      }
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      announce('Error fetching journal entries.', true);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-4">Data Import Journal</h1>
      <Separator className="mb-6" />
      
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <div>
            <h2 className="text-xl font-medium mb-2">Filter by Date</h2>
            <div className="flex items-center space-x-2">
              <DatePicker
                id="start-date"
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                placeholder="Start date"
              />
              <DatePicker
                id="end-date"
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                placeholder="End date"
              />
              <Button onClick={fetchLogs} disabled={loading}>
                {loading ? 'Loading...' : 'Apply Filter'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      <h2 className="text-xl font-medium mb-2">Recent Activity</h2>
      <Card>
        <LogTableAdapter logs={logs} loading={loading} />
      </Card>
    </div>
  );
};

export default Journal;
