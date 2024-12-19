import { useState } from "react";
import { WebsiteNameSection } from "./WebsiteNameSection";
import { TrackingCodesSection } from "./TrackingCodesSection";
import { ImageSection } from "./ImageSection";

interface GeneralSettingsProps {
  settings: any;
  refetch: () => Promise<any>;
}

export const GeneralSettings = ({ settings, refetch }: GeneralSettingsProps) => {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="space-y-6">
      <WebsiteNameSection 
        initialName={settings?.website_name || ""} 
        refetch={refetch} 
      />

      <ImageSection
        logoUrl={settings?.logo_url}
        faviconUrl={settings?.favicon_url}
        refetch={refetch}
        isUploading={isUploading}
        setIsUploading={setIsUploading}
      />

      <TrackingCodesSection
        initialCodes={settings?.tracking_codes || ""}
        refetch={refetch}
      />
    </div>
  );
};