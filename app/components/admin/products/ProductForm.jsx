// ProductForm.jsx
import React, { useRef, useEffect } from "react";
import {
  Package,
  DollarSign,
  Tag,
  Globe,
  Save,
  AlertCircle,
} from "lucide-react";
import MultiMediaUpload from "./MultiMediaUpload";
const ProductForm = ({
  formData,
  errors,
  images,
  videos,
  isSubmitting,
  uploadingImages,
  uploadingVideos,
  categories,
  onInputChange,
  onArrayInputChange,
  onMediaChange,
  onRemoveMedia,
  onSetPrimaryMedia,
  onReorderMedia,
  onSubmit,
  onCancel,
  isEditing,
}) => {
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  const activeCategories = categories.filter((cat) => cat.is_active !== false);
  const getSubcategories = (parentId) =>
    activeCategories.filter((cat) => cat.parent_id === parentId);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {errors.general && (
        <div className="bg-red-50 p-4 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <MultiMediaUpload
          images={images}
          videos={videos}
          onMediaChange={onMediaChange}
          onRemoveMedia={onRemoveMedia}
          onSetPrimaryMedia={onSetPrimaryMedia}
          onReorderMedia={onReorderMedia}
          uploadingImages={uploadingImages}
          uploadingVideos={uploadingVideos}
          errors={errors}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-6">
          <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span>Basic Information</span>
          </h4>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Product Name *
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm ${
                errors.name ? "border-red-300" : "border-gray-200"
              }`}
              placeholder="Enter product name"
              ref={firstInputRef}
              aria-required="true"
              aria-invalid={!!errors.name}
              maxLength={100}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              URL Slug
            </label>
            <input
              id="slug"
              type="text"
              name="slug"
              value={formData.slug}
              onChange={onInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm ${
                errors.slug ? "border-red-300" : "border-gray-200"
              }`}
              placeholder="auto-generated-from-name"
              aria-describedby="slug-help"
            />
            {errors.slug && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.slug}</span>
              </p>
            )}
            <p id="slug-help" className="text-xs text-gray-500 mt-1">
              Auto-generated from product name
            </p>
          </div>

          <div>
            <label
              htmlFor="short_description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Short Description
            </label>
            <textarea
              id="short_description"
              name="short_description"
              value={formData.short_description}
              onChange={onInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
              placeholder="Brief product description"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Full Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={onInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
              placeholder="Detailed product description"
            />
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="space-y-6">
          <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span>Pricing & Inventory</span>
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Price *
              </label>
              <input
                id="price"
                type="number"
                name="price"
                value={formData.price}
                onChange={onInputChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm ${
                  errors.price ? "border-red-300" : "border-gray-200"
                }`}
                placeholder="0.00"
                aria-required="true"
                aria-invalid={!!errors.price}
              />
              {errors.price && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.price}</span>
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="original_price"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Original Price
              </label>
              <input
                id="original_price"
                type="number"
                name="original_price"
                value={formData.original_price}
                onChange={onInputChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm ${
                  errors.original_price ? "border-red-300" : "border-gray-200"
                }`}
                placeholder="0.00"
                aria-invalid={!!errors.original_price}
              />
              {errors.original_price && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.original_price}</span>
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="stock"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Stock Quantity *
            </label>
            <input
              id="stock"
              type="number"
              name="stock"
              value={formData.stock}
              onChange={onInputChange}
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm ${
                errors.stock ? "border-red-300" : "border-gray-200"
              }`}
              placeholder="0"
              aria-required="true"
              aria-invalid={!!errors.stock}
            />
            {errors.stock && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.stock}</span>
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="category_id"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Category *
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={onInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm ${
                errors.category_id ? "border-red-300" : "border-gray-200"
              }`}
              aria-required="true"
              aria-invalid={!!errors.category_id}
            >
              <option value="">Select a category</option>
              {activeCategories
                .filter((cat) => !cat.parent_id)
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
            {errors.category_id && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.category_id}</span>
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="subcategory_id"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Subcategory
            </label>
            <select
              id="subcategory_id"
              name="subcategory_id"
              value={formData.subcategory_id}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={!formData.category_id}
            >
              <option value="">Select a subcategory</option>
              {getSubcategories(formData.category_id)
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                .map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
            </select>
            {!formData.category_id && (
              <p className="text-gray-500 text-xs mt-1">
                Select a category first to see subcategories
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Product Attributes and SEO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            <span>Product Attributes</span>
          </h4>

          <div>
            <label
              htmlFor="lengths"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Available Lengths (comma-separated)
            </label>
            <input
              id="lengths"
              type="text"
              value={formData.lengths}
              onChange={(e) => onArrayInputChange("lengths", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
              placeholder="e.g., 10cm, 20cm, 30cm"
            />
          </div>

          <div>
            <label
              htmlFor="colors"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Available Colors (comma-separated)
            </label>
            <input
              id="colors"
              type="text"
              value={formData.colors}
              onChange={(e) => onArrayInputChange("colors", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
              placeholder="e.g., Black, Brown, Blonde"
            />
          </div>

          <div>
            <label
              htmlFor="textures"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Available Textures (comma-separated)
            </label>
            <input
              id="textures"
              type="text"
              value={formData.textures}
              onChange={(e) => onArrayInputChange("textures", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
              placeholder="e.g., Straight, Wavy, Curly"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="weight"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Weight
              </label>
              <input
                id="weight"
                type="text"
                name="weight"
                value={formData.weight}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                placeholder="e.g., 100g"
              />
            </div>

            <div>
              <label
                htmlFor="origin_country"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Origin Country
              </label>
              <input
                id="origin_country"
                type="text"
                name="origin_country"
                value={formData.origin_country}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                placeholder="Brazil"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>SEO & Settings</span>
          </h4>

          <div>
            <label
              htmlFor="meta_title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Meta Title
            </label>
            <input
              id="meta_title"
              type="text"
              name="meta_title"
              value={formData.meta_title}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
              placeholder="SEO title for search engines"
            />
          </div>

          <div>
            <label
              htmlFor="meta_description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Meta Description
            </label>
            <textarea
              id="meta_description"
              name="meta_description"
              value={formData.meta_description}
              onChange={onInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
              placeholder="SEO description for search engines"
            />
          </div>

          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-700">
              Product Status
            </h5>
            {[
              {
                id: "is_active",
                label: "Active (visible to customers)",
                name: "is_active",
              },
              {
                id: "is_featured",
                label: "Featured product",
                name: "is_featured",
              },
              { id: "is_new", label: "New arrival", name: "is_new" },
              { id: "is_sale", label: "On sale", name: "is_sale" },
            ].map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={item.id}
                  name={item.name}
                  checked={formData[item.name]}
                  onChange={onInputChange}
                  className="w-4 h-4 text-pink-600 border-gray-200 rounded focus:ring-pink-500"
                  aria-label={item.label}
                />
                <label htmlFor={item.id} className="text-sm text-gray-700">
                  {item.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          aria-label="Cancel"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={isEditing ? "Update Product" : "Create Product"}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isEditing ? "Update Product" : "Create Product"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
