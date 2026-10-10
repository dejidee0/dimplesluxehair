// src/components/admin/products/utils/productHelpers.js
import { STOCK_LEVELS, FORM_VALIDATION } from "./constants";

/**
 * Generate a slug from a product name
 */
export const generateSlug = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Format price for display
 */
export const formatPrice = (price, currency = "$") => {
  if (!price && price !== 0) return "";
  return `${currency}${Number(price).toFixed(2)}`;
};

/**
 * Calculate discount percentage
 */
export const calculateDiscount = (originalPrice, salePrice) => {
  if (!originalPrice || !salePrice || originalPrice <= salePrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

/**
 * Get stock status based on stock level
 */
export const getStockStatus = (stock) => {
  if (stock <= STOCK_LEVELS.OUT_OF_STOCK) {
    return { status: "out", label: "Out of Stock", color: "red" };
  } else if (stock <= STOCK_LEVELS.LOW_STOCK) {
    return { status: "low", label: "Low Stock", color: "yellow" };
  } else if (stock <= STOCK_LEVELS.MEDIUM_STOCK) {
    return { status: "medium", label: "In Stock", color: "green" };
  } else {
    return { status: "high", label: "Well Stocked", color: "green" };
  }
};

/**
 * Validate product form data
 */
export const validateProductForm = (formData) => {
  const errors = {};

  // Required fields validation
  FORM_VALIDATION.REQUIRED_FIELDS.forEach((field) => {
    if (
      !formData[field] ||
      (typeof formData[field] === "string" && !formData[field].trim())
    ) {
      errors[field] = `${field.replace("_", " ")} is required`;
    }
  });

  // Price validation
  if (formData.price) {
    const price = Number(formData.price);
    if (
      isNaN(price) ||
      price < FORM_VALIDATION.MIN_PRICE ||
      price > FORM_VALIDATION.MAX_PRICE
    ) {
      errors.price = `Price must be between ${FORM_VALIDATION.MIN_PRICE} and ${FORM_VALIDATION.MAX_PRICE}`;
    }
  }

  // Stock validation
  if (formData.stock) {
    const stock = Number(formData.stock);
    if (
      isNaN(stock) ||
      stock < FORM_VALIDATION.MIN_STOCK ||
      stock > FORM_VALIDATION.MAX_STOCK
    ) {
      errors.stock = `Stock must be between ${FORM_VALIDATION.MIN_STOCK} and ${FORM_VALIDATION.MAX_STOCK}`;
    }
  }

  // Name length validation
  if (formData.name && formData.name.length > FORM_VALIDATION.MAX_NAME_LENGTH) {
    errors.name = `Name must be ${FORM_VALIDATION.MAX_NAME_LENGTH} characters or less`;
  }

  // Description length validation
  if (
    formData.description &&
    formData.description.length > FORM_VALIDATION.MAX_DESCRIPTION_LENGTH
  ) {
    errors.description = `Description must be ${FORM_VALIDATION.MAX_DESCRIPTION_LENGTH} characters or less`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Filter products based on criteria
 */
export const filterProducts = (products, filters) => {
  return products.filter((product) => {
    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.short_description.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Category filter
    if (filters.selectedCategory && filters.selectedCategory !== "all") {
      if (product.category_id !== filters.selectedCategory) return false;
    }

    // Stock filter
    if (filters.showLowStock) {
      if (product.stock >= STOCK_LEVELS.LOW_STOCK) return false;
    }

    // Status filter
    if (filters.status && filters.status !== "all") {
      if (filters.status === "active" && !product.is_active) return false;
      if (filters.status === "inactive" && product.is_active) return false;
    }

    // Featured filter
    if (filters.showFeatured !== undefined) {
      if (product.is_featured !== filters.showFeatured) return false;
    }

    // Price range filter
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      if (min && product.price < min) return false;
      if (max && product.price > max) return false;
    }

    return true;
  });
};

/**
 * Sort products based on criteria
 */
export const sortProducts = (products, sortBy) => {
  return [...products].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_at) - new Date(a.created_at);
      case "oldest":
        return new Date(a.created_at) - new Date(b.created_at);
      case "name":
        return a.name.localeCompare(b.name);
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "stock":
        return b.stock - a.stock;
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });
};

/**
 * Create a new product template with default values
 */
export const createProductTemplate = (overrides = {}) => {
  return {
    name: "",
    slug: "",
    description: "",
    short_description: "",
    price: 0,
    original_price: null,
    category_id: "",
    subcategory_id: "",
    stock: 0,
    lengths: [],
    colors: [],
    textures: [],
    weight: "",
    origin_country: "Brazil",
    is_featured: false,
    is_new: false,
    is_sale: false,
    is_active: true,
    meta_title: "",
    meta_description: "",
    images: [],
    ...overrides,
  };
};

/**
 * Get product statistics
 */
export const getProductStats = (products) => {
  const total = products.length;
  const active = products.filter((p) => p.is_active).length;
  const lowStock = products.filter(
    (p) => p.stock <= STOCK_LEVELS.LOW_STOCK
  ).length;
  const outOfStock = products.filter(
    (p) => p.stock <= STOCK_LEVELS.OUT_OF_STOCK
  ).length;
  const featured = products.filter((p) => p.is_featured).length;
  const onSale = products.filter((p) => p.is_sale).length;

  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const averagePrice =
    total > 0 ? products.reduce((sum, p) => sum + p.price, 0) / total : 0;

  return {
    total,
    active,
    inactive: total - active,
    lowStock,
    outOfStock,
    featured,
    onSale,
    totalValue,
    averagePrice,
  };
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

/**
 * Format date for display
 */
export const formatDate = (date, format = "short") => {
  if (!date) return "";

  const d = new Date(date);

  if (format === "short") {
    return d.toLocaleDateString();
  } else if (format === "long") {
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } else if (format === "relative") {
    const now = new Date();
    const diffTime = Math.abs(now - d);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays <= 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  }

  return d.toLocaleDateString();
};
