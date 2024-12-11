import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { productFormSchema } from "./schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";

type FormData = z.infer<typeof productFormSchema>;

interface BasicFieldsProps {
  form: UseFormReturn<FormData>;
}

export function BasicFields({ form }: BasicFieldsProps) {
  // Watch for changes in sale_timer_enabled
  const saleTimerEnabled = form.watch("sale_timer_enabled");
  const salePrice = form.watch("sale_price");

  // Reset sale end date when timer is disabled
  useEffect(() => {
    if (!saleTimerEnabled) {
      form.setValue("sale_end_date", null);
    }
  }, [saleTimerEnabled, form]);

  return (
    <>
      <div className="flex justify-between items-center">
        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Featured Product</FormLabel>
                <div className="text-sm text-muted-foreground">
                  This product will be displayed in featured sections
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="sale_timer_enabled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Enable Sale Timer</FormLabel>
              <div className="text-sm text-muted-foreground">
                Set a timer for the sale price
              </div>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  if (!checked) {
                    form.setValue("sale_end_date", null);
                  }
                }}
                disabled={!salePrice}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {saleTimerEnabled && salePrice && (
        <FormField
          control={form.control}
          name="sale_end_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sale End Date and Time</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local" 
                  {...field} 
                  value={field.value || ''} 
                  min={new Date().toISOString().slice(0, 16)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

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
        name="brand"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Brand</FormLabel>
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
    </>
  );
}