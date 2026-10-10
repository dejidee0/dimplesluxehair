"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(query);
  const [filters, setFilters] = useState({
    category: "",
    minPrice: 0,
    maxPrice: 1000,
    sortBy: "name",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
    fetchCategories();
  }, [query]);

  useEffect(() => {
    if (searchTerm && searchTerm !== query) {
      fetchSuggestions(searchTerm);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm]);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSuggestions = async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.length < 2) return;

    try {
      const { data } = await supabase
        .from("products")
        .select("id, name, price")
        .eq("is_active", true)
        .ilike("name", `%${searchQuery}%`)
        .limit(5);

      setSuggestions(data || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);

      let supabaseQuery = supabase
        .from("products")
        .select(
          `
          *,
          category:categories!products_category_id_fkey(name, slug),
          product_images(image_url, alt_text, is_primary)
        `
        )
        .eq("is_active", true);

      // Search in name, description, and category
      supabaseQuery = supabaseQuery.or(
        `name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,short_description.ilike.%${searchQuery}%`
      );

      // Apply filters
      if (filters.category) {
        supabaseQuery = supabaseQuery.eq("category_id", filters.category);
      }
      if (filters.minPrice > 0) {
        supabaseQuery = supabaseQuery.gte("price", filters.minPrice);
      }
      if (filters.maxPrice < 1000) {
        supabaseQuery = supabaseQuery.lte("price", filters.maxPrice);
      }

      // Sorting
      switch (filters.sortBy) {
        case "price_low":
          supabaseQuery = supabaseQuery.order("price", { ascending: true });
          break;
        case "price_high":
          supabaseQuery = supabaseQuery.order("price", { ascending: false });
          break;
        case "rating":
          supabaseQuery = supabaseQuery.order("rating", { ascending: false });
          break;
        case "newest":
          supabaseQuery = supabaseQuery.order("created_at", {
            ascending: false,
          });
          break;
        default:
          supabaseQuery = supabaseQuery.order("name");
      }

      const { data, error } = await supabaseQuery;

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.name);
    router.push(`/search?q=${encodeURIComponent(suggestion.name)}`);
    setShowSuggestions(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (query) {
      performSearch(query);
    }
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      minPrice: 0,
      maxPrice: 1000,
      sortBy: "name",
    });
    if (query) {
      performSearch(query);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Search Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Search Results
          </h1>
          {query && (
            <p className="text-gray-600 text-base sm:text-lg">
              {loading
                ? "Searching..."
                : `${products.length} results found for "${query}"`}
            </p>
          )}
        </div>

        {/* Enhanced Search Bar */}
        <div className="mb-6 sm:mb-8">
          <form onSubmit={handleSearch} className="max-w-2xl relative">
            <div className="relative">
              <Search className="absolute left-4 top-4 w-5 sm:w-6 sm:h-6 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() =>
                  suggestions.length > 0 && setShowSuggestions(true)
                }
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search for premium hair products..."
                className="w-full pl-12 sm:pl-14 pr-4 py-3 sm:py-4 text-base sm:text-lg border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bg-primary-500 text-white px-4 sm:px-6 py-2 rounded-xl hover:bg-primary-600 transition-colors text-sm sm:text-base"
              >
                Search
              </button>
            </div>

            {/* Search Suggestions */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-2 z-50"
                >
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
                    >
                      <div className="font-medium text-gray-900 text-sm sm:text-base">
                        {suggestion.name}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        £{suggestion.price}
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md w-full sm:w-auto justify-center sm:justify-start"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {(showFilters || true) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`lg:w-80 ${
                  showFilters ? "block" : "hidden lg:block"
                }`}
              >
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 sticky top-32">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-lg sm:text-xl">
                      Filters
                    </h3>
                    <button
                      onClick={clearFilters}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Clear All
                    </button>
                  </div>

                  {/* Categories */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Categories
                    </h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          checked={filters.category === ""}
                          onChange={() => handleFilterChange("category", "")}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-gray-700 text-sm sm:text-base">
                          All Categories
                        </span>
                      </label>
                      {categories
                        .filter((cat) => !cat.parent_id)
                        .map((category) => (
                          <label
                            key={category.id}
                            className="flex items-center"
                          >
                            <input
                              type="radio"
                              name="category"
                              checked={filters.category === category.id}
                              onChange={() =>
                                handleFilterChange("category", category.id)
                              }
                              className="text-primary-600 focus:ring-primary-500"
                            />
                            <span className="ml-2 text-gray-700 text-sm sm:text-base">
                              {category.name}
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Price Range
                    </h4>
                    <div className="space-y-2">
                      {[
                        { label: "Under £50", min: 0, max: 50 },
                        { label: "£50 - £100", min: 50, max: 100 },
                        { label: "£100 - £200", min: 100, max: 200 },
                        { label: "Over £200", min: 200, max: 1000 },
                      ].map((range, index) => (
                        <label key={index} className="flex items-center">
                          <input
                            type="radio"
                            name="priceRange"
                            checked={
                              filters.minPrice === range.min &&
                              filters.maxPrice === range.max
                            }
                            onChange={() => {
                              handleFilterChange("minPrice", range.min);
                              handleFilterChange("maxPrice", range.max);
                            }}
                            className="text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-gray-700 text-sm sm:text-base">
                            {range.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sort By */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Sort By</h4>
                    <select
                      value={filters.sortBy}
                      onChange={(e) =>
                        handleFilterChange("sortBy", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
                    >
                      <option value="name">Name A-Z</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="newest">Newest First</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-4 shadow-lg animate-pulse"
                  >
                    <div className="h-48 sm:h-64 lg:h-80 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      ...product,
                      images:
                        product.product_images?.map((img) => img.image_url) ||
                        [],
                    }}
                  />
                ))}
              </div>
            ) : query ? (
              <div className="text-center py-16">
                <div className="text-6xl sm:text-8xl mb-4">🔍</div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  We couldn't find any products matching "{query}". Try
                  different keywords or browse our categories.
                </p>
                <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setProducts([]);
                      router.push("/search");
                    }}
                    className="btn-secondary"
                  >
                    Clear Search
                  </button>
                  <button
                    onClick={() => router.push("/products")}
                    className="btn-primary"
                  >
                    Browse All Products
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl sm:text-8xl mb-4">🔍</div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                  Start Your Search
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Enter keywords above to find the perfect hair products for you
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
