import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useShopUrlParams } from "@/hooks/useShopUrlParams";

interface BrandFilterProps {
  selectedBrand: string | null;
  setSelectedBrand: (brand: string | null) => void;
  brands?: string[];
}

export function BrandFilter({ selectedBrand, setSelectedBrand, brands }: BrandFilterProps) {
  const { updateUrlParams } = useShopUrlParams();

  const handleBrandChange = (value: string) => {
    const newBrand = value === "all" ? null : value;
    setSelectedBrand(newBrand);
    updateUrlParams({ brand: newBrand });
  };

  return (
    <div className="space-y-2">
      <Label>Brand</Label>
      <Select
        value={selectedBrand || "all"}
        onValueChange={handleBrandChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select brand" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Brands</SelectItem>
          {brands?.map((brand) => (
            <SelectItem key={brand} value={brand}>
              {brand}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}