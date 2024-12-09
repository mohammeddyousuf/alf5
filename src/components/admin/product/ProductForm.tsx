import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Database } from "@/integrations/supabase/types";
import { PriceFields } from "./PriceFields";
import { MediaFields } from "./MediaFields";
import { CategoryFields } from "./CategoryFields";
import { BasicFields } from "./BasicFields";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProductForm } from "./hooks/useProductForm";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

interface ProductFormProps {
  product?: ProductRow;
  onSuccess?: () => void;
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const { form, onSubmit, isSubmitting } = useProductForm({ 
    product, 
    onSuccess 
  });

  return (
    <ScrollArea className="h-[80vh] pr-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <BasicFields form={form} />
          <CategoryFields form={form} />
          <PriceFields form={form} />
          <MediaFields form={form} />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {product ? "Update Product" : "Create Product"}
          </Button>
        </form>
      </Form>
    </ScrollArea>
  );
}