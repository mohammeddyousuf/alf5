import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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
    <div className="space-y-4">
      <div>
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search by name, brand, description, or custom label..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="sale-products"
            checked={showSaleProducts}
            onCheckedChange={setShowSaleProducts}
          />
          <Label htmlFor="sale-products">Show Sale Products</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="non-sale-products"
            checked={showNonSaleProducts}
            onCheckedChange={setShowNonSaleProducts}
          />
          <Label htmlFor="non-sale-products">Show Non-Sale Products</Label>
        </div>
      </div>
    </div>
  );
}