import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Define the schema to match Supabase table requirements
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(1, "Content is required"),
});

// Define the type for our form values to match Supabase table
type FormValues = z.infer<typeof formSchema>;

interface PageFormProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    content: string;
  };
}

export const PageForm = ({ initialData }: PageFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      slug: "",
      content: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);

      if (initialData) {
        const { error } = await supabase
          .from("pages")
          .update(values)
          .eq("id", initialData.id);

        if (error) throw error;
      } else {
        const newPage = {
          ...values, // This spreads required fields: title, slug, content
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from("pages")
          .insert(newPage);

        if (error) throw error;
      }

      toast({
        title: `Page ${initialData ? "updated" : "created"} successfully`,
      });
      navigate("/admin/pages");
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea {...field} rows={10} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update" : "Create"} Page
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={() => navigate("/admin/pages")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};