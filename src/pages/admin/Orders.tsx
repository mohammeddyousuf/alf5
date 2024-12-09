import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Orders() {
  const { toast } = useToast();
  
  const { data: orders, error } = useQuery({
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

  const downloadCSV = () => {
    if (!orders) return;

    const headers = [
      "Order Date",
      "Product Name",
      "Brand",
      "Price",
      "Customer Name",
      "Email",
      "Mobile",
      "Address",
      "Payment Mode",
    ];

    const csvData = orders.map((order) => [
      format(new Date(order.created_at), "yyyy-MM-dd HH:mm:ss"),
      order.product_name,
      order.product_brand || "",
      order.product_price,
      order.customer_name,
      order.customer_email,
      order.customer_mobile,
      order.customer_address,
      order.payment_mode,
    ]);

    const csvContent =
      [headers, ...csvData].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Button onClick={downloadCSV}>
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
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
                <TableCell>${order.product_price}</TableCell>
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
