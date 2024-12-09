import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CollectionForm } from "@/components/admin/CollectionForm";

const EditCollection = () => {
  const { id } = useParams();

  const { data: collection } = useQuery({
    queryKey: ["collections", id],
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

  if (!collection) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Edit Collection</h1>
      <CollectionForm initialData={collection} />
    </div>
  );
};

export default EditCollection;