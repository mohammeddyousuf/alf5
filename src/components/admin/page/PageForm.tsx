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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(1, "Content is required"),
  location: z.enum(["header", "footer_company", "footer_legal", "none"]),
});

type FormValues = z.infer<typeof formSchema>;

interface PageFormProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    content: string;
    location?: "header" | "footer_company" | "footer_legal" | "none" | null;
  };
}

export const PageForm = ({ initialData }: PageFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      content: initialData?.content || "",
      location: (initialData?.location as FormValues["location"]) || "none",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);

      if (initialData) {
        const { error } = await supabase
          .from("pages")
          .update({
            title: values.title,
            slug: values.slug,
            content: values.content,
            location: values.location,
          })
          .eq("id", initialData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("pages")
          .insert({
            title: values.title,
            slug: values.slug,
            content: values.content,
            location: values.location,
          });

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
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Page Location</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select page location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="header">Header Navigation</SelectItem>
                  <SelectItem value="footer_company">Footer - Company Section</SelectItem>
                  <SelectItem value="footer_legal">Footer - Legal Section</SelectItem>
                  <SelectItem value="none">No Navigation Link</SelectItem>
                </SelectContent>
              </Select>
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