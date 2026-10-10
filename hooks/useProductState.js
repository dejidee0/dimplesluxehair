// hooks/useProductsState.js
import { useState, useEffect, useCallback } from "react";

export const useProductsState = (initialProducts = []) => {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [showLowStock, setShowLowStock] = useState(false);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category_id === selectedCategory;
      const matchesStock = !showLowStock || (product.stock || 0) < 10;
      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case "oldest":
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "stock-high":
          return (b.stock || 0) - (a.stock || 0);
        case "stock-low":
          return (a.stock || 0) - (b.stock || 0);
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        default:
          return 0;
      }
    });

  const productStats = {
    total: products.length,
    active: products.filter((p) => p.is_active !== false).length,
    inactive: products.filter((p) => p.is_active === false).length,
    lowStock: products.filter((p) => (p.stock || 0) < 10).length,
    outOfStock: products.filter((p) => (p.stock || 0) === 0).length,
  };

  return {
    products,
    setProducts,
    filteredProducts,
    productStats,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    showLowStock,
    setShowLowStock,
  };
};
