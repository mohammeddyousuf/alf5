import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: slides, isLoading } = useQuery({
    queryKey: ["sliders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sliders")
        .select("*")
        .eq("active", true)
        .order("order_index", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const nextSlide = () => {
    if (!slides?.length) return;
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    if (!slides?.length) return;
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  if (isLoading) {
    return (
      <div className="h-[300px] md:h-[500px] flex items-center justify-center bg-background w-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!slides?.length) return null;

  return (
    <div className="relative h-[300px] md:h-[500px] overflow-hidden w-full">
      <div
        className="flex h-full transition-transform duration-500 ease-out w-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="min-w-full h-full relative"
          >
            <img
              src={slide.image_url}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-background/40 flex items-center justify-center text-center">
              <div className="text-background-foreground px-4">
                <h2 className="text-4xl md:text-6xl font-bold mb-4">{slide.title}</h2>
                {slide.description && (
                  <p className="text-xl md:text-2xl mb-6">{slide.description}</p>
                )}
                {slide.link_url && (
                  <Link 
                    to={slide.link_url}
                    className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg transition-colors"
                  >
                    {slide.button_text || "Learn More"}
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {slides.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}
    </div>
  );
};