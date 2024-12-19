import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useImageManagement = () => {
  const [totalImages, setTotalImages] = useState(0);
  const [folderSize, setFolderSize] = useState<number>(0);

  const fetchTotalImages = async () => {
    try {
      const { data, error } = await supabase.storage
        .from("product-images")
        .list();
      
      if (error) {
        console.error("Error fetching images:", error);
        return;
      }

      setTotalImages(data.length);
      
      const totalSize = data.reduce((acc, file) => acc + (file.metadata?.size || 0), 0);
      setFolderSize(totalSize);
    } catch (error) {
      console.error("Error in fetchTotalImages:", error);
    }
  };

  useEffect(() => {
    fetchTotalImages();
  }, []);

  return {
    totalImages,
    folderSize,
    fetchTotalImages
  };
};