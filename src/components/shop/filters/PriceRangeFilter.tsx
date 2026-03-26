import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCurrency } from "@/hooks/useCurrency";

interface PriceRangeFilterProps {
  priceRange: [number, number];
  setPriceRange: React.Dispatch<React.SetStateAction<[number, number]>>;
}

export function PriceRangeFilter({ priceRange, setPriceRange }: PriceRangeFilterProps) {
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // If empty string, set to 0
    const newMin = value === '' ? 0 : Math.max(0, parseInt(value) || 0);
    setPriceRange(prev => [newMin, prev[1]]);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // If empty string, set to 0
    const newMax = value === '' ? 0 : Math.max(0, parseInt(value) || 0);
    setPriceRange(prev => [prev[0], newMax]);
  };

  const { currencySymbol } = useCurrency();

  return (
    <div className="space-y-2">
      <Label>Price Range</Label>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">Min Price ({currencySymbol})</Label>
          <Input
            type="number"
            min={0}
            value={priceRange[0] === 0 ? '' : priceRange[0]}
            onChange={handleMinPriceChange}
            className="mt-1"
            placeholder="0"
          />
        </div>
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">Max Price ({currencySymbol})</Label>
          <Input
            type="number"
            min={0}
            value={priceRange[1] === 0 ? '' : priceRange[1]}
            onChange={handleMaxPriceChange}
            className="mt-1"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
}