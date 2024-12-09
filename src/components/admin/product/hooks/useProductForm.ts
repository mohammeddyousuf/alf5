import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productFormSchema, type ProductFormData } from "../schema";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import type { Database } from "@/integrations/supabase/types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

interface UseProductFormProps {
  product?: ProductRow;
  onSuccess?: () => void;
}

export function useProductForm({ product, onSuccess }: UseProductFormProps) {
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      sale_price: null,
      images: [],
      video_urls: [],
      status: "draft",
      category_id: null,
      subcategory_id: null,
    },
  });

  // Load product data into form when available
  useEffect(() => {
    if (product && !isInitialized) {
      console.log("Loading product data:", product);
      
      const formData = {
        name: product.name,
        description: product.description ?? "",
        price: product.price,
        sale_price: product.sale_price,
        images: product.images ?? [],
        video_urls: product.video_urls ?? [],
        status: product.status ?? "draft",
        category_id: product.category_id,
        subcategory_id: product.subcategory_id,
      };
      
      console.log("Setting form data to:", formData);
      form.reset(formData);
      setIsInitialized(true);
    }
  }, [product, form, isInitialized]);

  const onSubmit = async (values: ProductFormData) => {
    try {
      console.log("Form values before submission:", values);
      console.log("Current form state:", form.getValues());

      const data = {
        name: values.name,
        description: values.description || null,
        price: values.price,
        sale_price: values.sale_price,
        images: values.images,
        video_urls: values.video_urls || [],
        status: values.status,
        category_id: values.category_id || null,
        subcategory_id: values.subcategory_id || null,
      };

      console.log("Submitting to Supabase:", data);

      if (product?.id) {
        const { error, data: updatedData } = await supabase
          .from("products")
          .update(data)
          .eq("id", product.id)
          .select();
        
        console.log("Supabase update response:", { error, data: updatedData });
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        const { error, data: insertedData } = await supabase
          .from("products")
          .insert(data)
          .select();
        
        console.log("Supabase insert response:", { error, data: insertedData });
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Product created successfully",
        });

        // Only reset form for new products
        form.reset();
        setIsInitialized(false);
      }
      
      onSuccess?.();
    } catch (error: any) {
      console.error("Error submitting product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return {
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
  };
}