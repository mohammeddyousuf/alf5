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
    `Payment Mode: ${data.paymentMode}`,
    `Message: ${data.message || "N/A"}`,
    "",
    "Please reply back."
  ];

  return messageLines.join('\n');
};

export const createWhatsAppUrl = (message: string) => {
  const phoneNumber = "+919900981857";
  const baseUrl = 'https://api.whatsapp.com/send';
  const encodedMessage = encodeURIComponent(message);
  
  const params = new URLSearchParams({
    phone: phoneNumber,
    text: encodedMessage,
    type: 'phone_number',
    app_absent: '0'
  });
  
  return `${baseUrl}/?${params.toString()}`;
};