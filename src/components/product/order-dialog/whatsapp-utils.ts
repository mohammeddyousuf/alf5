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
  console.log("Comments value:", data.comments);

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
    `Comments: ${data.comments || "N/A"}`,
    "",
    "Please reply back."
  ];

  const finalMessage = messageLines.join('\n');
  console.log("Final constructed message:", finalMessage);
  return finalMessage;
};

export const createWhatsAppUrl = (message: string) => {
  const phoneNumber = "919900981857"; // Removed the + sign
  const baseUrl = 'https://api.whatsapp.com/send';
  
  const params = new URLSearchParams();
  params.append('phone', phoneNumber);
  params.append('text', message);
  
  const url = `${baseUrl}?${params.toString()}`;
  console.log('WhatsApp URL parameters:', {
    phone: phoneNumber,
    text: message
  });
  console.log('Final WhatsApp URL:', url);
  return url;
};