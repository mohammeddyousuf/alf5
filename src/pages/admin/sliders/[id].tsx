import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SliderForm } from "@/components/admin/slider/SliderForm";
import { Loader2 } from "lucide-react";

const EditSlider = () => {
  const { id } = useParams();

  const { data: slider, isLoading } = useQuery({
    queryKey: ["admin-slider", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sliders")
        .select("*")
        .eq("id", id)
        .single();
      
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

  if (!slider) {
    return (
      <div className="container py-12">
        <p className="text-center text-muted-foreground">Slider not found</p>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Edit Slider</h1>
      <SliderForm initialData={slider} />
    </div>
  );
};

export default EditSlider;