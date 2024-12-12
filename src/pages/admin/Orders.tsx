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
        <BackToDashboard />
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
