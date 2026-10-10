// WhatsApp integration utilities
export const generateWhatsAppLink = (orderDetails) => {
  const phoneNumber = "+447123456789"; // Replace with actual WhatsApp business number

  const message = `Hello Dimplesluxe! 

I've just completed an order and would like to confirm delivery details:

*Order Information:*
Order Number: ${orderDetails.orderNumber}
Customer Name: ${orderDetails.customerName}
Email: ${orderDetails.customerEmail}
Phone: ${orderDetails.customerPhone}

*Delivery Address:*
${orderDetails.address}
${orderDetails.city}, ${orderDetails.postcode}
${orderDetails.country}

*Order Summary:*
${orderDetails.items
  .map((item) => `• ${item.name} (Qty: ${item.quantity}) - ${item.price}`)
  .join("\n")}

Total: ${orderDetails.total}
Payment Method: ${orderDetails.paymentMethod}

Please confirm delivery timeline. Thank you! ✨`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};

export const redirectToWhatsApp = (orderDetails) => {
  const whatsappLink = generateWhatsAppLink(orderDetails);
  window.open(whatsappLink, "_blank");
};
