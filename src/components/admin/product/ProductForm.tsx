import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { PriceFields } from "./PriceFields";
import { MediaFields } from "./MediaFields";
import { CategoryFields } from "./CategoryFields";
import { productFormSchema, type ProductFormData } from "./schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

interface ProductFormProps {
  product?: ProductRow;
  onSuccess?: () => void;
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
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
      }
      
      onSuccess?.();
      if (!product) {
        form.reset();
        setIsInitialized(false);
      }
    } catch (error: any) {
      console.error("Error submitting product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <ScrollArea className="h-[80vh] pr-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <CategoryFields form={form} />
          <PriceFields form={form} />
          <MediaFields form={form} />

          <Button type="submit" className="w-full">
            {product ? "Update Product" : "Create Product"}
          </Button>
        </form>
      </Form>
    </ScrollArea>
  );
}