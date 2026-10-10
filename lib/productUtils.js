// utils/productUtils.js
export const formatPrice = (price) => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(price || 0);
};

export const getStockStatus = (stock) => {
  if (stock === 0)
    return {
      color: "bg-red-500",
      text: "Out of Stock",
      textColor: "text-red-700",
    };
  if (stock < 5)
    return {
      color: "bg-red-400",
      text: "Critical",
      textColor: "text-red-700",
    };
  if (stock < 10)
    return {
      color: "bg-yellow-400",
      text: "Low",
      textColor: "text-yellow-700",
    };
  if (stock < 20)
    return {
      color: "bg-blue-400",
      text: "Medium",
      textColor: "text-blue-700",
    };
  return {
    color: "bg-green-400",
    text: "Good",
    textColor: "text-green-700",
  };
};
