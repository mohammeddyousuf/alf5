import { ExtendedOrderFormData } from "./types";

export function generateWhatsAppMessage(data: ExtendedOrderFormData): string {
  const message = `Hi ALFragrance,

I would like to order ${data.productName}!

Name: ${data.name}
Mobile: ${data.mobile}
Email: ${data.email}
Address: ${data.address}
Payment Mode: ${data.paymentMode}${data.comments ? `\nComments: ${data.comments}` : ''}`;

  return encodeURIComponent(message);
}

export function generateWhatsAppUrl(data: ExtendedOrderFormData, customNumber?: string | null): string {
  if (!data) {
    console.error('No data provided to generate WhatsApp URL');
    return '';
  }

  console.log("Raw WhatsApp number received:", customNumber);
  
  if (!customNumber) {
    console.error('No WhatsApp number provided');
    return '';
  }

  // First remove any spaces and special characters except +
  let cleanNumber = customNumber.trim().replace(/[^\d+]/g, '');
  
  // Then remove the + if it exists at the start
  cleanNumber = cleanNumber.replace(/^\+/, '');
  
  console.log("Cleaned WhatsApp number:", cleanNumber);
  
  if (!cleanNumber) {
    console.error('Invalid WhatsApp number after cleaning');
    return '';
  }
  
  try {
    const message = generateWhatsAppMessage(data);
    const url = `https://wa.me/${cleanNumber}?text=${message}`;
    console.log("Generated WhatsApp URL:", url);
    return url;
  } catch (error) {
    console.error('Error generating WhatsApp URL:', error);
    return '';
  }
}