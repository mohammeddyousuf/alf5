import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NewsForm } from "@/components/admin/news/NewsForm";

const News = () => {
  const [open, setOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<any>(null);

  const { data: newsItems, isLoading } = useQuery({
    queryKey: ["news-ticker"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_ticker")
        .select("*")
        .order("order_index", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">News Ticker</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedNews(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add News
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedNews ? "Edit News" : "Add News Item"}</DialogTitle>
            </DialogHeader>
            <NewsForm 
              news={selectedNews} 
              onSuccess={() => setOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Message</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {newsItems?.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.message}</TableCell>
              <TableCell>{item.order_index}</TableCell>
              <TableCell>{item.active ? "Yes" : "No"}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedNews(item);
                    setOpen(true);
                  }}
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default News;