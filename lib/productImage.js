// lib/productImage.js
// Provides high-resolution live product images with intelligent fallback to luxury campaign mannequin photography

export function getRealisticFallback(product) {
  const text = `${product?.name || ""} ${product?.slug || ""} ${product?.category?.name || ""} ${product?.category?.slug || ""} ${(product?.textures || []).join(" ")}`.toLowerCase();

  if (text.includes("prestretch") || text.includes("extension") || text.includes("braid")) {
    return "/images/category-prestretched-extensions.png";
  }
  if (text.includes("french")) {
    return "/images/category-french-curls.png";
  }
  if (text.includes("bulk")) {
    return "/images/category-afro-kinky-bulk.png";
  }
  if (text.includes("twist")) {
    return "/images/category-afro-kinky-twist.png";
  }
  if (text.includes("curly") || text.includes("curl") || text.includes("bounce")) {
    return "/images/category-curly-bundles.png";
  }
  return "/images/category-body-wave.png";
}

export function getProductImage(product) {
  if (!product) return "/images/category-body-wave.png";

  const media = Array.isArray(product.images) ? product.images : [];
  const normalized = media
    .map((item) => (typeof item === "string" ? { image_url: item } : item))
    .filter((item) => item?.image_url && !item.is_video);

  const primary =
    normalized.find((item) => item.is_primary)?.image_url ||
    normalized[0]?.image_url ||
    product.image_url;

  if (primary && typeof primary === "string" && !primary.includes("placeholder") && !primary.includes("unsplash.com/photo-1605980776566")) {
    return primary;
  }

  return getRealisticFallback(product);
}

