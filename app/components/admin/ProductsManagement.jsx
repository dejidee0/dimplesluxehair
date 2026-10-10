// components/products/ProductsManagement.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Package, Plus } from "lucide-react";
import { useProductsState } from "../../../hooks/useProductState";
import { useProductForm } from "../../../hooks/useProductForm";
import ProductStats from "../admin/products/ProductStats";
import ProductFilters from "../admin/products/ProductFilters";
import ProductCard from "../admin/products/ProductCard";
import ProductModal from "../admin/products/ProductModal";
import ProductForm from "../admin/products/ProductForm";
import ProductViewModal from "../admin/products/ProductViewModal";
import ProductDeleteModal from "../admin/products/ProductDeleteModal";
import { formatPrice } from "../../../lib/productUtils";

const ProductsManagement = ({
  loading = false,
  products: initialProducts = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  categories = [],
  supabase,
}) => {
  const {
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
  } = useProductsState(initialProducts);

  const productForm = useProductForm(
    onAddProduct,
    onUpdateProduct,
    onDeleteProduct,
    supabase
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleView = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    productForm.populateForm(product);
    setShowEditModal(true);
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleAddClick = () => {
    productForm.resetForm();
    setShowAddModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setShowDeleteModal(false);
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <ProductStats stats={productStats} />

      <ProductFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showLowStock={showLowStock}
        setShowLowStock={setShowLowStock}
        categories={categories}
        onAddProduct={handleAddClick}
      />

      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory !== "all" || showLowStock
              ? "Try adjusting your search or filters"
              : "Start by adding your first product to get started"}
          </p>
          {!searchTerm && selectedCategory === "all" && !showLowStock && (
            <button
              onClick={handleAddClick}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2 mx-auto"
              aria-label="Add first product"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Product</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categories={categories}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <ProductTable
              products={filteredProducts}
              categories={categories}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}

          <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-6 py-3 shadow-sm">
            <div className="text-sm text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>
                Total Value:{" "}
                {formatPrice(
                  filteredProducts.reduce(
                    (sum, product) =>
                      sum + (product.price || 0) * (product.stock || 0),
                    0
                  )
                )}
              </span>
              <span>
                Low Stock Items:{" "}
                {filteredProducts.filter((p) => (p.stock || 0) < 10).length}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <ProductModal
        isOpen={showAddModal || showEditModal}
        onClose={closeModals}
        title={selectedProduct ? "Edit Product" : "Add New Product"}
      >
        <ProductForm
          formData={productForm.formData}
          errors={productForm.errors}
          images={productForm.images}
          videos={productForm.videos}
          isSubmitting={productForm.isSubmitting}
          uploadingImages={productForm.uploadingImages}
          uploadingVideos={productForm.uploadingVideos}
          categories={categories}
          onInputChange={productForm.handleInputChange}
          onArrayInputChange={productForm.handleArrayInputChange}
          onMediaChange={productForm.handleMediaChange}
          onRemoveMedia={productForm.handleRemoveMedia}
          onSetPrimaryMedia={productForm.handleSetPrimaryMedia}
          onReorderMedia={productForm.handleReorderMedia}
          onSubmit={(e) =>
            productForm.handleSubmit(
              e,
              selectedProduct,
              setProducts,
              closeModals
            )
          }
          onCancel={closeModals}
          isEditing={!!selectedProduct}
        />
      </ProductModal>

      <ProductViewModal
        isOpen={showViewModal}
        onClose={closeModals}
        product={selectedProduct}
        categories={categories}
        onEdit={() => {
          setShowViewModal(false);
          handleEdit(selectedProduct);
        }}
      />

      <ProductDeleteModal
        isOpen={showDeleteModal}
        onClose={closeModals}
        product={selectedProduct}
        onConfirm={() =>
          productForm.handleDelete(selectedProduct, setProducts, closeModals)
        }
      />
    </motion.div>
  );
};

export default ProductsManagement;
