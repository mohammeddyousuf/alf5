import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import { BackToDashboard } from "@/components/admin/BackToDashboard";

interface ProductHeaderProps {
  productsCount: number;
  totalImages: number;
  folderSize: number;
  systemLimits: any;
  onAddProduct: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onShowImageManager: () => void;
  isMobile: boolean;
}

export const ProductHeader = ({
  productsCount,
  totalImages,
  folderSize,
  systemLimits,
  onAddProduct,
  onImport,
  onExport,
  onShowImageManager,
  isMobile
}: ProductHeaderProps) => {
  return (
    <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'justify-between items-center'}`}>
      <div className="space-y-1 text-left">
        <h1 className="text-3xl font-bold">Products</h1>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-1">
          <li>Total Products: {productsCount}/{systemLimits?.product_limit || '...'}</li>
          <li>Total Images: {totalImages}</li>
          {folderSize > 0 && (
            <li>Images Folder Size: {(folderSize / (1024 * 1024)).toFixed(2)} MB / {systemLimits?.max_folder_size_mb || '...'} MB</li>
          )}
        </ul>
      </div>
      <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center gap-4'}`}>
        <BackToDashboard />
        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center gap-2'}`}>
          <Button 
            variant="outline" 
            onClick={onShowImageManager}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Images
          </Button>
          <input
            type="file"
            accept=".csv"
            onChange={onImport}
            className="hidden"
            id="import-file"
          />
          <label htmlFor="import-file">
            <Button variant="outline" className="cursor-pointer w-full" asChild>
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import CSV
              </div>
            </Button>
          </label>
          <Button variant="outline" onClick={onExport} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={onAddProduct} className="w-full">Add Product</Button>
        </div>
      </div>
    </div>
  );
};