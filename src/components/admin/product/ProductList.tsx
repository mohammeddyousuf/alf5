import { ProductCard } from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Loader2 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

interface ProductListProps {
  search: string;
  showSaleProducts: boolean;
  showNonSaleProducts: boolean;
  selectedBrand: string;
  sortBy: string;
}

export const ProductList = ({ 
  search, 
  showSaleProducts, 
  showNonSaleProducts,
  selectedBrand,
  sortBy
}: ProductListProps) => {
  const { data: products, refetch, isLoading } = useProducts();
  const { toast } = useToast();

  // Fetch current settings for global sale timer
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const isSaleValid = () => {
    try {
      if (!settings?.clearance_sale_active) {
        return true;
      }

      if (!settings?.clearance_sale_end_date) {
        return false;
      }

      const endDate = new Date(settings.clearance_sale_end_date);
      const now = new Date();
      return endDate > now;
    } catch (error) {
      console.error("Error in isSaleValid:", error);
      return false;
    }
  };

  const isProductOnSale = (product: ProductRow) => {
    const hasValidSalePrice = product.sale_price !== null && 
                            product.sale_price > 0 && 
                            product.sale_price < product.price;

    // If global sale is not active, show product-specific sale prices
    if (!settings?.clearance_sale_active) {
      return hasValidSalePrice;
    }

    // If global sale is active, check if it's still valid
    return hasValidSalePrice && isSaleValid();
  };

  const handleStatusChange = async (id: string, currentStatus: string | null) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    const { error } = await supabase
      .from("products")
      .update({ status: newStatus })
      .eq("id", id);
    
    if (error) throw error;
    refetch();
  };

  const handleDelete = async (id: string) => {
    try {
      // First get the product to access its images
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("images")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Delete images from storage if they exist
      if (product?.images && product.images.length > 0) {
        const fileNames = product.images.map(url => {
          const fileName = decodeURIComponent(url.split("/").pop() || "");
          return fileName;
        });

        console.log("Deleting image files:", fileNames);

        const { error: storageError } = await supabase.storage
          .from("product-images")
          .remove(fileNames);

        if (storageError) {
          console.error("Error deleting images:", storageError);
        }
      }

      // Delete the product from the database
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", id);
      
      if (deleteError) throw deleteError;

      toast({
        title: "Success",
        description: "Product and associated images deleted successfully",
      });

      refetch();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete product: " + error.message,
      });
    }
  };

  const sortProducts = (products: ProductRow[]) => {
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const filteredProducts = products?.filter((product: ProductRow) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
      (product.description?.toLowerCase().includes(search.toLowerCase())) ||
      (product.brand?.toLowerCase().includes(search.toLowerCase())) ||
      (product.custom_label?.toLowerCase().includes(search.toLowerCase()));
    
    const isOnSale = isProductOnSale(product);
    
    // Check if product should be shown based on sale status filters
    const showBasedOnSaleStatus = (
      (isOnSale && showSaleProducts) || 
      (!isOnSale && showNonSaleProducts)
    );

    // Check if product matches selected brand filter
    const matchesBrand = selectedBrand === 'all' || product.brand === selectedBrand;

    return matchesSearch && showBasedOnSaleStatus && matchesBrand;
  });

  const sortedProducts = sortProducts(filteredProducts || []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedProducts.map((product: ProductRow) => (
        <ProductCard
          key={product.id}
          product={product}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onSuccess={refetch}
        />
      ))}
    </div>
  );
};
