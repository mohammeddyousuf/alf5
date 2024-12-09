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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/integrations/supabase/types";

const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

interface CategoryFormProps {
  initialData?: CategoryRow;
  onSuccess?: () => void;
}

export function CategoryForm({ initialData, onSuccess }: CategoryFormProps) {
  const { toast } = useToast();
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
    },
  });

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      if (initialData) {
        const { error } = await supabase
          .from("categories")
          .update({
            name: values.name,
            description: values.description || null,
          })
          .eq("id", initialData.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
      } else {
        const { error } = await supabase.from("categories").insert({
          name: values.name,
          description: values.description || null,
        });
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Category created successfully",
        });
      }
      form.reset();
      onSuccess?.();
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {initialData ? "Update Category" : "Create Category"}
        </Button>
      </form>
    </Form>
  );
}