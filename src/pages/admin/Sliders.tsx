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
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SliderForm } from "@/components/admin/slider/SliderForm";
import { supabase } from "@/integrations/supabase/db";
import { useToast } from "@/hooks/use-toast";
import { ImageDeleteDialog } from "@/components/admin/shared/ImageDeleteDialog";

const Sliders = () => {
  const [open, setOpen] = useState(false);
  const [selectedSlider, setSelectedSlider] = useState<any>(null);
  const [sliderToDelete, setSliderToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: sliders, isLoading, refetch: refetchSliders } = useQuery({
    queryKey: ["sliders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sliders")
        .select("*")
        .order("order_index", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const handleDeleteSlider = async () => {
    if (!sliderToDelete) return;

    try {
      const { error } = await supabase
        .from("sliders")
        .delete()
        .eq("id", sliderToDelete);

      if (error) throw error;

      toast({ description: "Slider deleted successfully" });
      refetchSliders();
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message,
      });
    } finally {
      setSliderToDelete(null);
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
        <h1 className="text-3xl font-bold">Sliders</h1>
        <div className="flex items-center gap-4">
          <BackToDashboard />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Slider
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedSlider ? "Edit Slider" : "Add New Slider"}</DialogTitle>
              </DialogHeader>
              <SliderForm 
                slider={selectedSlider} 
                onSuccess={() => {
                  setOpen(false);
                  refetchSliders();
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sliders?.map((slider) => (
            <TableRow key={slider.id}>
              <TableCell>{slider.title}</TableCell>
              <TableCell>{slider.description}</TableCell>
              <TableCell>{slider.order_index}</TableCell>
              <TableCell>{slider.active ? "Yes" : "No"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedSlider(slider);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => setSliderToDelete(slider.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ImageDeleteDialog
        open={!!sliderToDelete}
        onOpenChange={() => setSliderToDelete(null)}
        onConfirm={handleDeleteSlider}
      />
    </div>
  );
};

export default Sliders;