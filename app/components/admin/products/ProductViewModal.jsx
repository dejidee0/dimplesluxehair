// ProductViewModal.jsx
import React, { useState, useEffect } from "react";
import {
  Package,
  Star,
  Edit,
  ChevronLeft,
  ChevronRight,
  Play,
  Video,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import ProductModal from "./ProductModal";
import { formatPrice, getStockStatus } from "../../../../lib/productUtils";
import { supabase } from "../../../../lib/supabase";

const ProductViewModal = ({
  isOpen,
  onClose,
  product: initialProduct,
  categories,
  onEdit,
}) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [media, setMedia] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  // Refetch product with media when modal opens
  useEffect(() => {
    if (isOpen && initialProduct?.id) {
      fetchProductWithMedia(initialProduct.id);
    }
  }, [isOpen, initialProduct?.id]);

  const fetchProductWithMedia = async (productId) => {
    try {
      setLoading(true);
      console.log("Fetching product with media for:", productId);

      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          media:product_images(
            id,
            image_url,
            alt_text,
            is_primary,
            sort_order,
            file_size,
            is_video
          )
        `
        )
        .eq("id", productId)
        .single();

      if (error) throw error;

      console.log("Fetched product data:", {
        name: data.name,
        mediaCount: data.media?.length || 0,
        media: data.media,
      });

      // Process media
      const allMedia = data.media || [];

      const images = allMedia
        .filter((m) => !m.is_video)
        .map((img) => ({ ...img, isVideo: false }))
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

      const videos = allMedia
        .filter((m) => m.is_video)
        .map((vid) => ({
          ...vid,
          isVideo: true,
          video_url: vid.image_url,
        }))
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

      const combinedMedia = [...images, ...videos].sort(
        (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
      );

      console.log("ProductViewModal processed media:", {
        productName: data.name,
        total: combinedMedia.length,
        images: images.length,
        videos: videos.length,
        mediaDetails: combinedMedia.map((m) => ({
          type: m.isVideo ? "video" : "image",
          isPrimary: m.is_primary,
          sortOrder: m.sort_order,
          url: m.isVideo ? m.video_url : m.image_url,
        })),
      });

      setProduct(data);
      setMedia(combinedMedia);
      setCurrentMediaIndex(0);
    } catch (error) {
      console.error("Error fetching product with media:", error);
      // Fallback to initial product if fetch fails
      setProduct(initialProduct);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const stockStatus = product
    ? getStockStatus(product.stock || 0)
    : { color: "bg-gray-400", label: "Unknown" };
  const category = product
    ? categories.find((cat) => cat.id === product.category_id)
    : null;
  const currentMedia = media[currentMediaIndex];
  const imageCount = media.filter((m) => !m.isVideo).length;
  const videoCount = media.filter((m) => m.isVideo).length;

  const handlePrevMedia = () => {
    setCurrentMediaIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const handleNextMedia = () => {
    setCurrentMediaIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  return (
    <ProductModal isOpen={isOpen} onClose={onClose} title="Product Details">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
          <span className="ml-2 text-gray-600">Loading product details...</span>
        </div>
      ) : !product ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Product not found</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Media Section */}
            <div className="space-y-4">
              {/* Main Media Display */}
              <div className="relative w-full h-64 sm:h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden group">
                {currentMedia ? (
                  currentMedia.isVideo ? (
                    <div className="relative w-full h-full">
                      <video
                        src={currentMedia.video_url || currentMedia.image_url}
                        alt={currentMedia.alt_text || product.name}
                        className="w-full h-full object-cover"
                        controls
                        playsInline
                        key={currentMedia.id}
                      />
                    </div>
                  ) : (
                    <img
                      src={currentMedia.image_url || currentMedia.url}
                      alt={currentMedia.alt_text || product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(
                          "Failed to load image:",
                          currentMedia.image_url
                        );
                        e.target.style.display = "none";
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = "flex";
                        }
                      }}
                    />
                  )
                ) : null}

                {/* Fallback when no media */}
                <div
                  className={`w-full h-full flex flex-col items-center justify-center ${
                    currentMedia ? "hidden" : "flex"
                  }`}
                >
                  <Package className="w-16 h-16 text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">No media available</p>
                </div>

                {/* Navigation Arrows */}
                {media.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevMedia}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                      aria-label="Previous media"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-800" />
                    </button>
                    <button
                      onClick={handleNextMedia}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                      aria-label="Next media"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-800" />
                    </button>

                    {/* Media Counter */}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">
                      {currentMediaIndex + 1} / {media.length}
                    </div>

                    {/* Media Type Indicator */}
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1 z-10">
                      {currentMedia?.isVideo ? (
                        <>
                          <Video className="w-3 h-3" />
                          <span>Video</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-3 h-3" />
                          <span>Image</span>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Media Count Summary */}
              {media.length > 0 && (
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <ImageIcon className="w-4 h-4" />
                    <span>
                      {imageCount} {imageCount === 1 ? "image" : "images"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Video className="w-4 h-4" />
                    <span>
                      {videoCount} {videoCount === 1 ? "video" : "videos"}
                    </span>
                  </div>
                </div>
              )}

              {/* Thumbnail Grid */}
              {media.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {media.map((item, index) => (
                    <button
                      key={item.id || index}
                      onClick={() => setCurrentMediaIndex(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentMediaIndex
                          ? "border-pink-500 ring-2 ring-pink-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {item.isVideo ? (
                        <div className="relative w-full h-full bg-gray-900">
                          <video
                            src={item.video_url || item.image_url}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play className="w-8 h-8 text-white/80" />
                          </div>
                        </div>
                      ) : (
                        <>
                          <img
                            src={item.image_url || item.url}
                            alt={`${product.name} - ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = "flex";
                              }
                            }}
                          />
                          <div
                            className={`w-full h-full flex items-center justify-center bg-gray-100 ${
                              item.image_url || item.url ? "hidden" : "flex"
                            }`}
                          >
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        </>
                      )}

                      {/* Primary Badge */}
                      {item.is_primary && (
                        <div className="absolute top-1 right-1 bg-pink-500 text-white text-xs px-1 py-0.5 rounded flex items-center gap-1">
                          <Star className="w-2 h-2 fill-current" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                {product.is_active && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                )}
                {!product.is_active && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Inactive
                  </span>
                )}
                {product.is_featured && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Featured
                  </span>
                )}
                {product.is_new && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    New
                  </span>
                )}
                {product.is_sale && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Sale
                  </span>
                )}
              </div>
            </div>

            {/* Product Info Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h3>
                {product.short_description && (
                  <p className="text-gray-600">{product.short_description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Price
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-pink-600">
                      {formatPrice(product.price)}
                    </span>
                    {product.original_price &&
                      product.original_price > product.price && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.original_price)}
                        </span>
                      )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Stock
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-900">
                      {product.stock || 0}
                    </span>
                    <div
                      className={`w-2 h-2 rounded-full ${stockStatus.color}`}
                    ></div>
                    <span className="text-sm text-gray-600">
                      {stockStatus.label}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Category
                  </label>
                  <span className="text-gray-900">
                    {category?.name || "Uncategorized"}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Rating
                  </label>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-gray-900">{product.rating || 0}</span>
                    <span className="text-gray-500">
                      ({product.review_count || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {product.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Description
                  </label>
                  <p className="text-gray-900 text-sm">{product.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                {product.lengths?.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Available Lengths
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {product.lengths.map((length, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded"
                        >
                          {length}"
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {product.colors?.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Available Colors
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {product.colors.map((color, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {product.textures?.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Available Textures
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {product.textures.map((texture, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded"
                        >
                          {texture}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {product.weight && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Weight
                    </label>
                    <span className="text-gray-900 text-sm">
                      {product.weight}
                    </span>
                  </div>
                )}

                {product.origin_country && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Origin Country
                    </label>
                    <span className="text-gray-900 text-sm">
                      {product.origin_country}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              onClick={() => onEdit(product)}
              className="px-4 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg font-medium transition-colors flex items-center gap-2"
              aria-label="Edit product"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Product</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              aria-label="Close"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </ProductModal>
  );
};

export default ProductViewModal;
