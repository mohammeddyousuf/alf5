import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productFormSchema, type ProductFormData } from "../schema";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

interface UseProductFormProps {
  product?: ProductRow;
  onSuccess?: () => void;
}

const defaultValues: ProductFormData = {
  name: "",
  description: "",
  price: 0,
  sale_price: null,
  images: [],
  status: "draft",
  category_id: null,
  subcategory_id: null,
  featured: false,
};

export function useProductForm({ product, onSuccess }: UseProductFormProps) {
  const { toast } = useToast();
  
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product ? {
      name: product.name,
      description: product.description ?? "",
      price: product.price,
      sale_price: product.sale_price,
      images: product.images ?? [],
      status: product.status ?? "draft",
      category_id: product.category_id,
      subcategory_id: product.subcategory_id,
      featured: product.featured ?? false,
    } : defaultValues,
  });

  const onSubmit = async (values: ProductFormData) => {
    try {
      const data = {
        name: values.name,
        description: values.description || null,
        price: values.price,
        sale_price: values.sale_price,
        images: values.images,
        status: values.status,
        category_id: values.category_id || null,
        subcategory_id: values.subcategory_id || null,
        featured: values.featured,
      };

      if (product?.id) {
        const { error } = await supabase
          .from("products")
          .update(data)
          .eq("id", product.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("products")
          .insert(data);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Product created successfully",
        });

        form.reset(defaultValues);
      }
      
      onSuccess?.();
    } catch (error: any) {
      console.error("[useProductForm] Error submitting product:", error);
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