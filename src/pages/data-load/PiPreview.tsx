
import React, { useState, useEffect } from 'react';
import TagTableRO from '@/components/data-load/TagTableRO';
import { piService } from '@/services/api';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAnnouncer } from '@/components/common/A11yAnnouncer';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface PiTag {
  id: string;
  name: string;
  description: string;
  unit: string;
  status: boolean | null;
}

const PiPreview: React.FC = () => {
  const [tags, setTags] = useState<PiTag[]>([]);
  const [sites, setSites] = useState<{id: string, name: string}[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();
  const { announcer, announce } = useAnnouncer();

  // Fetch sites on component mount
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const sitesData = await piService.getSites();
        setSites(sitesData);
      } catch (error) {
        console.error('Error fetching sites:', error);
        toast.error('Failed to load sites');
      }
    };

    fetchSites();
  }, []);

  // Fetch tags when selected site changes
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        const tagsData = selectedSite === 'all'
          ? await piService.getTags()
          : await piService.getTagsBySite(selectedSite);
        
        // Initialize tags with null status
        setTags(tagsData.map(tag => ({
          ...tag,
          status: null
        })));
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching PI tags:', error);
        toast.error('Failed to load PI tags');
        setLoading(false);
      }
    };

    fetchTags();
  }, [selectedSite]);

  // Handle tag test results
  const handleTagTest = (tagName: string, result: boolean) => {
    // Update tag status
    setTags(prevTags => prevTags.map(tag => {
      if (tag.name === tagName) {
        return { ...tag, status: result };
      }
      return tag;
    }));

    // Announce result for screen readers
    announce(
      `Tag ${tagName} test ${result ? 'successful' : 'failed'}`,
      !result // Make failures assertive
    );
  };

  return (
    <div>
      {announcer} {/* Screen reader announcements */}
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark mb-2">PI Tag Preview</h1>
        <p className="text-gray-600">
          Preview configured PI tags and test their availability. This is a read-only view.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="w-full md:w-64">
          <Label htmlFor="site-select">Filter by Site</Label>
          <select
            id="site-select"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            disabled={loading}
            aria-label="Select site to filter PI tags"
          >
            <option value="all">All Sites</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
        </div>
        
        <div aria-live="polite" className="text-sm text-gray-500 mt-2 md:mt-8">
          {loading ? 'Loading tags...' : `${tags.length} tags found`}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center p-12" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="sr-only">Loading PI tags...</span>
        </div>
      ) : (
        <div className={isMobile ? "overflow-x-auto pb-4" : ""}>
          <TagTableRO tags={tags} onTagTest={handleTagTest} />
          
          <div className="mt-4 text-sm text-gray-500">
            <p>
              <span className="font-medium">Note:</span> This is a preview of available PI tags. 
              Click "Test tag" to verify if a tag is accessible.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PiPreview;
