import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { ImageManagementDialog } from "./ImageManagementDialog";
import { LimitExceededDialog } from "./LimitExceededDialog";
import { BulkUploadLimitDialog } from "./BulkUploadLimitDialog";
import { handleProductImport, exportProducts } from "@/utils/productImportExport";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Database } from "@/integrations/supabase/types";
import { useState } from "react";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

interface ProductActionsProps {
  products: ProductRow[] | undefined;
  categories: any[];
  subcategories: any[];
  systemLimits: any;
  folderSize: number;
  setFolderSize: (size: number) => void;
  fetchTotalImages: () => Promise<void>;
}

export function ProductActions({
  products,
  categories,
  subcategories,
  systemLimits,
  folderSize,
  setFolderSize,
  fetchTotalImages
}: ProductActionsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showImageManager, setShowImageManager] = useState(false);
  const [showLimitExceeded, setShowLimitExceeded] = useState(false);
  const [showBulkUploadLimit, setShowBulkUploadLimit] = useState(false);
  const [bulkUploadLimitMessage, setBulkUploadLimitMessage] = useState("");

  const handleAddProduct = () => {
    const currentCount = products?.length || 0;
    const limit = systemLimits?.product_limit || 100;
    if (currentCount >= limit) {
      setShowLimitExceeded(true);
      return;
    }
    navigate("/admin/products/new");
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedCount = await handleProductImport(file, products, systemLimits);
      toast({
        title: "Success",
        description: `${importedCount} products imported/updated successfully`,
      });
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    try {
      await exportProducts(products, categories, subcategories);
    } catch (error) {
      console.error('Error exporting products:', error);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => setShowImageManager(true)}
        >
          <Upload className="h-4 w-4 mr-2" />
          Images
        </Button>
        <input
          type="file"
          accept=".csv"
          onChange={handleImport}
          className="hidden"
          id="import-file"
        />
        <label htmlFor="import-file">
          <Button variant="outline" className="cursor-pointer" asChild>
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import CSV
            </div>
          </Button>
        </label>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
        <Button onClick={handleAddProduct}>Add Product</Button>
      </div>

      <ImageManagementDialog
        open={showImageManager}
        onOpenChange={setShowImageManager}
        onImageUpload={fetchTotalImages}
        folderSize={folderSize}
      />

      <LimitExceededDialog
        open={showLimitExceeded}
        onOpenChange={setShowLimitExceeded}
        currentCount={products?.length || 0}
        limit={systemLimits?.product_limit || 100}
      />

      <BulkUploadLimitDialog
        open={showBulkUploadLimit}
        onOpenChange={setShowBulkUploadLimit}
        message={bulkUploadLimitMessage}
      />
    </>
  );
}