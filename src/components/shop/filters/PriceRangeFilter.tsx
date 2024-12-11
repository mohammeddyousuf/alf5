import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PriceRangeFilterProps {
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
}

export function PriceRangeFilter({ priceRange, setPriceRange }: PriceRangeFilterProps) {
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.max(0, parseInt(e.target.value) || 0);
    setPriceRange([newMin, priceRange[1]]);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(0, parseInt(e.target.value) || 0);
    setPriceRange([priceRange[0], newMax]);
  };

  return (
    <div className="space-y-2">
      <Label>Price Range</Label>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">Min Price (₹)</Label>
          <Input
            type="number"
            min={0}
            value={priceRange[0]}
            onChange={handleMinPriceChange}
            className="mt-1"
          />
        </div>
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">Max Price (₹)</Label>
          <Input
            type="number"
            min={0}
            value={priceRange[1]}
            onChange={handleMaxPriceChange}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}