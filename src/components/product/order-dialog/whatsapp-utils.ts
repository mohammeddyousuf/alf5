export const constructWhatsAppMessage = (data: {
  websiteName: string;
  productName: string;
  productBrand: string | null;
  productPrice: string;
  name: string;
  email: string;
  mobile: string;
  address: string;
  comments: string;
  paymentMode: string;
}) => {
  console.log("Constructing WhatsApp message with data:", data);
  
  const messageLines = [
    `Hi, ${data.websiteName}`,
    "",
    "*Order Details:*",
    `Product: ${data.productName}`,
    `Brand: ${data.productBrand || "N/A"}`,
    `Price: ${data.productPrice}`,
    "",
    "*Customer Details:*",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Mobile: ${data.mobile}`,
    `Address: ${data.address || "N/A"}`,
    `Payment Mode: ${data.paymentMode}`,
    `Comments: ${data.comments || "N/A"}`
  ];

  const finalMessage = messageLines.join('\n');
  console.log("Final WhatsApp message:", finalMessage);
  return finalMessage;
};

export const createWhatsAppUrl = (message: string) => {
  const baseUrl = 'https://api.whatsapp.com/send/';
  
  const params = new URLSearchParams({
    phone: '+919900981857',
    text: message,
    type: 'phone_number',
    app_absent: '0'
  });
  
  const url = `https://api.whatsapp.com/send/?${params.toString()}`;
  
  console.log('WhatsApp URL parameters:', {
    phone: '+919900981857',
    text: message,
    rawMessage: message
  });
  console.log('Final WhatsApp URL:', url);
  
  return url;
};