
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
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
  const [sitesLoading, setSitesLoading] = useState(true);
  
  useEffect(() => {
    const loadSites = async () => {
      setSitesLoading(true);
      try {
        const sitesData = await siteService.getSites();
        setSites(sitesData);
      } catch (error) {
        console.error('Error loading sites:', error);
        toast.error('Failed to load sites. Please try again.');
      } finally {
        setSitesLoading(false);
      }
    };
    
    loadSites();
  }, []);
  
  useEffect(() => {
    if (selectedSite === '' && !sitesLoading) {
      // If no site is selected, show a sample of all tags
      loadSampleTags();
      return;
    }
    
    if (selectedSite) {
      loadTagsForSite(selectedSite);
    }
  }, [selectedSite, sitesLoading]);
  
  const loadTagsForSite = async (siteId: string) => {
    setLoading(true);
    try {
      // Since we don't have these methods in the API, let's filter the sample data
      const filteredTags = samplePiData
        .filter(tag => tag.site_id === siteId)
        .map(transformToPiTag);
      
      setTags(filteredTags);
    } catch (error) {
      console.error('Error loading tags for site:', error);
      toast.error('Failed to load PI tags for the selected site');
    } finally {
      setLoading(false);
    }
  };
  
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
    site_id: csvRow.site_id,
    unit: csvRow.unit || '',
    // Initialize status as boolean false, it will be updated when tested
    status: false
  });
  
  const handleTestTag = async (tagName: string) => {
    try {
      const result = await piService.testTag(tagName);
      
      // Update the tag's status based on test result
      setTags(prevTags => 
        prevTags.map(t => 
          t.name === tagName 
            ? { 
                ...t, 
                status: result.success,
                value: result.value,
                timestamp: result.timestamp
              } 
            : t
        )
      );
      
      if (result.success) {
        // Fix: Use the tag's unit from the tags array instead of result.unit which doesn't exist
        const tagUnit = tags.find(t => t.name === tagName)?.unit || '';
        toast.success(`Tag '${tagName}' is available: ${result.value} ${tagUnit} ${result.timestamp || ''}`);
      } else {
        toast.error(`Tag '${tagName}' is not available`);
      }
    } catch (error) {
      console.error('Error testing tag:', error);
      toast.error('Failed to test tag connection');
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">PI Tag Preview</h1>
      
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="site-select">Filter by Site</Label>
            {sitesLoading ? (
              <Skeleton className="h-10 w-full mt-1" />
            ) : (
              <select
                id="site-select"
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
              >
                <option value="">All Sites</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            )}
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
