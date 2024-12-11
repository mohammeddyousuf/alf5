import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Database } from "@/integrations/supabase/types";
import { PriceFields } from "./PriceFields";
import { MediaFields } from "./MediaFields";
import { CategoryFields } from "./CategoryFields";
import { BasicFields } from "./BasicFields";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProductForm } from "./hooks/useProductForm";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  if (!form) return null;

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6">
            <BasicFields form={form} />
            <CategoryFields form={form} />
            <PriceFields form={form} />
            <MediaFields form={form} />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {product ? "Update Product" : "Create Product"}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate("/admin/products")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </ScrollArea>
  );
}