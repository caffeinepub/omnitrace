// Advanced Search & Query with refined filters and result presentation

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { search, SearchFilters } from '../omni/search';
import { SEARCH_PRESETS } from '../omni/search/presets';
import { OmniEvent, Category, Confidence } from '../omni/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../omni/ui/categoryColors';
import { Search as SearchIcon } from 'lucide-react';
import { EmptyState, InlineNotice } from '../omni/ui/States';

export function SearchScreen() {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [confidence, setConfidence] = useState<Confidence | 'all'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minDuration, setMinDuration] = useState('');
  const [results, setResults] = useState<OmniEvent[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    try {
      const filters: SearchFilters = {};

      if (keyword) filters.keyword = keyword;
      if (category !== 'all') filters.category = category as Category;
      if (confidence !== 'all') filters.confidence = confidence as Confidence;
      if (startDate) filters.startDate = new Date(startDate);
      if (endDate) filters.endDate = new Date(endDate);
      if (minDuration) filters.minDuration = parseInt(minDuration) * 60 * 1000;

      const searchResults = await search(filters);
      setResults(searchResults);
    } finally {
      setIsSearching(false);
    }
  };

  const applyPreset = async (filters: SearchFilters) => {
    if (filters.keyword) setKeyword(filters.keyword);
    if (filters.category) setCategory(filters.category);
    if (filters.confidence) setConfidence(filters.confidence);
    if (filters.startDate) setStartDate(filters.startDate.toISOString().slice(0, 16));
    if (filters.endDate) setEndDate(filters.endDate.toISOString().slice(0, 16));
    if (filters.minDuration) setMinDuration((filters.minDuration / 60000).toString());

    // Auto-search
    setTimeout(() => handleSearch(), 100);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Search & Query</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Advanced filtering with composable criteria
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Quick Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {SEARCH_PRESETS.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset.filters)}
                disabled={isSearching}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Search Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Keyword</label>
              <Input
                placeholder="Search in title, keywords, notes..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                disabled={isSearching}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Category</label>
                <Select value={category} onValueChange={(v) => setCategory(v as any)} disabled={isSearching}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.values(Category).map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Confidence</label>
                <Select value={confidence} onValueChange={(v) => setConfidence(v as any)} disabled={isSearching}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value={Confidence.MANUAL}>Manual</SelectItem>
                    <SelectItem value={Confidence.AUTO}>Auto</SelectItem>
                    <SelectItem value={Confidence.RECOVERED}>Recovered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Start Date</label>
                <Input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isSearching}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">End Date</label>
                <Input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isSearching}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Min Duration (minutes)</label>
              <Input
                type="number"
                placeholder="e.g., 15"
                value={minDuration}
                onChange={(e) => setMinDuration(e.target.value)}
                disabled={isSearching}
              />
            </div>

            <Button onClick={handleSearch} disabled={isSearching} className="w-full gap-2 shadow-sm">
              <SearchIcon className="w-4 h-4" />
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasSearched && (
        <>
          {results.length > 0 ? (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">
                  Results ({results.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border hover:bg-accent/10 hover:border-accent/40 transition-all"
                    >
                      <div className="flex-shrink-0 text-xs text-muted-foreground font-mono pt-0.5">
                        {formatTime(event.timestamp)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-medium text-sm">
                            {event.title || event.type.replace(/_/g, ' ')}
                          </span>
                          {event.category && (
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{
                                borderColor: CATEGORY_COLORS[event.category],
                                color: CATEGORY_COLORS[event.category],
                                backgroundColor: `${CATEGORY_COLORS[event.category]}15`,
                              }}
                            >
                              {CATEGORY_LABELS[event.category]}
                            </Badge>
                          )}
                          <Badge 
                            variant={event.confidence === Confidence.MANUAL ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {event.confidence}
                          </Badge>
                        </div>

                        {event.note && (
                          <p className="text-sm text-muted-foreground mt-1">{event.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon={<SearchIcon className="w-12 h-12" />}
              message="No events match your search criteria. Try adjusting your filters."
            />
          )}
        </>
      )}

      {!hasSearched && (
        <Card className="shadow-sm">
          <CardContent className="py-12">
            <InlineNotice message="Configure your filters and click Search to find events." />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

