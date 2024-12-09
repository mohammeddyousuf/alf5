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
      console.log("Current form values before reset:", form.getValues());
      
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
      
      console.log("Form values after reset:", form.getValues());
    }
  }, [product, form, isInitialized]);

  const onSubmit = async (values: ProductFormData) => {
    try {
      if (!values.name || typeof values.price !== 'number') {
        throw new Error('Name and price are required');
      }

      console.log("Submitting form values:", values);

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

      console.log("Submitting product data:", data);

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
        const { error } = await supabase.from("products").insert(data);
        if (error) throw error;
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }
      onSuccess?.();
      if (!product) {
        form.reset(); // Only reset form for new products
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