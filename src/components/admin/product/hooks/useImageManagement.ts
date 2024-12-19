import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useImageManagement = () => {
  const { toast } = useToast();
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 12;

  const loadImages = async () => {
    try {
      setIsLoading(true);
      const { data: imageData, error: imageError } = await supabase.storage
        .from("product-images")
        .list();

      if (imageError) throw imageError;

      // Get all products to find image usage
      const { data: products } = await supabase
        .from("products")
        .select("name, images");

      // Get all sliders
      const { data: sliders } = await supabase
        .from("sliders")
        .select("title, image_url");

      // Get all collections
      const { data: collections } = await supabase
        .from("collections")
        .select("name, image_url");

      // Get website settings for logo and favicon
      const { data: settings } = await supabase
        .from("settings")
        .select("logo_url, favicon_url")
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const imagesWithUsage = await Promise.all(
        imageData.map(async (file) => {
          const { data: { publicUrl } } = supabase.storage
            .from("product-images")
            .getPublicUrl(file.name);

          const usage = [];

          // Check products
          products?.forEach(product => {
            if (product.images?.includes(publicUrl)) {
              usage.push({ type: 'Product', name: product.name });
            }
          });

          // Check sliders
          sliders?.forEach(slider => {
            if (slider.image_url === publicUrl) {
              usage.push({ type: 'Slider', name: slider.title });
            }
          });

          // Check collections
          collections?.forEach(collection => {
            if (collection.image_url === publicUrl) {
              usage.push({ type: 'Collection', name: collection.name });
            }
          });

          // Check logo and favicon
          if (settings?.logo_url === publicUrl) {
            usage.push({ type: 'Website', name: 'Logo' });
          }
          if (settings?.favicon_url === publicUrl) {
            usage.push({ type: 'Website', name: 'Favicon' });
          }

          return {
            ...file,
            url: publicUrl,
            usage
          };
        })
      );

      setImages(imagesWithUsage);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPaginatedImages = (
    images: any[],
    sortOrder: string,
    showUnassigned: boolean,
    searchQuery: string
  ) => {
    let filteredImages = images.filter(image => 
      image.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.usage?.some((u: any) => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    
    if (showUnassigned) {
      filteredImages = filteredImages.filter(image => !image.usage || image.usage.length === 0);
    }
    
    // Sort images
    filteredImages.sort((a, b) => {
      if (sortOrder === "name-asc") {
        return a.name.localeCompare(b.name);
      } else if (sortOrder === "name-desc") {
        return b.name.localeCompare(a.name);
      } else if (sortOrder === "date-asc") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    // Calculate pagination
    const startIndex = (currentPage - 1) * imagesPerPage;
    const endIndex = startIndex + imagesPerPage;
    const paginatedImages = filteredImages.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredImages.length / imagesPerPage);

    return {
      paginatedImages,
      totalPages,
      totalImages: filteredImages.length
    };
  };

  return {
    images,
    isLoading,
    currentPage,
    setCurrentPage,
    imagesPerPage,
    loadImages,
    getPaginatedImages
  };
};