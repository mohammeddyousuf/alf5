import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/db";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

interface ProductSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

const getImageUrl = (fileName: string) => {
  if (fileName.startsWith("http")) return fileName;
  const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(fileName);
  return publicUrl;
};

export function ProductSelector({ selectedIds, onChange }: ProductSelectorProps) {
  const [search, setSearch] = useState("");
  const { formatPrice } = useCurrency();

  const { data: products } = useQuery({
    queryKey: ["all-products-selector"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, brand, price, images")
        .eq("status", "published")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = search.toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
    );
  }, [products, search]);

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {selectedIds.length} product{selectedIds.length !== 1 ? "s" : ""} selected
      </p>
      <ScrollArea className="h-60 border rounded-md">
        <div className="p-2 space-y-1">
          {filtered.map((product) => {
            const images = Array.isArray(product.images) ? product.images : [];
            const firstImage = images[0] as string | undefined;
            return (
              <label
                key={product.id}
                className="flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer"
              >
                <Checkbox
                  checked={selectedIds.includes(product.id)}
                  onCheckedChange={() => toggle(product.id)}
                />
                {firstImage && (
                  <img
                    src={getImageUrl(firstImage)}
                    alt=""
                    className="w-8 h-8 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.brand || "No brand"}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatPrice(product.price)}
                </span>
              </label>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No products found</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
