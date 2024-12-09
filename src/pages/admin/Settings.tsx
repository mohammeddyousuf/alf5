import { WebsiteSettings } from "@/components/admin/WebsiteSettings";
import { WhatsAppSettings } from "@/components/admin/WhatsAppSettings";

const Settings = () => {
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WhatsAppSettings />
        <WebsiteSettings />
      </div>
    </div>
  );
};

export default Settings;