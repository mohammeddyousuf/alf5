import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/admin/product/ProductCard";
import { ProductFilters } from "@/components/admin/product/ProductFilters";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const Products = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [showSaleProducts, setShowSaleProducts] = useState(true);
  const [showNonSaleProducts, setShowNonSaleProducts] = useState(true);

  const { data: products, refetch, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
      return data;
    },
  });

  const { data: systemLimits, isLoading: isLoadingLimits } = useQuery({
    queryKey: ["system-limits"],
    queryFn: async () => {
      // First try to get existing limits
      const { data: existingLimits, error: fetchError } = await supabase
        .from("system_limits")
        .select("*");
      
      if (fetchError) {
        console.error("Error fetching limits:", fetchError);
        throw fetchError;
      }
      
      // If no limits exist, create default ones
      if (!existingLimits || existingLimits.length === 0) {
        console.log("No limits found, creating default");
        const defaultLimit = {
          product_limit: 100 // Default limit
        };
        
        const { data: insertedData, error: insertError } = await supabase
          .from("system_limits")
          .insert([defaultLimit])
          .select()
          .single();
          
        if (insertError) {
          console.error("Error creating default limits:", insertError);
          throw insertError;
        }

        return insertedData;
      }
      
      return existingLimits[0];
    },
  });

  const handleAddProduct = () => {
    if (!systemLimits?.product_limit) {
      toast({
        title: "Error",
        description: "System limits not configured. Please contact super admin.",
        variant: "destructive",
      });
      return;
    }

    if (products && products.length >= systemLimits.product_limit) {
      toast({
        title: "Limit Reached",
        description: `You can only add up to ${systemLimits.product_limit} products. Contact super admin to increase the limit.`,
        variant: "destructive",
      });
      return;
    }
    navigate("/admin/products/new");
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
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
    refetch();
  };

  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const isSaleProduct = product.sale_price && product.sale_price < product.price;
    
    if (!matchesSearch) return false;
    if (isSaleProduct && !showSaleProducts) return false;
    if (!isSaleProduct && !showNonSaleProducts) return false;
    
    return true;
  });

  if (isLoadingProducts || isLoadingLimits) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">
            {products?.length || 0} of {systemLimits?.product_limit || 0} products used
          </p>
        </div>
        <Button onClick={handleAddProduct}>
          Add Product
        </Button>
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
            onSuccess={refetch}
          />
        ))}
      </div>
    </div>
  );
};

export default Products;