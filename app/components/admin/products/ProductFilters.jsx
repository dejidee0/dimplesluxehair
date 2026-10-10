// components/products/ProductFilters.jsx
import React from "react";
import { Search, Grid, List, Plus, AlertTriangle } from "lucide-react";

const ProductFilters = ({
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
  categories,
  onAddProduct,
}) => {
  const categoryOptions = [
    { id: "all", name: "All Categories" },
    ...categories
      .filter((cat) => cat.is_active !== false)
      .map((cat) => ({ id: cat.id, name: cat.name })),
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
              aria-label="Search products"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
            aria-label="Select category"
          >
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
            aria-label="Sort products"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A-Z</option>
            <option value="price-high">Price High-Low</option>
            <option value="price-low">Price Low-High</option>
            <option value="stock-high">Stock High-Low</option>
            <option value="stock-low">Stock Low-High</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLowStock(!showLowStock)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showLowStock
                ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            aria-label={
              showLowStock ? "Show all products" : "Show low stock products"
            }
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Low Stock</span>
          </button>
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded ${
                viewMode === "grid"
                  ? "bg-pink-100 text-pink-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              aria-label="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1 rounded ${
                viewMode === "list"
                  ? "bg-pink-100 text-pink-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={onAddProduct}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            aria-label="Add new product"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
