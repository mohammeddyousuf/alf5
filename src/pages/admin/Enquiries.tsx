import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

const Enquiries = () => {
  const { data: enquiries } = useQuery({
    queryKey: ["enquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <AdminHeader />
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Message</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enquiries?.map((enquiry) => (
                <TableRow key={enquiry.id}>
                  <TableCell>{enquiry.message}</TableCell>
                  <TableCell>{enquiry.location}</TableCell>
                  <TableCell>{enquiry.ip_address}</TableCell>
                  <TableCell>{enquiry.source}</TableCell>
                  <TableCell>
                    {format(new Date(enquiry.created_at), "PPpp")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Enquiries;