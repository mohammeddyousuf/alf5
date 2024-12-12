export const constructWhatsAppMessage = (data: {
  websiteName: string;
  productName: string;
  productBrand: string | null;
  productPrice: string;
  name: string;
  email: string;
  mobile: string;
  address: string;
  message: string;
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
    `Message: ${data.message || "N/A"}`,
    `Payment Mode: ${data.paymentMode}`,
    "",
    "Please reply back."
  ];

  return messageLines.join('\n');
};

export const createWhatsAppUrl = (message: string, phoneNumber?: string) => {
  const baseUrl = 'https://api.whatsapp.com/send';
  const encodedMessage = encodeURIComponent(message);
  const phone = phoneNumber ? encodeURIComponent(phoneNumber) : '';
  
  const params = new URLSearchParams();
  if (phone) {
    params.append('phone', phone);
  }
  params.append('text', encodedMessage);
  
  return `${baseUrl}?${params.toString()}`;
};