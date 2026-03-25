import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateSettings } from "@/services/settingsService";

interface DefaultPriceNoteSectionProps {
  initialNote: string;
  refetch: () => Promise<any>;
}

export const DefaultPriceNoteSection = ({ initialNote, refetch }: DefaultPriceNoteSectionProps) => {
  const { toast } = useToast();
  const [priceNote, setPriceNote] = useState(initialNote);

  const handleUpdate = async () => {
    try {
      await updateSettings({ default_price_note: priceNote });
      await refetch();
      toast({
        title: "Success",
        description: "Default price note updated successfully",
      });
    } catch (error) {
      console.error('Error updating default price note:', error);
      toast({
        title: "Error",
        description: "Failed to update default price note",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="defaultPriceNote">Default Price Note</Label>
      <p className="text-sm text-muted-foreground">
        This note appears below prices on all products. Can be overridden per product.
      </p>
      <Input
        id="defaultPriceNote"
        value={priceNote}
        onChange={(e) => setPriceNote(e.target.value)}
        placeholder="e.g. Price fluctuates. Please contact for latest price."
      />
      <Button onClick={handleUpdate} className="w-full">
        Save Default Price Note
      </Button>
    </div>
  );
};
