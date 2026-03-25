import { useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/db";
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
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", pageSlug)
        .maybeSingle();
      
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
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-muted-foreground">Page Not Found</h1>
          <p className="text-muted-foreground">The page you're looking for doesn't exist yet.</p>
        </div>
      </div>
    );
  }

  // Function to convert markdown-style links to HTML
  const convertLinksToHtml = (text: string) => {
    // Regular expression to match [text](url) pattern
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    return text.replace(linkRegex, (match, text, url) => {
      // For WhatsApp connect links, use the special parameter
      if (url === "whatsapp-connect") {
        url = "/?connect=whatsapp";
      }
      return `<a href="${url}" class="text-primary hover:underline">${text}</a>`;
    });
  };

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">{page.title}</h1>
      <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none">
        {page.content.split("\n").map((paragraph, index) => (
          paragraph.trim() ? (
            <p 
              key={index} 
              className="text-left mb-6"
              dangerouslySetInnerHTML={{ __html: convertLinksToHtml(paragraph) }}
            />
          ) : (
            <div key={index} className="h-4" />
          )
        ))}
      </div>
    </div>
  );
};

export default Page;