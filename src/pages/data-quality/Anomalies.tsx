
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { anomalyService, readingService } from '../../services/api';
import { dateUtils } from '../../utils/validation';
import AlertCard from '../../components/data-quality/AlertCard';
import CorrectionModal from '../../components/data-quality/CorrectionModal';
import { toast } from 'sonner';

interface AnomalyDetail {
  id: string;
  readingId: string;
  meterId: string;
  siteId: string;
  siteName: string;
  meterType: string;
  timestamp: string;
  value: number;
  type: string;
  delta: number | null;
  comment: string | null;
}

const Anomalies = () => {
  const [anomalies, setAnomalies] = useState<AnomalyDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  useEffect(() => {
    loadAnomalies();
  }, []);
  
  const loadAnomalies = async () => {
    setLoading(true);
    try {
      const anomalyDetails = await anomalyService.getAnomalyDetails();
      setAnomalies(anomalyDetails);
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      toast.error('Failed to load anomalies');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAnomalyClick = (anomaly: AnomalyDetail) => {
    setSelectedAnomaly(anomaly);
    setModalOpen(true);
  };
  
  const handleSaveCorrection = async (readingId: string, newValue: number, comment: string, anomalyId: string) => {
    try {
      // First get the reading
      const reading = await readingService.getById(readingId);
      if (!reading) {
        throw new Error('Reading not found');
      }
      
      // Update the reading with the new value
      await readingService.update({
        ...reading,
        value: newValue
      });
      
      // Then update the anomaly comment
      const anomaly = await anomalyService.getByReadingId(readingId);
      if (anomaly) {
        await anomalyService.update({
          ...anomaly,
          comment
        });
      }
      
      // Refresh the anomalies list
      await loadAnomalies();
      
      toast.success('Correction saved');
    } catch (error) {
      console.error('Error saving correction:', error);
      throw error;
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark">Anomalies</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : anomalies.length > 0 ? (
          anomalies.map((anomaly) => (
            <AlertCard
              key={anomaly.id}
              title={`${anomaly.type} Anomaly`}
              type={anomaly.type as 'SPIKE' | 'MISSING' | 'FLAT'}
              date={dateUtils.formatDisplay(anomaly.timestamp)}
              value={anomaly.value}
              delta={anomaly.delta}
              site={anomaly.siteName}
              meter={anomaly.meterType}
              onClick={() => handleAnomalyClick(anomaly)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            No anomalies found
          </div>
        )}
      </div>
      
      <CorrectionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        anomaly={selectedAnomaly}
        onSave={handleSaveCorrection}
      />
    </div>
  );
};

export default Anomalies;
