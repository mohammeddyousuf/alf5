import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/integrations/supabase/types";

type Settings = Database["public"]["Tables"]["settings"]["Row"];

const formSchema = z.object({
  website_name: z.string().min(1, "Website name is required"),
  whatsapp_number: z.string().min(1, "WhatsApp number is required"),
  whatsapp_group_url: z.string().nullable().optional(),
  facebook_url: z.string().nullable().optional(),
  instagram_url: z.string().nullable().optional(),
  currency_symbol: z.string().min(1, "Currency symbol is required").default("$"),
});

interface GeneralSettingsProps {
  settings: Settings | null;
  refetch: () => void;
}

export function GeneralSettings({ settings, refetch }: GeneralSettingsProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      website_name: settings?.website_name || "",
      whatsapp_number: settings?.whatsapp_number || "",
      whatsapp_group_url: settings?.whatsapp_group_url || "",
      facebook_url: settings?.facebook_url || "",
      instagram_url: settings?.instagram_url || "",
      currency_symbol: settings?.currency_symbol || "$",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { error } = await supabase
        .from("settings")
        .update({
          website_name: values.website_name,
          whatsapp_number: values.whatsapp_number,
          whatsapp_group_url: values.whatsapp_group_url,
          facebook_url: values.facebook_url,
          instagram_url: values.instagram_url,
          currency_symbol: values.currency_symbol,
        })
        .eq("id", settings?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Settings updated successfully",
      });

      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="website_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currency_symbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency Symbol</FormLabel>
              <FormControl>
                <Input {...field} placeholder="$" />
              </FormControl>
              <FormDescription>
                This symbol will be used for all product prices across the website
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="whatsapp_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="whatsapp_group_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp Group URL (Optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="facebook_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Facebook URL (Optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="instagram_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instagram URL (Optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  );
}