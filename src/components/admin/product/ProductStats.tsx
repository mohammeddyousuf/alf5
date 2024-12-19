import { Database } from "@/integrations/supabase/types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

interface ProductStatsProps {
  products: ProductRow[] | undefined;
  systemLimits: any;
  totalImages: number;
  folderSize: number;
}

export function ProductStats({ 
  products, 
  systemLimits, 
  totalImages, 
  folderSize 
}: ProductStatsProps) {
  return (
    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-1">
      <li>Total Products: {products?.length || 0}/{systemLimits?.product_limit || '...'}</li>
      <li>Total Images: {totalImages}</li>
      {folderSize > 0 && (
        <li>Images Folder Size: {(folderSize / (1024 * 1024)).toFixed(2)} MB / {systemLimits?.max_folder_size_mb || '...'} MB</li>
      )}
    </ul>
  );
}