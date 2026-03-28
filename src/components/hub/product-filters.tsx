"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { SlidersHorizontal, X, RotateCcw } from "lucide-react"
import { type ProductFilters } from "@/types"

interface ProductFiltersPanelProps {
  filters: ProductFilters
  onFiltersChange: (filters: ProductFilters) => void
}

const tagOptions = [
  { id: "budget", label: "Budget" },
  { id: "free", label: "Free" },
  { id: "flux_kit_ready", label: "Flux Kit Ready" },
  { id: "new", label: "New" },
]

const typeOptions = [
  { value: "profile", label: "Profile" },
  { value: "venue", label: "Venue" },
  { value: "wash", label: "Wash" },
  { value: "other", label: "Other" },
]

function getActiveFilterCount(filters: ProductFilters): number {
  let count = 0
  if (filters.tags.length > 0) count += filters.tags.length
  if (filters.types.length > 0) count += filters.types.length
  if (filters.priceMin !== null) count++
  if (filters.priceMax !== null) count++
  if (filters.boosterOnly) count++
  return count
}

function FilterContent({ filters, onFiltersChange }: ProductFiltersPanelProps) {
  const handleTagToggle = (tagId: string) => {
    const newTags = filters.tags.includes(tagId)
      ? filters.tags.filter((t) => t !== tagId)
      : [...filters.tags, tagId]
    onFiltersChange({ ...filters, tags: newTags })
  }

  const handleTypeChange = (value: string) => {
    const newTypes = filters.types.includes(value)
      ? filters.types.filter((t) => t !== value)
      : [...filters.types, value]
    onFiltersChange({ ...filters, types: newTypes })
  }

  const handleReset = () => {
    onFiltersChange({
      search: filters.search,
      tags: [],
      types: [],
      priceMin: null,
      priceMax: null,
      boosterOnly: false,
    })
  }

  const activeCount = getActiveFilterCount(filters)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">Filters</h3>
          {activeCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeCount}
            </Badge>
          )}
        </div>
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs h-8 hover:bg-foreground hover:text-background transition-colors duration-300"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      <Separator />

      {/* Tags */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Tags</Label>
        <div className="space-y-2">
          {tagOptions.map((tag) => (
            <label
              key={tag.id}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <Checkbox
                checked={filters.tags.includes(tag.id)}
                onCheckedChange={() => handleTagToggle(tag.id)}
              />
              <span className="text-sm group-hover:text-foreground/80 transition-colors">
                {tag.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Type */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Type</Label>
        <div className="space-y-2">
          {typeOptions.map((type) => (
            <label
              key={type.value}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <Checkbox
                checked={filters.types.includes(type.value)}
                onCheckedChange={() => handleTypeChange(type.value)}
              />
              <span className="text-sm group-hover:text-foreground/80 transition-colors">
                {type.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Price Range (R$)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.priceMin ?? ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                priceMin: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="h-9"
            min={0}
          />
          <span className="text-muted-foreground">—</span>
          <Input
            type="number"
            placeholder="Max"
            value={filters.priceMax ?? ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                priceMax: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="h-9"
            min={0}
          />
        </div>
      </div>

      <Separator />

      {/* Booster Only */}
      <div className="flex items-center justify-between">
        <Label htmlFor="booster-only" className="text-sm font-medium cursor-pointer">
          Booster Only
        </Label>
        <Switch
          id="booster-only"
          checked={filters.boosterOnly}
          onCheckedChange={(checked) =>
            onFiltersChange({ ...filters, boosterOnly: !!checked })
          }
        />
      </div>
    </div>
  )
}

export function ProductFiltersPanel(props: ProductFiltersPanelProps) {
  return (
    <>
      {/* Desktop: Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-20 p-4 border border-border rounded-lg bg-card">
          <ScrollArea className="max-h-[calc(100vh-8rem)]">
            <FilterContent {...props} />
          </ScrollArea>
        </div>
      </aside>

      {/* Mobile: Sheet */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 hover:bg-foreground hover:text-background transition-colors duration-300"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {getActiveFilterCount(props.filters) > 0 && (
                <Badge variant="secondary" className="text-xs ml-1">
                  {getActiveFilterCount(props.filters)}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent {...props} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
