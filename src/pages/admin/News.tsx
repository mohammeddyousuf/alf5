import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { BackToDashboard } from "@/components/admin/BackToDashboard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NewsForm } from "@/components/admin/news/NewsForm";
import { supabase } from "@/integrations/supabase/client";
import { ImageDeleteDialog } from "@/components/admin/shared/ImageDeleteDialog";
import { useToast } from "@/hooks/use-toast";

const News = () => {
  const [open, setOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<any>(null);
  const { toast } = useToast();

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

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("news_ticker")
        .delete()
        .eq("id", newsToDelete.id);

      if (error) throw error;

      toast({ description: "News item deleted successfully" });
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message,
      });
    }
  };

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
        <div className="flex items-center gap-4">
          <BackToDashboard />
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
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedNews(item);
                      setOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => {
                      setNewsToDelete(item);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ImageDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        count={1}
      />
    </div>
  );
};

export default News;