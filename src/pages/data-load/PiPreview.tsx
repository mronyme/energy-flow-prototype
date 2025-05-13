
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import TagTableRO from '@/components/data-load/TagTableRO';
import TestTagButton from '@/components/data-load/TestTagButton';
import { piService } from '@/services/api';
import { PiTag } from '@/types';

const PiPreview = () => {
  const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [piTags, setPiTags] = useState<PiTag[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const sitesData = await piService.getSites();
        setSites(sitesData);
        if (sitesData.length > 0) {
          setSelectedSite(sitesData[0].id);
        }
      } catch (error) {
        console.error('Error fetching sites:', error);
      }
    };

    fetchSites();
  }, []);

  useEffect(() => {
    if (!selectedSite) return;
    
    const fetchPiTags = async () => {
      try {
        setLoading(true);
        const tagsData = await piService.getTagsBySite(selectedSite);
        
        // Transform to match our component needs
        setPiTags(tagsData);
      } catch (error) {
        console.error('Error fetching PI tags:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPiTags();
  }, [selectedSite]);

  const handleTestTag = async (tagId: string) => {
    try {
      // Find the tag
      const tag = piTags.find(t => t.id === tagId);
      if (!tag) return;
      
      // Call PI service to test the tag
      const result = await piService.testTag(tag.name);
      
      // Update tag status (IF-04: Green badge "OK" or red "KO")
      setPiTags(prev => 
        prev.map(t => 
          t.id === tagId ? { ...t, status: result ? 'OK' : 'KO' } : t
        )
      );
      
    } catch (error) {
      console.error('Error testing tag:', error);
      // Update as KO if there's an error
      setPiTags(prev => 
        prev.map(t => 
          t.id === tagId ? { ...t, status: 'KO' } : t
        )
      );
    }
  };

  const filteredTags = searchQuery
    ? piTags.filter(tag => 
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tag.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : piTags;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-dark">PI Tag Preview</h1>
      </div>

      <Card className="shadow-sm ring-1 ring-dark/10">
        <CardHeader>
          <CardTitle>Available PI Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Site
              </label>
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Search Tags
              </label>
              <div className="relative">
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or description"
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredTags.length > 0 ? (
            <TagTableRO 
              data={filteredTags}
              actionColumn={(tag) => (
                <TestTagButton 
                  status={tag.status || null}
                  onClick={() => handleTestTag(tag.id)}
                />
              )}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              {selectedSite 
                ? searchQuery 
                  ? "No tags found matching your search" 
                  : "No PI tags found for this site"
                : "Select a site to view PI tags"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PiPreview;
