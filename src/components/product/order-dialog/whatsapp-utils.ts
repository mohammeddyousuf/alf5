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
  
  // Manually construct the URL to avoid double encoding
  const encodedPhone = encodeURIComponent(phoneNumber);
  const encodedText = encodeURIComponent(messageLines)
    .replace(/%20/g, ' ')  // Decode spaces back for readability
    .replace(/%0A/g, '\n') // Decode newlines back
    .replace(/%2A/g, '*')  // Decode asterisks back
    .replace(/%3A/g, ':')  // Decode colons back
    .replace(/%2C/g, ','); // Decode commas back
    
  // Re-encode with proper escaping
  const finalEncodedText = encodeURIComponent(encodedText);
  
  return `${baseUrl}?phone=${encodedPhone}&text=${finalEncodedText}&type=phone_number&app_absent=0`;
};