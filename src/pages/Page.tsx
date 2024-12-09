import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Page = () => {
  const { slug } = useParams();

  const { data: page, isLoading } = useQuery({
    queryKey: ["page", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
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
      <h1 className="text-4xl font-bold text-center mb-8">{page.title}</h1>
      <div className="prose prose-sm md:prose-base lg:prose-lg mx-auto">
        {page.content.split("\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
};

export default Page;