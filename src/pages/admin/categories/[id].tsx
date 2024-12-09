import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CategoryForm } from "@/components/admin/category/CategoryForm";
import { Loader2 } from "lucide-react";

const EditCategory = () => {
  const { id } = useParams();

  const { data: category, isLoading } = useQuery({
    queryKey: ["admin-category", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
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

  if (!category) {
    return (
      <div className="container py-12">
        <p className="text-center text-muted-foreground">Category not found</p>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Edit Category</h1>
      <CategoryForm initialData={category} />
    </div>
  );
};

export default EditCategory;