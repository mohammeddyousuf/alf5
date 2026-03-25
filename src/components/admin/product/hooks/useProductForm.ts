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
  onLimitExceeded?: () => void;
}

const defaultValues: ProductFormData = {
  name: "",
  description: "",
  price: 0,
  sale_price: null,
  discount_price: null,
  images: [],
  status: "draft",
  stock_status: "in_stock",
  price_note: null,
  category_id: null,
  subcategory_id: null,
  featured: false,
  brand: null,
  custom_label: null,
  whatsapp_number: null,
  top_notes: null,
  heart_notes: null,
  base_notes: null,
};

export function useProductForm({ product, onSuccess, onLimitExceeded }: UseProductFormProps) {
  const { toast } = useToast();
  
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product ? {
      name: product.name,
      description: product.description ?? "",
      price: product.price,
      sale_price: product.sale_price,
      discount_price: product.discount_price ?? null,
      images: product.images ?? [],
      status: product.status ?? "draft",
      stock_status: (product as any).stock_status ?? "in_stock",
      price_note: (product as any).price_note ?? null,
      category_id: product.category_id,
      subcategory_id: product.subcategory_id,
      featured: product.featured ?? false,
      brand: product.brand ?? null,
      custom_label: product.custom_label ?? null,
      whatsapp_number: product.whatsapp_number ?? null,
      top_notes: (product as any).top_notes ?? null,
      heart_notes: (product as any).heart_notes ?? null,
      base_notes: (product as any).base_notes ?? null,
    } : defaultValues,
  });

  const onSubmit = async (values: ProductFormData) => {
    try {
      const data = {
        name: values.name,
        description: values.description || null,
        price: values.price,
        sale_price: values.sale_price,
        discount_price: values.discount_price,
        images: values.images,
        status: values.status,
        stock_status: values.stock_status,
        category_id: values.category_id || null,
        subcategory_id: values.subcategory_id || null,
        featured: values.featured,
        brand: values.brand || null,
        custom_label: values.custom_label || null,
        whatsapp_number: values.whatsapp_number || null,
        top_notes: values.top_notes || null,
        heart_notes: values.heart_notes || null,
        base_notes: values.base_notes || null,
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
      onLimitExceeded?.();
    }
  };

  return {
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
  };
}