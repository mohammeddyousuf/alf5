import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/db";

export const NewsTickerBanner = () => {
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("website_name, show_news_ticker")
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

  // Don't show the banner if news ticker is disabled in settings
  if (settings?.show_news_ticker === false) {
    return null;
  }

  // Always show welcome message, followed by news items if they exist
  const welcomeMessage = `Welcome to ${settings?.website_name || 'our store'}.`;
  const displayItems = newsItems?.length 
    ? [welcomeMessage, ...newsItems.map(item => item.message)]
    : [welcomeMessage];

  return (
    <div className="bg-primary text-primary-foreground py-2 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap">
        {displayItems.map((message, index) => (
          <span key={index} className="mx-4">{message}</span>
        ))}
      </div>
    </div>
  );
};