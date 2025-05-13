
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import TagTableRO from '../../components/data-load/TagTableRO';
import { toast } from 'sonner';

interface PiTag {
  tag_id: string;
  tag_name: string;
  description: string;
  unit: string;
  server: string;
  status: string;
  last_value: string | number;
  last_timestamp: string;
}

const PiPreview = () => {
  const [tags, setTags] = useState<PiTag[]>([]);
  const [filteredTags, setFilteredTags] = useState<PiTag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load sample PI data from CSV
    const loadPiData = async () => {
      try {
        const response = await fetch('/src/data/sample_pi.csv');
        const csvText = await response.text();
        
        // Parse CSV
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        
        const parsedTags: PiTag[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',');
          const tag: Record<string, string> = {};
          
          headers.forEach((header, index) => {
            tag[header] = values[index] || '';
          });
          
          parsedTags.push(tag as unknown as PiTag);
        }
        
        setTags(parsedTags);
        setFilteredTags(parsedTags);
        
      } catch (error) {
        console.error('Error loading PI data:', error);
        toast.error('Failed to load PI tag data');
      } finally {
        setLoading(false);
      }
    };
    
    loadPiData();
  }, []);
  
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredTags(tags);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = tags.filter(tag => 
      tag.tag_id.toLowerCase().includes(query) ||
      tag.tag_name.toLowerCase().includes(query) ||
      tag.description.toLowerCase().includes(query)
    );
    
    setFilteredTags(filtered);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark">PI Tag Preview</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Available PI Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search tags..."
                className="pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            filteredTags.length > 0 ? (
              <TagTableRO data={filteredTags} />
            ) : (
              <div className="text-center py-10 text-gray-500">
                No PI tags found matching your search criteria
              </div>
            )
          )}
          
          <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800 border border-blue-100">
            <p className="font-medium mb-1">Note:</p>
            <p>This is a read-only preview of available PI tags. In the production application, these tags would be connected to the PI System for real-time data acquisition.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PiPreview;
