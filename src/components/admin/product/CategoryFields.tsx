import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { productFormSchema } from "./schema";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";

type FormData = z.infer<typeof productFormSchema>;

interface CategoryFieldsProps {
  form: UseFormReturn<FormData>;
}

export function CategoryFields({ form }: CategoryFieldsProps) {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: subcategories } = useQuery({
    queryKey: ["subcategories", form.watch("category_id")],
    queryFn: async () => {
      const categoryId = form.watch("category_id");
      if (!categoryId) return [];
      
      const { data, error } = await supabase
        .from("subcategories")
        .select("*")
        .eq("category_id", categoryId)
        .order("name");
      
      if (error) throw error;
      return data;
    },
    enabled: Boolean(form.watch("category_id")),
  });

  // Reset subcategory only when category changes and it's not the initial load
  useEffect(() => {
    const categoryId = form.watch("category_id");
    const subcategoryId = form.watch("subcategory_id");
    
    // Only reset if there's a category change and current subcategory exists
    if (categoryId && subcategoryId) {
      // Check if the current subcategory belongs to the selected category
      const subcategoryBelongsToCategory = subcategories?.some(
        (sub) => sub.id === subcategoryId
      );
      
      if (!subcategoryBelongsToCategory) {
        form.setValue("subcategory_id", null);
      }
    }
  }, [form.watch("category_id"), subcategories]);

  console.log("Current form values:", {
    category_id: form.watch("category_id"),
    subcategory_id: form.watch("subcategory_id"),
  });

  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="category_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value || undefined}
            >
              <FormControl>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="subcategory_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Subcategory</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value || undefined}
              disabled={!form.watch("category_id")}
            >
              <FormControl>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {subcategories?.map((subcategory) => (
                  <SelectItem key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}