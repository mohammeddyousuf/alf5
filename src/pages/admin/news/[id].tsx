import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsForm } from "@/components/admin/news/NewsForm";
import { Loader2 } from "lucide-react";

const EditNews = () => {
  const { id } = useParams();

  const { data: news, isLoading } = useQuery({
    queryKey: ["admin-news", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_ticker")
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

  if (!news) {
    return (
      <div className="container py-12">
        <p className="text-center text-muted-foreground">News item not found</p>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Edit News Item</h1>
      <NewsForm initialData={news} />
    </div>
  );
};

export default EditNews;