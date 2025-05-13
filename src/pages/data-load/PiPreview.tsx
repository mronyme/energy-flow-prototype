
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import TestTagButton from '@/components/data-load/TestTagButton';
import TagTableRO from '@/components/data-load/TagTableRO';
import { toast } from 'sonner';
import { piService, siteService } from '@/services/api';
import { PiTag } from '@/types/pi-tag';

// Import sample CSV data
import samplePiData from '@/data/sample_pi.csv';

const PiPreview: React.FC = () => {
  const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [tags, setTags] = useState<PiTag[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const loadSites = async () => {
      try {
        // Use siteService.getSites instead of piService.getSites
        const sitesData = await siteService.getSites();
        setSites(sitesData);
      } catch (error) {
        console.error('Error loading sites:', error);
        toast.error('Failed to load sites');
      }
    };
    
    loadSites();
  }, []);
  
  useEffect(() => {
    if (!selectedSite) {
      // If no site is selected, show a sample of all tags
      loadSampleTags();
      return;
    }
    
    const loadTagsForSite = async () => {
      setLoading(true);
      try {
        // Since we don't have these methods in the API, let's filter the sample data
        const filteredTags = samplePiData
          .filter(tag => tag.site_id === selectedSite)
          .map(transformToPiTag);
        
        setTags(filteredTags);
      } catch (error) {
        console.error('Error loading tags for site:', error);
        toast.error('Failed to load PI tags');
      } finally {
        setLoading(false);
      }
    };
    
    loadTagsForSite();
  }, [selectedSite]);
  
  const loadSampleTags = () => {
    setLoading(true);
    try {
      // Transform the imported CSV data into PiTag format
      const sampleTags = samplePiData.slice(0, 10).map(transformToPiTag);
      setTags(sampleTags);
    } catch (error) {
      console.error('Error loading sample tags:', error);
      toast.error('Failed to load sample tags');
    } finally {
      setLoading(false);
    }
  };
  
  const transformToPiTag = (csvRow: any): PiTag => ({
    id: csvRow.id || String(Math.random()),
    name: csvRow.tag_name,
    description: csvRow.description || '',
    unit: csvRow.unit || '',
    status: false // Initialize as a boolean false
  });
  
  const handleTestTag = async (tag: string) => {
    try {
      const result = await piService.testTag(tag);
      
      // Update the tag's status - convert string status to boolean
      setTags(prevTags => 
        prevTags.map(t => 
          t.name === tag 
            ? { ...t, status: result.success } 
            : t
        )
      );
      
      if (result.success) {
        toast.success(`Tag '${tag}' is available: ${result.value} ${result.timestamp}`);
      } else {
        toast.error(`Tag '${tag}' is not available`);
      }
    } catch (error) {
      console.error('Error testing tag:', error);
      toast.error('Failed to test tag');
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">PI Tag Preview</h1>
      
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="site-select">Filter by Site</Label>
            <select
              id="site-select"
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Sites</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          </div>
          
          <div className="text-sm text-gray-500">
            <p>This is a read-only preview of available PI tags. You can test if a tag is currently available.</p>
          </div>
        </div>
      </Card>
      
      <TagTableRO 
        tags={tags} 
        loading={loading}
        onTagTest={handleTestTag} 
      />
    </div>
  );
};

export default PiPreview;
