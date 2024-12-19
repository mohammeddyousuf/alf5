import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting product:", id);
      
      // First, fetch the product to check if it exists and get its images
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("images")
        .eq("id", id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // Check if product exists
      if (!product) {
        console.log("Product not found:", id);
        throw new Error("Product not found");
      }

      // Delete images from storage if they exist
      if (product?.images && product.images.length > 0) {
        const fileNames = product.images.map(url => {
          const fileName = decodeURIComponent(url.split("/").pop() || "");
          return fileName;
        });

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

      return id;
    },
    onSuccess: () => {
      // Invalidate the products query to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Success",
        description: "Product and associated images deleted successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Error deleting product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete product: " + error.message,
      });
    },
  });
};