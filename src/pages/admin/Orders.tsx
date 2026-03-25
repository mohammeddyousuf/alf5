import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/db";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { OrdersHeader } from "@/components/admin/orders/OrdersHeader";
import { OrdersTable } from "@/components/admin/orders/OrdersTable";

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
      // Log each order's new fields to verify they exist
      data?.forEach(order => {
        console.log("Order details:", {
          id: order.id,
          message: order.message,
          location: order.location,
          ip_address: order.ip_address,
          source: order.source
        });
      });
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
      <OrdersHeader onDownloadCSV={downloadCSV} />
      <OrdersTable orders={orders} formatPrice={formatPrice} />
    </div>
  );
}