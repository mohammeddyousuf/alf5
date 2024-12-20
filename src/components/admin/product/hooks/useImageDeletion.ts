import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useImageDeletion = (onImageUpload: () => void) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (imagesToDelete: string[]) => {
    if (!imagesToDelete.length) return;

    try {
      setIsDeleting(true);

      // First, remove the images from storage
      const { error: storageError } = await supabase.storage
        .from("product-images")
        .remove(imagesToDelete);

      if (storageError) throw storageError;

      // Then, fetch all products
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, images");

      if (productsError) throw productsError;

      // Update products that contain the deleted images
      const productsToUpdate = products?.filter(product => 
        product.images?.some(img => 
          imagesToDelete.some(deletedImg => 
            img === deletedImg || img.includes(deletedImg)
          )
        )
      );

      if (productsToUpdate && productsToUpdate.length > 0) {
        // Update each product's images array
        await Promise.all(
          productsToUpdate.map(async (product) => {
            const updatedImages = product.images?.filter(img => 
              !imagesToDelete.some(deletedImg => 
                img === deletedImg || img.includes(deletedImg)
              )
            );

            const { error: updateError } = await supabase
              .from("products")
              .update({ images: updatedImages })
              .eq("id", product.id);

            if (updateError) throw updateError;
          })
        );
      }

      toast({
        title: "Success",
        description: `${imagesToDelete.length} image(s) deleted successfully`
      });

      onImageUpload();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (error: any) {
      console.error("Error deleting images:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    handleDelete
  };
};