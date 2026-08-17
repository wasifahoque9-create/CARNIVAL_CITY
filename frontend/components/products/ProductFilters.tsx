"use client";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

interface ProductFiltersProps {
  minPrice: string;
  maxPrice: string;
  sort: string;
  onMinPriceChange: (v: string) => void;
  onMaxPriceChange: (v: string) => void;
  onSortChange: (v: string) => void;
  onApply: () => void;
  onReset: () => void;
}

export default function ProductFilters({
  minPrice,
  maxPrice,
  sort,
  onMinPriceChange,
  onMaxPriceChange,
  onSortChange,
  onApply,
  onReset,
}: ProductFiltersProps) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <h3 className="mb-4 font-semibold text-foreground">Filters</h3>
      <div className="space-y-4">
        <Input
          label="Min Price"
          type="number"
          min="0"
          value={minPrice}
          onChange={(e) => onMinPriceChange(e.target.value)}
          placeholder="0"
        />
        <Input
          label="Max Price"
          type="number"
          min="0"
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(e.target.value)}
          placeholder="9999"
        />
        <Select
          label="Sort By"
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          options={[
            { value: "newest", label: "Newest" },
            { value: "name", label: "Name A-Z" },
            { value: "price_asc", label: "Price: Low to High" },
            { value: "price_desc", label: "Price: High to Low" },
            { value: "rating", label: "Top Rated" },
          ]}
        />
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onApply} className="flex-1">
            Apply
          </Button>
          <Button variant="outline" size="sm" onClick={onReset} className="flex-1">
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
