import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const NewsTickerBanner = () => {
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("website_name")
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: newsItems, isLoading } = useQuery({
    queryKey: ["news-ticker"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_ticker")
        .select("*")
        .eq("active", true)
        .order("order_index", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="bg-primary text-primary-foreground py-2">
        <div className="animate-marquee whitespace-nowrap">
          <span className="mx-4">Welcome to {settings?.website_name || 'our store'}</span>
        </div>
      </div>
    );
  }

  if (!newsItems?.length) return null;

  return (
    <div className="bg-primary text-primary-foreground py-2 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap">
        {newsItems.map((item) => (
          <span key={item.id} className="mx-4">{item.message}</span>
        ))}
      </div>
    </div>
  );
};