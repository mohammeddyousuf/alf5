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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/db";

type FormData = z.infer<typeof productFormSchema>;

interface BasicFieldsProps {
  form: UseFormReturn<FormData>;
}

export function BasicFields({ form }: BasicFieldsProps) {
  const whatsappNumber = form.watch("whatsapp_number");

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("whatsapp_number")
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

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
        name="whatsapp_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>WhatsApp Number Override</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                value={field.value || ''} 
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value || null);
                }}
                placeholder={`Default: ${settings?.whatsapp_number || 'Loading...'}`}
              />
            </FormControl>
            <FormMessage />
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {field.value ? 
                  `Currently using override: ${field.value}` : 
                  `Using default WhatsApp number: ${settings?.whatsapp_number || 'Loading...'}`
                }
              </p>
              {field.value && (
                <p className="text-sm text-yellow-600">
                  This product is using a custom WhatsApp number different from the default
                </p>
              )}
            </div>
          </FormItem>
        )}
      />

      <FormField
          control={form.control}
          name="custom_label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Retail / Tester</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. RETAIL, TESTER" className="uppercase" onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
              </FormControl>
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
        name="stock_status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Stock Status</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select stock status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="price_note"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Price Note</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value || null)} placeholder="e.g. Price fluctuates. Please contact for latest price." />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="gender_profile"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Gender Profile</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value || null)} placeholder="e.g. Unisex, Men, Women" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="occasion"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Occasion</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value || null)} placeholder="e.g. Evening, Date Night, Office" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="scent_family"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Scent Family</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value || null)} placeholder="e.g. Woody, Floral, Oriental" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="top_notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Top Notes</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} className="uppercase" onChange={(e) => field.onChange(e.target.value.toUpperCase() || null)} placeholder="e.g. BERGAMOT, LEMON, PINK PEPPER" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="heart_notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Heart Notes</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} className="uppercase" onChange={(e) => field.onChange(e.target.value.toUpperCase() || null)} placeholder="e.g. ROSE, JASMINE, IRIS" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="base_notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Base Notes</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} className="uppercase" onChange={(e) => field.onChange(e.target.value.toUpperCase() || null)} placeholder="e.g. MUSK, AMBER, SANDALWOOD" />
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
