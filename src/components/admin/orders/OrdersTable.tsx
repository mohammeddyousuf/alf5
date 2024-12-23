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

interface OrdersTableProps {
  orders: Orders[];
  formatPrice: (amount: number) => string;
}

export function OrdersTable({ orders, formatPrice }: OrdersTableProps) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Customer WhatsApp</TableHead>
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
                <div className="text-sm">{order.whatsapp_number || '-'}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm font-medium">{order.sent_to_whatsapp || '-'}</div>
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