import { ProductCard } from "./ProductCard";
import { Loader2 } from "lucide-react";
import { Database } from "@/integrations/supabase/types/database";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

interface ProductListProps {
  products: ProductRow[];
  showSaleProducts: boolean;
  showNonSaleProducts: boolean;
  onStatusChange: (id: string, currentStatus: string | null) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSuccess: () => void;
}

export const ProductList = ({ 
  products,
  showSaleProducts, 
  showNonSaleProducts,
  onStatusChange,
  onDelete,
  onSuccess
}: ProductListProps) => {
  if (!products) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product: ProductRow) => (
        <ProductCard
          key={product.id}
          product={product}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          onSuccess={onSuccess}
        />
      ))}
    </div>
  );
};