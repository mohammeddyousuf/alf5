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
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/db";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ImageUploadField } from "./shared/ImageUploadField";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  image_url: z.string().optional(),
  link_url: z.string().optional(),
  button_text: z.string().optional(),
  seo_title: z.string().optional(),
  filter_category: z.string().nullable().optional(),
  filter_subcategory: z.string().nullable().optional(),
  filter_brand: z.string().nullable().optional(),
  filter_custom_label: z.string().nullable().optional(),
  filter_gender_profile: z.string().nullable().optional(),
  filter_occasion: z.string().nullable().optional(),
  filter_scent_family: z.string().nullable().optional(),
  filter_featured: z.boolean().default(false),
  filter_sale_only: z.boolean().default(false),
});

type CollectionRow = any;

interface CollectionFormProps {
  collection?: CollectionRow;
  onSuccess?: () => void;
}

export function CollectionForm({ collection, onSuccess }: CollectionFormProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: collection?.name ?? "",
      description: collection?.description ?? "",
      image_url: collection?.image_url ?? "",
      link_url: collection?.link_url ?? "",
      button_text: collection?.button_text ?? "View Collection",
      seo_title: collection?.seo_title ?? "",
      filter_category: collection?.filter_category ?? null,
      filter_subcategory: collection?.filter_subcategory ?? null,
      filter_brand: collection?.filter_brand ?? null,
      filter_custom_label: collection?.filter_custom_label ?? null,
      filter_gender_profile: collection?.filter_gender_profile ?? null,
      filter_occasion: collection?.filter_occasion ?? null,
      filter_scent_family: collection?.filter_scent_family ?? null,
      filter_featured: collection?.filter_featured ?? false,
      filter_sale_only: collection?.filter_sale_only ?? false,
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: subcategories } = useQuery({
    queryKey: ["subcategories", form.watch("filter_category")],
    queryFn: async () => {
      const catId = form.watch("filter_category");
      if (!catId) return [];
      const { data, error } = await supabase.from("subcategories").select("*").eq("category_id", catId).order("name");
      if (error) throw error;
      return data;
    },
    enabled: Boolean(form.watch("filter_category")),
  });

  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("brand").not("brand", "is", null).order("brand");
      if (error) throw error;
      return Array.from(new Set(data.map(p => p.brand))).filter(Boolean) as string[];
    },
  });

  const { data: labels } = useQuery({
    queryKey: ["labels"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("custom_label").not("custom_label", "is", null).order("custom_label");
      if (error) throw error;
      return Array.from(new Set(data.map(p => p.custom_label))).filter(Boolean) as string[];
    },
  });

  const { data: filterOptions } = useQuery({
    queryKey: ["collection-filter-options"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("gender_profile, occasion, scent_family").eq("status", "published");
      if (error) throw error;
      const extractUnique = (field: string) => {
        const s = new Set<string>();
        data?.forEach(p => { const v = (p as any)[field]; if (v?.trim()) s.add(v.trim()); });
        return Array.from(s).sort();
      };
      return {
        genderProfiles: extractUnique("gender_profile"),
        occasions: extractUnique("occasion"),
        scentFamilies: extractUnique("scent_family"),
      };
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const payload = {
        name: values.name,
        description: values.description,
        image_url: values.image_url,
        link_url: values.link_url,
        button_text: values.button_text || "View Collection",
        seo_title: values.seo_title || null,
        filter_category: values.filter_category || null,
        filter_subcategory: values.filter_subcategory || null,
        filter_brand: values.filter_brand || null,
        filter_custom_label: values.filter_custom_label || null,
        filter_gender_profile: values.filter_gender_profile || null,
        filter_occasion: values.filter_occasion || null,
        filter_scent_family: values.filter_scent_family || null,
        filter_featured: values.filter_featured,
        filter_sale_only: values.filter_sale_only,
      };

      if (collection) {
        const { error } = await supabase.from("collections").update(payload).eq("id", collection.id);
        if (error) throw error;
        toast({ title: "Success", description: "Collection updated successfully" });
      } else {
        const { error } = await supabase.from("collections").insert(payload);
        if (error) throw error;
        toast({ title: "Success", description: "Collection created successfully" });
      }
      onSuccess?.();
      form.reset();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
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
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="seo_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SEO Title (H1)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Best Woody Fragrances for Men" />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">This will be the H1 heading on the collection page. Keep under 60 chars for SEO.</p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl><Textarea {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="link_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link URL (Optional Override)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Leave empty to use collection page" />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">If empty, clicking will go to the dedicated collection page.</p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="button_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Button Label</FormLabel>
              <FormControl><Input {...field} placeholder="View Collection" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <ImageUploadField
                imageUrl={field.value}
                onImageChange={(url) => form.setValue("image_url", url || "")}
                isUploading={isUploading}
                setIsUploading={setIsUploading}
                isCollection={true}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-sm">Product Filters (for collection page)</h3>
          <p className="text-xs text-muted-foreground">Select which products to show on this collection's page.</p>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="filter_category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={(v) => { field.onChange(v === "none" ? null : v); form.setValue("filter_subcategory", null); }} value={field.value || "none"}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="none">Any</SelectItem>
                      {categories?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="filter_subcategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender Profile</FormLabel>
                  <Select onValueChange={(v) => field.onChange(v === "none" ? null : v)} value={field.value || "none"} disabled={!form.watch("filter_category")}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="none">Any</SelectItem>
                      {subcategories?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="filter_brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <Select onValueChange={(v) => field.onChange(v === "none" ? null : v)} value={field.value || "none"}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="none">Any</SelectItem>
                      {brands?.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="filter_custom_label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Label</FormLabel>
                  <Select onValueChange={(v) => field.onChange(v === "none" ? null : v)} value={field.value || "none"}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="none">Any</SelectItem>
                      {labels?.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="filter_gender_profile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender Profile</FormLabel>
                  <Select onValueChange={(v) => field.onChange(v === "none" ? null : v)} value={field.value || "none"}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="none">Any</SelectItem>
                      {filterOptions?.genderProfiles?.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="filter_occasion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Occasion</FormLabel>
                  <Select onValueChange={(v) => field.onChange(v === "none" ? null : v)} value={field.value || "none"}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="none">Any</SelectItem>
                      {filterOptions?.occasions?.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="filter_scent_family"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scent Family</FormLabel>
                  <Select onValueChange={(v) => field.onChange(v === "none" ? null : v)} value={field.value || "none"}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="none">Any</SelectItem>
                      {filterOptions?.scentFamilies?.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-6">
            <FormField
              control={form.control}
              name="filter_featured"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0">Featured Only</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="filter_sale_only"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0">Sale Only</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit">
          {collection ? "Update Collection" : "Create Collection"}
        </Button>
      </form>
    </Form>
  );
}
