import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { BackToDashboard } from "@/components/admin/BackToDashboard";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
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

const Enquiries = () => {
  const { toast } = useToast();

  const { data: enquiries } = useQuery({
    queryKey: ["enquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      console.log("Enquiries data:", data);
      return data;
    },
  });

  const downloadCSV = () => {
    if (!enquiries || enquiries.length === 0) {
      toast({
        variant: "destructive",
        title: "No enquiries to export",
        description: "There are no enquiries available to download",
      });
      return;
    }

    // Create CSV headers
    const headers = [
      "Date",
      "Name",
      "Mobile",
      "Email",
      "Comments",
      "Message",
      "Location",
      "IP Address",
      "Source"
    ];

    // Format enquiries data for CSV
    const csvData = enquiries.map(enquiry => [
      format(new Date(enquiry.created_at), "MMM d, yyyy HH:mm"),
      enquiry.name || "",
      enquiry.mobile || "",
      enquiry.email || "",
      enquiry.comments || "",
      enquiry.message || "",
      enquiry.location || "",
      enquiry.ip_address || "",
      enquiry.source || ""
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
    link.setAttribute("download", `enquiries-${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download started",
      description: "Your enquiries report is being downloaded",
    });
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Enquiries</h1>
            <p className="text-sm text-muted-foreground">View and manage enquiries</p>
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
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enquiries?.map((enquiry) => (
                <TableRow key={enquiry.id}>
                  <TableCell>
                    {format(new Date(enquiry.created_at), "PPpp")}
                  </TableCell>
                  <TableCell>{enquiry.name || '-'}</TableCell>
                  <TableCell>{enquiry.mobile || '-'}</TableCell>
                  <TableCell>{enquiry.email || '-'}</TableCell>
                  <TableCell>{enquiry.comments || '-'}</TableCell>
                  <TableCell>{enquiry.message}</TableCell>
                  <TableCell>{enquiry.location || '-'}</TableCell>
                  <TableCell>{enquiry.ip_address || '-'}</TableCell>
                  <TableCell>{enquiry.source || '-'}</TableCell>
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