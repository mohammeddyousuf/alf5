import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ProductFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  showSaleProducts: boolean;
  setShowSaleProducts: (value: boolean) => void;
  showNonSaleProducts: boolean;
  setShowNonSaleProducts: (value: boolean) => void;
}

export function ProductFilters({
  search,
  setSearch,
  showSaleProducts,
  setShowSaleProducts,
  showNonSaleProducts,
  setShowNonSaleProducts,
}: ProductFiltersProps) {
  return (
    <div className="flex items-center gap-6">
      <Input
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="sale-filter"
            checked={showSaleProducts}
            onCheckedChange={(checked) => setShowSaleProducts(checked as boolean)}
          />
          <Label htmlFor="sale-filter">Sale Products</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="non-sale-filter"
            checked={showNonSaleProducts}
            onCheckedChange={(checked) =>
              setShowNonSaleProducts(checked as boolean)
            }
          />
          <Label htmlFor="non-sale-filter">Non-Sale Products</Label>
        </div>
      </div>
    </div>
  );
}