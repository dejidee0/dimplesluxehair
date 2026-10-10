// src/components/admin/products/hooks/useProductFilters.js
import { useState, useMemo, useCallback } from "react";
import { filterProducts, sortProducts } from "../utils/productHelpers";

export const useProductFilters = (products = []) => {
  const [filters, setFilters] = useState({
    searchTerm: "",
    selectedCategory: "all",
    status: "all",
    showLowStock: false,
    showFeatured: undefined,
    priceRange: { min: "", max: "" },
    sortBy: "newest",
    viewMode: "grid",
  });

  // Update individual filter
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Update multiple filters at once
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({
      searchTerm: "",
      selectedCategory: "all",
      status: "all",
      showLowStock: false,
      showFeatured: undefined,
      priceRange: { min: "", max: "" },
      sortBy: "newest",
      viewMode: "grid",
    });
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, searchTerm: "" }));
  }, []);

  // Toggle view mode
  const toggleViewMode = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      viewMode: prev.viewMode === "grid" ? "list" : "grid",
    }));
  }, []);

  // Get filtered and sorted products
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = filterProducts(products, filters);
    return sortProducts(filtered, filters.sortBy);
  }, [products, filters]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchTerm !== "" ||
      filters.selectedCategory !== "all" ||
      filters.status !== "all" ||
      filters.showLowStock ||
      filters.showFeatured !== undefined ||
      filters.priceRange.min !== "" ||
      filters.priceRange.max !== ""
    );
  }, [filters]);

  // Get filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.searchTerm !== "") count++;
    if (filters.selectedCategory !== "all") count++;
    if (filters.status !== "all") count++;
    if (filters.showLowStock) count++;
    if (filters.showFeatured !== undefined) count++;
    if (filters.priceRange.min !== "" || filters.priceRange.max !== "") count++;
    return count;
  }, [filters]);

  // Get products count
  const productsCount = useMemo(
    () => ({
      total: products.length,
      filtered: filteredAndSortedProducts.length,
    }),
    [products.length, filteredAndSortedProducts.length]
  );

  return {
    filters,
    filteredAndSortedProducts,
    hasActiveFilters,
    activeFiltersCount,
    productsCount,

    // Actions
    updateFilter,
    updateFilters,
    resetFilters,
    clearSearch,
    toggleViewMode,
  };
};
