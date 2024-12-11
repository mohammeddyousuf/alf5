import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { SocialMediaLinkInput } from "./SocialMediaLinkInput";
import type { SocialMediaLink } from "@/integrations/supabase/types/social";

interface SocialMediaLinksSectionProps {
  links: SocialMediaLink[];
  onUpdate: (links: SocialMediaLink[]) => void;
  isUpdating: boolean;
}

export const SocialMediaLinksSection = ({
  links: initialLinks,
  onUpdate,
  isUpdating,
}: SocialMediaLinksSectionProps) => {
  const [localLinks, setLocalLinks] = useState<SocialMediaLink[]>(initialLinks);

  const addSocialMediaLink = () => {
    setLocalLinks([...localLinks, { name: "", url: "" }]);
  };

  const removeSocialMediaLink = (index: number) => {
    setLocalLinks(localLinks.filter((_, i) => i !== index));
  };

  const updateSocialMediaLink = (
    index: number,
    field: keyof SocialMediaLink,
    value: string
  ) => {
    const updatedLinks = [...localLinks];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setLocalLinks(updatedLinks);
  };

  const handleSave = () => {
    onUpdate(localLinks);
  };

  return (
    <div className="space-y-4">
      {localLinks.map((link, index) => (
        <SocialMediaLinkInput
          key={index}
          link={link}
          index={index}
          onUpdate={updateSocialMediaLink}
          onRemove={removeSocialMediaLink}
        />
      ))}
      <Button variant="outline" onClick={addSocialMediaLink} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add Social Media Link
      </Button>
      <Button onClick={handleSave} disabled={isUpdating}>
        {isUpdating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          'Save Social Media Links'
        )}
      </Button>
    </div>
  );
};