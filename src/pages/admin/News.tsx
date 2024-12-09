import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NewsForm } from "@/components/admin/news/NewsForm";

const News = () => {
  const [open, setOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const queryClient = useQueryClient();

  const { data: news } = useQuery({
    queryKey: ["news_ticker"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_ticker")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });

  const handleEdit = (newsItem: any) => {
    setSelectedNews(newsItem);
    setOpen(true);
  };

  const handleSuccess = () => {
    setOpen(false);
    setSelectedNews(null);
    queryClient.invalidateQueries({ queryKey: ["news_ticker"] });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">News Ticker</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedNews(null)}>Add News Item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedNews ? "Edit News" : "Add News Item"}</DialogTitle>
            </DialogHeader>
            <NewsForm 
              initialData={selectedNews} 
              onSuccess={handleSuccess} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {news?.map((item: any) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 bg-card rounded-lg shadow"
          >
            <div>
              <p className="font-medium">{item.message}</p>
              <p className="text-sm text-muted-foreground">
                Order: {item.order_index}
              </p>
            </div>
            <Button variant="outline" onClick={() => handleEdit(item)}>
              Edit
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default News;