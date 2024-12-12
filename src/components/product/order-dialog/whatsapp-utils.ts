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

  return messageLines.join('\n');
};

export const createWhatsAppUrl = (messageLines: string) => {
  const phoneNumber = "+919900981857";
  const baseUrl = 'https://api.whatsapp.com/send';
  
  // First encode the message with basic encoding
  const encodedText = encodeURIComponent(messageLines);
  
  // Construct URL with minimal components
  return `${baseUrl}?phone=${phoneNumber}&text=${encodedText}`;
};