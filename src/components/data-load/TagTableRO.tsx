
import React from 'react';
import TestTagButton from './TestTagButton';
import { PiTag } from '@/types/pi-tag';
import { Skeleton } from '@/components/ui/skeleton';

interface TagTableROProps {
  tags: PiTag[];
  loading?: boolean;
  onTagTest: (tagName: string) => void;
}

const TagTableRO: React.FC<TagTableROProps> = ({ tags, loading, onTagTest }) => {
  // Helper function to determine status display
  const renderStatus = (status: boolean | string) => {
    if (status === null || status === undefined) {
      return (
        <span className="inline-block w-4 h-4 rounded-full bg-gray-300" 
              aria-label="Status: Not tested"></span>
      );
    }
    
    if (typeof status === 'boolean') {
      return status ? (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-800" 
              aria-label="Status: OK">
          <span aria-hidden="true">OK</span>
        </span>
      ) : (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-800" 
              aria-label="Status: Failed">
          <span aria-hidden="true">KO</span>
        </span>
      );
    }
    
    // If status is a string
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-800">
        {status}
      </span>
    );
  };
  
  // Helper function to determine TestTagButton status
  const getButtonStatus = (status: boolean | string): string | null => {
    if (status === null || status === undefined) return null;
    if (typeof status === 'boolean') return status ? 'OK' : 'KO';
    return status;
  };

  // Loading state UI
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto" role="region" aria-labelledby="tag-table-label">
      <h2 id="tag-table-label" className="sr-only">PI Tags Preview Table</h2>
      
      <table className="w-full bg-white border rounded-md shadow-sm">
        <caption className="sr-only">Available PI tags with their details and test status</caption>
        
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">
              Tag Name
            </th>
            <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">
              Description
            </th>
            <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">
              Unit
            </th>
            <th scope="col" className="px-4 py-3 text-center text-sm font-medium text-gray-600">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-center text-sm font-medium text-gray-600">
              Action
            </th>
          </tr>
        </thead>
        
        <tbody className="divide-y divide-gray-200">
          {tags.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-3 text-center text-gray-500">
                No tags available for preview
              </td>
            </tr>
          ) : (
            tags.map((tag) => (
              <tr key={tag.id}>
                <td className="px-4 py-3 text-sm font-medium">{tag.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{tag.description}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{tag.unit}</td>
                <td className="px-4 py-3 text-center">
                  {renderStatus(tag.status)}
                </td>
                <td className="px-4 py-3 text-center">
                  <TestTagButton 
                    status={getButtonStatus(tag.status)}
                    onClick={async () => {
                      // This will be handled by the onTestComplete
                      return Promise.resolve();
                    }}
                    tagName={tag.name}
                    onTestComplete={() => onTagTest(tag.name)} 
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TagTableRO;
