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

  // Ensure comments is never undefined
  const comments = data.comments || "N/A";

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
    `Comments: ${comments}`,
    "",
    "Please reply back."
  ];

  const finalMessage = messageLines.join('\n');
  console.log("Final constructed message:", finalMessage);
  return finalMessage;
};

export const createWhatsAppUrl = (message: string) => {
  const phoneNumber = "919900981857"; // Without the + sign
  const baseUrl = 'https://api.whatsapp.com/send';
  
  // Create URL without any additional parameters
  const url = `${baseUrl}?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
  
  console.log('WhatsApp URL parameters:', {
    phone: phoneNumber,
    text: message,
    rawMessage: message
  });
  console.log('Final WhatsApp URL:', url);
  
  return url;
};