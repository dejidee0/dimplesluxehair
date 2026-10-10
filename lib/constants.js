// src/components/admin/products/utils/constants.js

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "name", label: "Name A-Z" },
  { value: "price-high", label: "Price High-Low" },
  { value: "price-low", label: "Price Low-High" },
  { value: "stock-high", label: "Stock High-Low" },
  { value: "stock-low", label: "Stock Low-High" },
];

export const VIEW_MODES = {
  GRID: "grid",
  LIST: "list",
};

export const STOCK_THRESHOLDS = {
  OUT_OF_STOCK: 0,
  CRITICAL: 5,
  LOW: 10,
  MEDIUM: 20,
};

export const STOCK_STATUS = {
  OUT_OF_STOCK: {
    color: "bg-red-400",
    text: "Out of Stock",
    textColor: "text-red-700",
  },
  CRITICAL: {
    color: "bg-red-400",
    text: "Critical",
    textColor: "text-red-700",
  },
  LOW: {
    color: "bg-yellow-400",
    text: "Low",
    textColor: "text-yellow-700",
  },
  MEDIUM: {
    color: "bg-blue-400",
    text: "Medium",
    textColor: "text-blue-700",
  },
  GOOD: {
    color: "bg-green-400",
    text: "Good",
    textColor: "text-green-700",
  },
};

export const IMAGE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  BUCKET_NAME: "public-images",
  FOLDER_PATH: "product-images",
};

export const FORM_INITIAL_STATE = {
  name: "",
  slug: "",
  description: "",
  short_description: "",
  price: "",
  original_price: "",
  category_id: "",
  subcategory_id: "",
  stock: "",
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
  image_url: "",
};
