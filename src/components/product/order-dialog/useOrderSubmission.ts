import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { OrderFormData, ExtendedOrderFormData } from "./types";
import { constructWhatsAppMessage, createWhatsAppUrl } from "./whatsapp-utils";

interface UseOrderSubmissionProps {
  productId: string;
  productName: string;
  productBrand: string | null;
  productPrice: number;
  onSubmit: (data: ExtendedOrderFormData) => void;
}

export const useOrderSubmission = ({
  productId,
  productName,
  productBrand,
  productPrice,
  onSubmit,
}: UseOrderSubmissionProps) => {
  const { toast } = useToast();
  const [ipAddress, setIpAddress] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [websiteName, setWebsiteName] = useState("ALFragrance");

  useEffect(() => {
    const fetchLocationAndIP = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.error) {
          console.error('Error fetching location:', data.error);
          return;
        }

        const locationStr = `${data.city}${data.region ? `, ${data.region}` : ''}, ${data.country_name}`;
        setLocation(locationStr);
        setIpAddress(data.ip);
      } catch (error) {
        console.error('Failed to fetch location:', error);
      }
    };

    fetchLocationAndIP();
  }, []);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (data: OrderFormData) => {
    try {
      console.log("Form Data:", data);
      
      const messageData = {
        websiteName,
        productName,
        productBrand,
        productPrice: formatPrice(productPrice),
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        address: data.address || "",
        comments: data.comments || "",
        paymentMode: data.paymentMode || "bank_transfer"
      };
      
      console.log("Message Data:", messageData);
      
      const whatsappMessage = constructWhatsAppMessage(messageData);
      console.log("WhatsApp Message:", whatsappMessage);
      
      const { error } = await supabase
        .from("orders")
        .insert({
          product_id: productId,
          product_name: productName,
          product_brand: productBrand,
          product_price: productPrice,
          customer_name: data.name,
          customer_email: data.email,
          customer_mobile: data.mobile,
          customer_address: data.address || "",
          payment_mode: data.paymentMode || "bank_transfer",
          message: data.comments || "",
          location: location || "",
          ip_address: ipAddress || "",
          source: window.location.href || "",
        })
        .single();

      if (error) {
        console.error("Error saving order:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save order. Please try again.",
        });
        return;
      }

      console.log("Order saved successfully");
      
      onSubmit({
        ...data,
        productName,
        productBrand,
        productPrice: formatPrice(productPrice)
      });
      
      const whatsappUrl = createWhatsAppUrl(whatsappMessage);
      window.open(whatsappUrl, '_blank');
      
      toast({
        title: "Order Saved",
        description: "Your order has been saved successfully",
      });
    } catch (error) {
      console.error("Failed to save order:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save order. Please try again.",
      });
    }
  };

  return { handleSubmit };
};