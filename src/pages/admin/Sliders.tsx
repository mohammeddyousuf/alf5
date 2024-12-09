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
import { SliderForm } from "@/components/admin/slider/SliderForm";

const Sliders = () => {
  const [open, setOpen] = useState(false);
  const [selectedSlider, setSelectedSlider] = useState(null);
  const queryClient = useQueryClient();

  const { data: sliders } = useQuery({
    queryKey: ["sliders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sliders")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });

  const handleEdit = (slider: any) => {
    setSelectedSlider(slider);
    setOpen(true);
  };

  const handleSuccess = () => {
    setOpen(false);
    setSelectedSlider(null);
    queryClient.invalidateQueries({ queryKey: ["sliders"] });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sliders</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedSlider(null)}>Add New Slider</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedSlider ? "Edit Slider" : "Add New Slider"}</DialogTitle>
            </DialogHeader>
            <SliderForm 
              initialData={selectedSlider} 
              onSuccess={handleSuccess} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {sliders?.map((slider: any) => (
          <div
            key={slider.id}
            className="flex items-center justify-between p-4 bg-card rounded-lg shadow"
          >
            <div>
              <p className="font-medium">{slider.title}</p>
              <p className="text-sm text-muted-foreground">
                Order: {slider.order_index}
              </p>
            </div>
            <Button variant="outline" onClick={() => handleEdit(slider)}>
              Edit
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sliders;