/**
 * Generic SRD Data Selector Component
 * Allows selecting from official or custom SRD entries
 */

'use client';

import { useEffect, useState } from 'react';
import type { SRDDataType } from '@/lib/srd/models';
import { useSRDData } from '@/lib/hooks/useSRDData';

interface SRDSelectorProps {
  type: SRDDataType;
  value?: string;
  onChange: (selectedName: string, selectedData: any) => void;
  placeholder?: string;
  includeCustom?: boolean;
  searchable?: boolean;
}

export function SRDSelector({
  type,
  value,
  onChange,
  placeholder = `Select ${type.slice(0, -1)}...`,
  includeCustom = true,
  searchable = true,
}: SRDSelectorProps) {
  const { results, loading, error, search } = useSRDData(type);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState<any[]>([]);

  // Initial load
  useEffect(() => {
    search('', includeCustom ? 'all' : 'official');
  }, [type, includeCustom, search]);

  // Filter results based on search query
  useEffect(() => {
    if (!results) return;

    const source = includeCustom ? 'all' : 'official';
    if (searchQuery) {
      search(searchQuery, source as any);
    } else {
      const combined = [...results.official, ...results.custom];
      setFilteredResults(combined);
    }
  }, [searchQuery, results, includeCustom, search]);

  // Update filtered results when results change
  useEffect(() => {
    if (results && !searchQuery) {
      const combined = [...results.official, ...results.custom];
      setFilteredResults(combined);
    }
  }, [results, searchQuery]);

  const handleSelect = (item: any) => {
    onChange(item.name, item);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded-lg text-white text-left
                     focus:border-purple-500 focus:outline-none transition-colors flex justify-between items-center"
        >
          <span>{value || placeholder}</span>
          <span className="text-gray-400">▼</span>
        </button>

        {searchable && isOpen && (
          <input
            autoFocus
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="absolute top-0 left-0 w-full px-3 py-2 bg-gray-800 border-2 border-purple-500 rounded-lg
                       text-white focus:outline-none"
          />
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border-2 border-gray-700 rounded-lg
                        max-h-64 overflow-y-auto z-50">
          {loading && (
            <div className="px-3 py-2 text-gray-400 text-sm">Loading...</div>
          )}

          {error && (
            <div className="px-3 py-2 text-red-400 text-sm">Error: {error}</div>
          )}

          {!loading && filteredResults.length === 0 && (
            <div className="px-3 py-2 text-gray-400 text-sm">No results found</div>
          )}

          {!loading &&
            filteredResults.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSelect(item)}
                className="w-full text-left px-3 py-2 hover:bg-purple-500 hover:bg-opacity-20 transition-colors
                           border-b border-gray-700 last:border-b-0"
              >
                <div className="font-medium text-white">{item.name}</div>
                {item.source === 'custom' && (
                  <div className="text-xs text-purple-400">Custom</div>
                )}
                {item.description && (
                  <div className="text-xs text-gray-400 truncate">{item.description}</div>
                )}
              </button>
            ))}
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
