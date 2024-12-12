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
  const phoneNumber = "919900981857"; // Without the + sign as per WhatsApp API requirements
  const baseUrl = 'https://api.whatsapp.com/send';
  
  // Create a new URLSearchParams object
  const params = new URLSearchParams();
  
  // Add parameters ensuring proper encoding
  params.append('phone', phoneNumber);
  params.append('text', message);
  
  // Construct the final URL
  const url = `${baseUrl}?${params.toString()}`;
  
  // Log the parameters and final URL for debugging
  console.log('WhatsApp URL parameters:', {
    phone: phoneNumber,
    text: message,
    rawMessage: message // Log raw message to verify content
  });
  console.log('Final WhatsApp URL:', url);
  
  return url;
};