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
  image_url: z.string().optional(),
});

type CollectionRow = Database["public"]["Tables"]["collections"]["Row"];

interface CollectionFormProps {
  collection?: CollectionRow;
  onSuccess?: () => void;
}

export function CollectionForm({ collection, onSuccess }: CollectionFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: collection?.name ?? "",
      description: collection?.description ?? "",
      image_url: collection?.image_url ?? "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (collection) {
        const { error } = await supabase
          .from("collections")
          .update({
            name: values.name,
            description: values.description,
            image_url: values.image_url,
          })
          .eq("id", collection.id);
        if (error) throw error;
        toast({
          title: "Success",
          description: "Collection updated successfully",
        });
      } else {
        const { error } = await supabase.from("collections").insert({
          name: values.name,
          description: values.description,
          image_url: values.image_url,
        });
        if (error) throw error;
        toast({
          title: "Success",
          description: "Collection created successfully",
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

        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">
          {collection ? "Update Collection" : "Create Collection"}
        </Button>
      </form>
    </Form>
  );
}