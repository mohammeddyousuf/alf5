import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Orders } from "@/integrations/supabase/types/orders";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/db";

interface OrdersTableProps {
  orders: Orders[];
  formatPrice: (amount: number) => string;
}

export function OrdersTable({ orders, formatPrice }: OrdersTableProps) {
  // Fetch products to get categories and subcategories
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id, 
          whatsapp_number,
          categories!inner(
            name
          ),
          subcategories!inner(
            name
          )
        `);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch default WhatsApp number from settings
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("whatsapp_number")
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const getWhatsAppNumber = (order: Orders) => {
    if (!products) return settings?.whatsapp_number || '+919900981857';
    
    const product = products.find(p => p.id === order.product_id);
    return product?.whatsapp_number || settings?.whatsapp_number || '+919900981857';
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Subcategory</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Sent To WhatsApp</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Source</TableHead>
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
              <TableCell>
                <div className="text-sm">{order.category_name || '-'}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{order.subcategory_name || '-'}</div>
              </TableCell>
              <TableCell>{order.customer_name}</TableCell>
              <TableCell>
                <div className="text-sm">{order.customer_email}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{order.customer_mobile}</div>
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
              <TableCell>
                <div className="text-sm">{order.message || '-'}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm font-medium">{getWhatsAppNumber(order)}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{order.location || '-'}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{order.ip_address || '-'}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{order.source || '-'}</div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}