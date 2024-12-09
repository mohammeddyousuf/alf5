import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const NewsTickerBanner = () => {
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
      <div className="bg-primary text-primary-foreground py-2 flex items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
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