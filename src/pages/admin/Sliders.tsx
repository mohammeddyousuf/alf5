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
import { Loader2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SliderForm } from "@/components/admin/slider/SliderForm";
import { supabase } from "@/integrations/supabase/client";

const Sliders = () => {
  const [open, setOpen] = useState(false);
  const [selectedSlider, setSelectedSlider] = useState<any>(null);

  const { data: sliders, isLoading } = useQuery({
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
              <Button onClick={() => setSelectedSlider(null)}>
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
                onSuccess={() => setOpen(false)} 
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
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedSlider(slider);
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

export default Sliders;
