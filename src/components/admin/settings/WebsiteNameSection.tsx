import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateSettings } from "@/services/settingsService";

interface WebsiteNameSectionProps {
  initialName: string;
  refetch: () => Promise<any>;
}

export const WebsiteNameSection = ({ initialName, refetch }: WebsiteNameSectionProps) => {
  const { toast } = useToast();
  const [websiteName, setWebsiteName] = useState(initialName);

  useEffect(() => {
    setWebsiteName(initialName);
  }, [initialName]);

  const handleWebsiteNameUpdate = async () => {
    try {
      await updateSettings({ website_name: websiteName });
      await refetch();
      // Dispatch event to update title
      window.dispatchEvent(new Event('settingsUpdated'));
      toast({
        title: "Success",
        description: "Website name updated successfully",
      });
    } catch (error) {
      console.error('Error updating website name:', error);
      toast({
        title: "Error",
        description: "Failed to update website name",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="websiteName">Website Name</Label>
      <div className="flex gap-2">
        <Input
          id="websiteName"
          value={websiteName}
          onChange={(e) => setWebsiteName(e.target.value)}
          placeholder="Enter website name"
        />
        <Button onClick={handleWebsiteNameUpdate}>Save</Button>
      </div>
    </div>
  );
};