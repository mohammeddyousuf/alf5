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
  
  // Clean the phone number by removing any non-digit characters
  const phoneNumber = customNumber ? customNumber.replace(/[^0-9]/g, '') : '';
  
  if (!phoneNumber) {
    console.error('No WhatsApp number provided');
    return '';
  }
  
  try {
    // Use the official WhatsApp Click to Chat API format
    const message = generateWhatsAppMessage(data);
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    console.log("Generated WhatsApp URL:", url);
    return url;
  } catch (error) {
    console.error('Error generating WhatsApp URL:', error);
    return '';
  }
}