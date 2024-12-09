import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CollectionForm } from "@/components/admin/CollectionForm";
import { Loader2 } from "lucide-react";

const EditCollection = () => {
  const { id } = useParams();

  const { data: collection, isLoading } = useQuery({
    queryKey: ["admin-collection", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
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

  if (!collection) {
    return (
      <div className="container py-12">
        <p className="text-center text-muted-foreground">Collection not found</p>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Edit Collection</h1>
      <CollectionForm collection={collection} />
    </div>
  );
};

export default EditCollection;