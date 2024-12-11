import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { productFormSchema } from "./schema";

type FormData = z.infer<typeof productFormSchema>;

interface PriceFieldsProps {
  form: UseFormReturn<FormData>;
}

export function PriceFields({ form }: PriceFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Price</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                {...field} 
                onChange={(e) => {
                  const value = Math.floor(Number(e.target.value));
                  field.onChange(value);
                }}
              />
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
              <Input 
                type="number"
                {...field} 
                value={field.value ?? ''} 
                onChange={(e) => {
                  const value = e.target.value === '' ? null : Math.floor(Number(e.target.value));
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}