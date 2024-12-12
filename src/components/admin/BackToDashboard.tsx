import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function BackToDashboard() {
  const navigate = useNavigate();

  return (
    <Button
      variant="outline"
      className="gap-2"
      onClick={() => navigate("/admin")}
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Dashboard
    </Button>
  );
}