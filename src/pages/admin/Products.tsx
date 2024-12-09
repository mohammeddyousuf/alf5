import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { ProductForm } from "@/components/admin/product/ProductForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ProductCard } from "@/components/admin/product/ProductCard";
import { ProductFilters } from "@/components/admin/product/ProductFilters";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export default function Products() {
  const [search, setSearch] = useState("");
  const [showSaleProducts, setShowSaleProducts] = useState(true);
  const [showNonSaleProducts, setShowNonSaleProducts] = useState(true);
  const { toast } = useToast();

  const { data: products, refetch } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProductRow[];
    },
  });

  const handleDelete = async (id: string) => {
    try {
      // Get the product's images
      const { data: product } = await supabase
        .from("products")
        .select("images")
        .eq("id", id)
        .single();

      if (product?.images?.length) {
        // Delete images from storage
        const fileNames = product.images.map(
          (url) => decodeURIComponent(url.split("/").pop() || "")
        );
        console.log("Attempting to delete files:", fileNames);

        const { error: storageError } = await supabase.storage
          .from("product-images")
          .remove(fileNames);

        if (storageError) {
          console.error("Error deleting images from storage:", storageError);
        }
      }

      // Delete the product from the database
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      } else {
        toast({
          title: "Success",
          description: "Product and associated images deleted successfully",
        });
        refetch();
      }
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleStatusChange = async (id: string, currentStatus: string | null) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";

    const { error } = await supabase
      .from("products")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else {
      toast({
        title: "Success",
        description: `Product ${
          newStatus === "published" ? "published" : "moved to draft"
        }`,
      });
      refetch();
    }
  };

  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const isSaleProduct = product.sale_price && product.sale_price < product.price;

    if (!showSaleProducts && !showNonSaleProducts) return false;
    if (!showSaleProducts && isSaleProduct) return false;
    if (!showNonSaleProducts && !isSaleProduct) return false;

    return matchesSearch;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <ProductForm onSuccess={() => refetch()} />
          </DialogContent>
        </Dialog>
      </div>

      <ProductFilters
        search={search}
        setSearch={setSearch}
        showSaleProducts={showSaleProducts}
        setShowSaleProducts={setShowSaleProducts}
        showNonSaleProducts={showNonSaleProducts}
        setShowNonSaleProducts={setShowNonSaleProducts}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts?.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onSuccess={() => refetch()}
          />
        ))}
      </div>
    </div>
  );
}