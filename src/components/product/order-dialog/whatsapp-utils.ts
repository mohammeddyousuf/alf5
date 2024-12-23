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

export const createWhatsAppUrl = (message: string, customNumber?: string) => {
  if (!message) {
    console.error('No message provided for WhatsApp URL creation');
    return '';
  }

  if (!customNumber) {
    console.error('No WhatsApp number provided');
    return '';
  }
  
  const phoneNumber = customNumber.replace(/[^0-9]/g, '');
  
  try {
    // Use the official WhatsApp Click to Chat API format
    const encodedMessage = encodeURIComponent(message);
    const url = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}&type=phone_number&app_absent=0`;
    
    console.log('WhatsApp URL parameters:', {
      phone: phoneNumber,
      text: message,
      rawMessage: message
    });
    
    console.log('Final WhatsApp URL:', url);
    return url;
  } catch (error) {
    console.error('Error creating WhatsApp URL:', error);
    return '';
  }
};