// Currency conversion utilities
export const CURRENCIES = {
  GBP: { symbol: "£", name: "British Pound" },
  NGN: { symbol: "₦", name: "Nigerian Naira" },
};

export const formatPrice = (price, currency = "GBP", exchangeRate = 1850) => {
  const safeCurrency = currency === "NGN" ? "NGN" : "GBP";
  const numericPrice = Number(price) || 0;
  const convertedPrice = safeCurrency === "NGN" ? numericPrice * exchangeRate : numericPrice;

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: safeCurrency,
    currencyDisplay: "symbol",
  }).format(convertedPrice);
};

// Fetch live exchange rates
export const fetchExchangeRate = async () => {
  try {
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/GBP");
    const data = await response.json();
    return data.rates.NGN || 1850;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return 1850;
  }
};
