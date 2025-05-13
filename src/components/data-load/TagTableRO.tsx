
import React, { useState } from 'react';
import { TestTagButton } from './TestTagButton';

interface PiTag {
  id: string;
  name: string;
  description: string;
  unit: string;
  status: boolean | null;
}

interface TagTableROProps {
  tags: PiTag[];
  onTagTest: (tagName: string, result: boolean) => void;
}

const TagTableRO: React.FC<TagTableROProps> = ({ tags, onTagTest }) => {
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
                  {tag.status === null ? (
                    <span className="inline-block w-4 h-4 rounded-full bg-gray-300" 
                          aria-label="Status: Not tested"></span>
                  ) : tag.status ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-800" 
                          aria-label="Status: OK">
                      <span aria-hidden="true">OK</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-800" 
                          aria-label="Status: Failed">
                      <span aria-hidden="true">KO</span>
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <TestTagButton 
                    tagName={tag.name} 
                    onTestComplete={(result) => onTagTest(tag.name, result)} 
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
