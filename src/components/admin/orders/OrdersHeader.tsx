import { Button } from "@/components/ui/button";
import { BackToDashboard } from "@/components/admin/BackToDashboard";
import { Download } from "lucide-react";

interface OrdersHeaderProps {
  onDownloadCSV: () => void;
}

export function OrdersHeader({ onDownloadCSV }: OrdersHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">View and manage orders</p>
      </div>
      <div className="flex items-center gap-4">
        <Button onClick={onDownloadCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </Button>
        <BackToDashboard />
      </div>
    </div>
  );
}