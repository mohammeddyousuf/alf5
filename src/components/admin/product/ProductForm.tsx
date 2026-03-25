import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Database } from "@/integrations/supabase/types";
import { PriceFields } from "./PriceFields";
import { MediaFields } from "./MediaFields";
import { CategoryFields } from "./CategoryFields";
import { BasicFields } from "./BasicFields";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProductForm } from "./hooks/useProductForm";
import { useState } from "react";
import { LimitExceededDialog } from "./LimitExceededDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/db";
import { useProducts } from "@/hooks/useProducts";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

interface ProductFormProps {
  product?: ProductRow;
  onSuccess?: () => void;
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const [showLimitExceeded, setShowLimitExceeded] = useState(false);
  const { data: products } = useProducts();
  const { form, onSubmit, isSubmitting } = useProductForm({ 
    product,
    onSuccess,
    onLimitExceeded: () => setShowLimitExceeded(true)
  });

  const { data: systemLimits } = useQuery({
    queryKey: ["system-limits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_limits")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  if (!form) return null;

  const currentCount = products?.length || 0;
  const limit = systemLimits?.product_limit || 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product && currentCount >= limit) {
      setShowLimitExceeded(true);
      return;
    }
    form.handleSubmit(onSubmit)(e);
  };

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            <BasicFields form={form} />
            <CategoryFields form={form} />
            <PriceFields form={form} />
            <MediaFields form={form} />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {product ? "Update Product" : "Create Product"}
          </Button>
        </form>
      </Form>

      <LimitExceededDialog
        open={showLimitExceeded}
        onOpenChange={setShowLimitExceeded}
        currentCount={currentCount}
        limit={limit}
      />
    </ScrollArea>
  );
}