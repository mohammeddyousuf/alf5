import { useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Page = () => {
  const { slug } = useParams();
  const location = useLocation();
  
  // Remove leading slash to get the page slug
  const currentPath = location.pathname.substring(1);
  
  // Use either the route path or the slug parameter
  const pageSlug = slug || currentPath;

  const { data: page, isLoading, error } = useQuery({
    queryKey: ["page", pageSlug],
    queryFn: async () => {
      // First try to fetch by slug
      let { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", pageSlug)
        .maybeSingle();
      
      if (error) throw error;
      
      // If no page found by slug, try to match the path
      if (!data) {
        const { data: pathData, error: pathError } = await supabase
          .from("pages")
          .select("*")
          .eq("slug", currentPath)
          .maybeSingle();
        
        if (pathError) throw pathError;
        data = pathData;
      }
      
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
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-muted-foreground">Page Not Found</h1>
          <p className="text-muted-foreground">The page you're looking for doesn't exist yet.</p>
        </div>
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