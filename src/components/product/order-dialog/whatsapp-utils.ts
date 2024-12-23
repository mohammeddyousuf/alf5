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

  if (!customNumber) {
    console.error('No WhatsApp number provided');
    return '';
  }
  
  const phoneNumber = customNumber.replace(/[^0-9]/g, '');
  
  try {
    // Use the official WhatsApp Click to Chat API format
    const message = generateWhatsAppMessage(data);
    return `https://wa.me/${phoneNumber}?text=${message}`;
  } catch (error) {
    console.error('Error generating WhatsApp URL:', error);
    return '';
  }
}