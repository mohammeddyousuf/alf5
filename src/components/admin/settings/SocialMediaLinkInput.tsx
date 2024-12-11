import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { SocialMediaLink } from "@/integrations/supabase/types/social";

interface SocialMediaLinkInputProps {
  link: SocialMediaLink;
  index: number;
  onUpdate: (index: number, field: keyof SocialMediaLink, value: string) => void;
  onRemove: (index: number) => void;
}

export const SocialMediaLinkInput = ({
  link,
  index,
  onUpdate,
  onRemove,
}: SocialMediaLinkInputProps) => {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex-1 space-y-2">
        <Label>Platform Name</Label>
        <Input
          value={link.name}
          onChange={(e) => onUpdate(index, "name", e.target.value)}
          placeholder="Enter platform name"
        />
      </div>
      <div className="flex-1 space-y-2">
        <Label>URL</Label>
        <Input
          value={link.url}
          onChange={(e) => onUpdate(index, "url", e.target.value)}
          placeholder="Enter URL"
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="mt-8"
        onClick={() => onRemove(index)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};