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

  console.log("Generating WhatsApp URL with number:", customNumber);
  
  if (!customNumber) {
    console.error('No WhatsApp number provided');
    return '';
  }
  
  // Clean the phone number by removing any non-digit characters and + symbol
  const phoneNumber = customNumber.replace(/[^0-9]/g, '');
  
  if (!phoneNumber) {
    console.error('Invalid WhatsApp number after cleaning');
    return '';
  }
  
  try {
    const message = generateWhatsAppMessage(data);
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    console.log("Generated WhatsApp URL:", url);
    return url;
  } catch (error) {
    console.error('Error generating WhatsApp URL:', error);
    return '';
  }
}