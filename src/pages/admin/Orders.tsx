import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Download } from "lucide-react";

export default function Orders() {
  const { toast } = useToast();
  
  const { data: orders, error, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      console.log("Fetching orders...");
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching orders:", error);
        toast({
          variant: "destructive",
          title: "Error fetching orders",
          description: "Please make sure the orders table exists in your database",
        });
        throw error;
      }
      
      console.log("Orders fetched successfully:", data);
      return data;
    },
  });

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const downloadCSV = () => {
    if (!orders || orders.length === 0) {
      toast({
        variant: "destructive",
        title: "No orders to export",
        description: "There are no orders available to download",
      });
      return;
    }

    // Create CSV headers
    const headers = [
      "Date",
      "Product",
      "Brand",
      "Customer",
      "Email",
      "Mobile",
      "Address",
      "Price",
      "Payment Mode"
    ];

    // Format orders data for CSV
    const csvData = orders.map(order => [
      format(new Date(order.created_at), "MMM d, yyyy HH:mm"),
      order.product_name,
      order.product_brand || "",
      order.customer_name,
      order.customer_email,
      order.customer_mobile,
      order.customer_address,
      order.product_price,
      order.payment_mode
    ]);

    // Combine headers and data
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `orders-${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download started",
      description: "Your orders report is being downloaded",
    });
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Orders</h1>
        <div className="bg-destructive/15 text-destructive p-4 rounded-md">
          <p className="font-medium">Error loading orders</p>
          <p className="text-sm mt-1">Please make sure the orders table exists in your database</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Orders</h1>
        <div className="text-muted-foreground">Loading orders...</div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Orders</h1>
        <div className="bg-muted/50 p-8 rounded-lg text-center">
          <p className="text-lg text-muted-foreground">No orders found</p>
          <p className="text-sm text-muted-foreground mt-1">Orders will appear here once customers start placing them</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">View and manage orders</p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={downloadCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
          <BackToDashboard />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  {format(new Date(order.created_at), "MMM d, yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{order.product_name}</div>
                    {order.product_brand && (
                      <div className="text-sm text-muted-foreground">
                        {order.product_brand}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{order.customer_name}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{order.customer_email}</div>
                    <div>{order.customer_mobile}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm max-w-[200px] break-words">
                    {order.customer_address}
                  </div>
                </TableCell>
                <TableCell>{formatPrice(order.product_price)}</TableCell>
                <TableCell>
                  <div className="capitalize">{order.payment_mode}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}