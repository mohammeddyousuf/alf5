import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageForm } from "@/components/admin/page/PageForm";
import { Loader2 } from "lucide-react";

const EditPage = () => {
  const { id } = useParams();

  const { data: page, isLoading } = useQuery({
    queryKey: ["admin-page", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="container py-12">
        <p className="text-center text-muted-foreground">Page not found</p>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Edit Page</h1>
      <PageForm initialData={page} />
    </div>
  );
};

export default EditPage;