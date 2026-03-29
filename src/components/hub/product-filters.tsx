'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import type { ProductFilters, ProductTag, ProductType } from '@/types';

interface ProductFiltersProps {
  onFilterChange: (filters: ProductFilters) => void;
}

const allTags: ProductTag[] = ['new', 'popular', 'limited', 'sale', 'featured', 'exclusive'];
const allTypes: ProductType[] = ['gamepass', 'asset', 'plugin', 'tool', 'other'];

export function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<ProductTag[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<ProductType[]>([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const applyFilters = () => {
    onFilterChange({
      search: search || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      types: selectedTypes.length > 0 ? selectedTypes : undefined,
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
    });
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedTags([]);
    setSelectedTypes([]);
    setPriceMin('');
    setPriceMax('');
    onFilterChange({});
  };

  const toggleTag = (tag: ProductTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleType = (type: ProductType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-background">
      <h3 className="font-semibold text-sm">Filters</h3>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            applyFilters();
          }}
          className="pl-8"
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Tags</Label>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <label
              key={tag}
              className="flex items-center gap-1.5 cursor-pointer"
            >
              <Checkbox
                checked={selectedTags.includes(tag)}
                onCheckedChange={() => toggleTag(tag)}
              />
              <span className="text-xs capitalize">{tag}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Types */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Type</Label>
        <Select
          value={selectedTypes.length === 1 ? selectedTypes[0] : undefined}
          onValueChange={(val) => {
            const type = val as ProductType;
            toggleType(type);
            setTimeout(applyFilters, 0);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            {allTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedTypes.length > 1 && (
          <div className="flex flex-wrap gap-1">
            {selectedTypes.map((type) => (
              <button
                key={type}
                onClick={() => {
                  toggleType(type);
                  setTimeout(applyFilters, 0);
                }}
                className="text-[10px] px-2 py-0.5 border rounded-full hover:bg-foreground hover:text-background transition-colors"
              >
                {type} ×
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Price Range</Label>
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="h-8 text-sm"
            min={0}
          />
          <span className="text-muted-foreground text-xs">to</span>
          <Input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="h-8 text-sm"
            min={0}
          />
        </div>
        <Button size="sm" variant="outline" className="w-full mt-2" onClick={applyFilters}>
          Apply Price
        </Button>
      </div>

      {/* Reset */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full hover:bg-foreground hover:text-background"
        onClick={resetFilters}
      >
        <ArrowPathIcon className="size-3 mr-1" />
        Reset Filters
      </Button>
    </div>
  );
}
