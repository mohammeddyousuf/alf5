import { ProductCard } from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Loader2 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export const ProductList = () => {
  const { data: products, refetch, isLoading } = useProducts();
  const { toast } = useToast();
  const [globalSaleTimer, setGlobalSaleTimer] = useState(false);
  const [globalEndDate, setGlobalEndDate] = useState("");

  // Initialize global timer state based on products data
  useEffect(() => {
    if (products && products.length > 0) {
      // Check if any product has sale timer enabled
      const hasEnabledTimer = products.some(
        (product) => product.sale_timer_enabled && product.sale_price !== null
      );
      
      // Get the latest end date from products with enabled timers
      const latestEndDate = products
        .filter((product) => product.sale_timer_enabled && product.sale_end_date)
        .map((product) => product.sale_end_date)
        .sort()
        .pop();

      console.log("Initializing global timer state:", {
        hasEnabledTimer,
        latestEndDate
      });

      setGlobalSaleTimer(hasEnabledTimer);
      if (latestEndDate) {
        // Convert to local datetime-local format
        const date = new Date(latestEndDate);
        const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setGlobalEndDate(localDateTime);
      }
    }
  }, [products]);

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

  const handleGlobalSaleTimer = async () => {
    try {
      const newTimerState = !globalSaleTimer;
      
      // Only include end date if timer is being enabled and date is valid
      const endDate = newTimerState && globalEndDate ? globalEndDate : null;
      
      console.log("Updating global sale timer:", {
        newTimerState,
        endDate,
        query: "sale_price.neq.null"
      });

      // Update all products with sale prices
      const { error } = await supabase
        .from("products")
        .update({
          sale_timer_enabled: newTimerState,
          sale_end_date: endDate
        })
        .not('sale_price', 'is', null);  // Reverted back to original working syntax

      if (error) {
        console.error("Error in handleGlobalSaleTimer:", error);
        throw error;
      }

      // Update local state after successful database update
      setGlobalSaleTimer(newTimerState);
      if (!newTimerState) {
        setGlobalEndDate("");
      }

      toast({
        title: "Success",
        description: `Sale timer ${newTimerState ? 'enabled' : 'disabled'} for all products with sale prices`,
      });

      refetch();
    } catch (error: any) {
      console.error("Error updating global sale timer:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update sale timer: " + error.message,
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

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Global Sale Timer</Label>
            <p className="text-sm text-muted-foreground">
              Enable or disable sale timer for all products with sale prices
            </p>
          </div>
          <Switch
            checked={globalSaleTimer}
            onCheckedChange={handleGlobalSaleTimer}
          />
        </div>
        {globalSaleTimer && (
          <div className="space-y-2">
            <Label htmlFor="global-end-date">Sale End Date and Time</Label>
            <Input
              id="global-end-date"
              type="datetime-local"
              value={globalEndDate}
              onChange={(e) => setGlobalEndDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products?.map((product: ProductRow) => (
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