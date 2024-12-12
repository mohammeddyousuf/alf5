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
    `*${data.websiteName}*`,
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
  console.log("Final constructed message:", finalMessage);
  return finalMessage;
};

export const createWhatsAppUrl = (message: string) => {
  const phoneNumber = "+919900981857"; // With the + sign
  const baseUrl = 'https://api.whatsapp.com/send/';
  
  const params = new URLSearchParams({
    phone: phoneNumber,
    text: message,
    type: 'phone_number',
    app_absent: '0'
  });
  
  // Change from /send to /send/
  const url = `https://api.whatsapp.com/send/?${params.toString()}`;
  
  console.log('WhatsApp URL parameters:', {
    phone: phoneNumber,
    text: message,
    rawMessage: message
  });
  console.log('Final WhatsApp URL:', url);
  
  return url;
};