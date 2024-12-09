export const NewsTickerBanner = () => {
  // This will be replaced with admin-controlled content
  const announcement = "🔥 Special Sale: 20% off on all items! Limited time offer";
  
  return (
    <div className="bg-whatsapp-primary text-white py-2 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap">
        {announcement}
      </div>
    </div>
  );
};