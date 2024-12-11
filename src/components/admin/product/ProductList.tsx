import { ProductCard } from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Loader2 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

interface ProductListProps {
  search: string;
  showSaleProducts: boolean;
  showNonSaleProducts: boolean;
}

export const ProductList = ({ search, showSaleProducts, showNonSaleProducts }: ProductListProps) => {
  const { data: products, refetch, isLoading } = useProducts();
  const { toast } = useToast();

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Filter products based on search and sale status
  const filteredProducts = products?.filter((product: ProductRow) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const isSaleProduct = product.sale_price !== null && product.sale_price > 0;
    
    // Check if product should be shown based on sale status filters
    const showBasedOnSaleStatus = (
      (isSaleProduct && showSaleProducts) || 
      (!isSaleProduct && showNonSaleProducts)
    );

    return matchesSearch && showBasedOnSaleStatus;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProducts?.map((product: ProductRow) => (
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