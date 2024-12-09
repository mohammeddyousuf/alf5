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
import { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { PriceFields } from "./PriceFields";
import { MediaFields } from "./MediaFields";
import { productFormSchema, type ProductFormData } from "./schema";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

interface ProductFormProps {
  product?: ProductRow;
  onSuccess?: () => void;
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const { toast } = useToast();
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      sale_price: product?.sale_price ?? null,
      images: product?.images ?? [],
      video_urls: product?.video_urls ?? [],
    },
  });

  const onSubmit = async (values: ProductFormData) => {
    try {
      // Ensure required fields are present
      if (!values.name || typeof values.price !== 'number') {
        throw new Error('Name and price are required');
      }

      // Create the data object after validation to ensure correct types
      const data = {
        name: values.name,
        description: values.description,
        price: values.price,
        sale_price: values.sale_price,
        images: values.images,
        video_urls: values.video_urls,
        status: product?.status ?? 'draft',
      };

      if (product) {
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
      form.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <PriceFields form={form} />
        <MediaFields form={form} />

        <Button type="submit">
          {product ? "Update Product" : "Create Product"}
        </Button>
      </form>
    </Form>
  );
}