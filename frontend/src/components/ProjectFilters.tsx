import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Search, X, Filter } from 'lucide-react';
import { type ProjectFilters as FilterType } from '../api/projects';
import { useProjectTags } from '../hooks/useProjects';

interface ProjectFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({ filters, onFiltersChange }) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { data: tags } = useProjectTags();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFiltersChange({ ...filters, search: searchInput, page: 1 });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleDifficultyChange = (value: string) => {
    onFiltersChange({
      ...filters,
      difficulty: value === 'all' ? undefined : value as any,
      page: 1,
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : value as any,
      page: 1,
    });
  };

  const handleSortChange = (value: string) => {
    onFiltersChange({
      ...filters,
      ordering: value,
      page: 1,
    });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];

    setSelectedTags(newTags);
    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags.join(',') : undefined,
      page: 1,
    });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSelectedTags([]);
    onFiltersChange({
      page: 1,
      page_size: filters.page_size,
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.difficulty ||
    filters.status !== 'open' ||
    filters.tags ||
    filters.ordering !== '-created_at';

  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search projects by title, description, or keywords..."
          className="pl-10 pr-10"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        {searchInput && (
          <button
            onClick={() => setSearchInput('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          value={filters.difficulty || 'all'}
          onValueChange={handleDifficultyChange}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="EASY">Easy</SelectItem>
            <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
            <SelectItem value="ADVANCED">Advanced</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status || 'open'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.ordering || '-created_at'}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-created_at">Newest First</SelectItem>
            <SelectItem value="created_at">Oldest First</SelectItem>
            <SelectItem value="title">Title (A-Z)</SelectItem>
            <SelectItem value="-title">Title (Z-A)</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="whitespace-nowrap"
          >
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Popular Tags */}
      {tags && tags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Filter by tags:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 10).map((tag: any) => (
              <Badge
                key={tag.id}
                variant={selectedTags.includes(tag.name) ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => handleTagToggle(tag.name)}
              >
                {tag.name}
                {tag.usage_count && (
                  <span className="ml-1 text-xs opacity-70">({tag.usage_count})</span>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Active Filter Pills */}
      {(selectedTags.length > 0 || filters.search) && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {filters.search && (
            <Badge variant="secondary">
              Search: "{filters.search}"
              <button
                onClick={() => setSearchInput('')}
                className="ml-2 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
              <button
                onClick={() => handleTagToggle(tag)}
                className="ml-2 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectFilters;

