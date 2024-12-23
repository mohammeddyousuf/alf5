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
  
  // Using template literals to preserve line breaks
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

  const baseUrl = 'https://api.whatsapp.com/send';
  const defaultNumber = '+919900981857';
  const phoneNumber = (customNumber || defaultNumber).replace(/[^0-9+]/g, '');
  
  try {
    // Create URL with properly encoded parameters
    const url = new URL(baseUrl);
    
    // Remove the '+' before adding to URL params
    url.searchParams.append('phone', phoneNumber.replace('+', ''));
    
    // Properly encode the message while preserving special characters
    const encodedText = encodeURIComponent(message)
      .replace(/\*/g, '%2A')  // Preserve asterisks for bold text
      .replace(/\n/g, '%0A')  // Preserve line breaks
      .replace(/\r/g, '%0D')  // Handle carriage returns
      .replace(/'/g, '%27')   // Handle single quotes
      .replace(/"/g, '%22');  // Handle double quotes
    
    url.searchParams.append('text', encodedText);
    url.searchParams.append('type', 'phone_number');
    url.searchParams.append('app_absent', '0');
    
    console.log('WhatsApp URL parameters:', {
      phone: phoneNumber,
      text: message,
      rawMessage: message
    });
    
    const finalUrl = url.toString();
    console.log('Final WhatsApp URL:', finalUrl);
    
    return finalUrl;
  } catch (error) {
    console.error('Error creating WhatsApp URL:', error);
    return '';
  }
};