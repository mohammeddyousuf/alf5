import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.string().min(1, "Price is required").transform(Number),
  sale_price: z.string().optional().transform(val => val ? Number(val) : null),
  images: z.array(z.string()).optional(),
  video_urls: z.array(z.string()).optional(),
});

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

interface ProductFormProps {
  product?: ProductRow;
  onSuccess?: () => void;
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price?.toString() ?? "",
      sale_price: product?.sale_price?.toString() ?? "",
      images: product?.images ?? [],
      video_urls: product?.video_urls ?? [],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const submitData = {
        name: values.name,
        description: values.description,
        price: values.price,
        sale_price: values.sale_price,
        images: values.images,
        video_urls: values.video_urls,
      };

      if (product) {
        const { error } = await supabase
          .from("products")
          .update(submitData)
          .eq("id", product.id);
        if (error) throw error;
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        const { error } = await supabase.from("products").insert(submitData);
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sale_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sale Price (Optional)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit">
          {product ? "Update Product" : "Create Product"}
        </Button>
      </form>
    </Form>
  );
}