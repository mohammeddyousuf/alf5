import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shield, UserCog } from "lucide-react";

interface Admin {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

interface AdminListProps {
  admins: Admin[];
}

const AdminList = ({ admins }: AdminListProps) => {
  const getRoleIcon = (role: string) => {
    if (role === 'super_admin') {
      return <Shield className="h-4 w-4 text-destructive" />;
    }
    return <UserCog className="h-4 w-4 text-primary" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin List</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Added On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getRoleIcon(admin.role)}
                    <Badge variant={admin.role === 'super_admin' ? "destructive" : "default"}>
                      {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>
                  {new Date(admin.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {admins.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No admins found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminList;