import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Package,
  Star,
  Eye,
  Edit,
  Trash2,
  ImageIcon,
  Play,
} from "lucide-react";
import { formatPrice, getStockStatus } from "../../../../lib/productUtils";

const ProductCard = ({ product, categories, onView, onEdit, onDelete }) => {
  const stockStatus = getStockStatus(product.stock || 0);
  const category = categories.find((cat) => cat.id === product.category_id);

  // Define fallback image URL
  const fallbackImageUrl =
    "https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?auto=compress&cs=tinysrgb&w=800";

  // Get primary media (image or video) from product.images array
  const getPrimaryMedia = () => {
    // product.images contains all media from product_images table
    const allMedia = product.images || [];

    if (allMedia.length > 0) {
      // Find primary media
      const primaryMedia = allMedia.find((m) => m.is_primary);
      if (primaryMedia) {
        return {
          url: primaryMedia.image_url,
          isVideo: primaryMedia.is_video || false,
        };
      }
      // Return first media if no primary is set
      return {
        url: allMedia[0].image_url,
        isVideo: allMedia[0].is_video || false,
      };
    }

    // Fallback to legacy image_url field (if exists)
    if (product.image_url) {
      return {
        url: product.image_url,
        isVideo: false,
      };
    }

    return null;
  };

  const primaryMedia = getPrimaryMedia();
  const totalMediaCount = product.images?.length || 0;
  const imageCount = product.images?.filter((m) => !m.is_video).length || 0;
  const videoCount = product.images?.filter((m) => m.is_video).length || 0;

  console.log("ProductCard media:", {
    name: product.name,
    total: totalMediaCount,
    images: imageCount,
    videos: videoCount,
    primary: primaryMedia,
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100">
        {primaryMedia ? (
          primaryMedia.isVideo ? (
            <div className="relative w-full h-full">
              <video
                src={primaryMedia.url}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
                onError={(e) => {
                  console.error(`Failed to load video: ${primaryMedia.url}`);
                  e.target.style.display = "none";
                  e.target.nextElementSibling.style.display = "flex";
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/50 rounded-full p-3">
                  <Play className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          ) : (
            <Image
              src={primaryMedia.url}
              alt={product.name}
              fill
              className="object-cover"
              priority={product.is_featured}
              onError={(e) => {
                console.error(`Failed to load image: ${primaryMedia.url}`);
                e.target.src = fallbackImageUrl;
              }}
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* Media Count Badge */}
        {totalMediaCount > 1 && (
          <div className="absolute bottom-2 right-2">
            <div className="flex items-center space-x-1 bg-black/70 text-white rounded-full px-2 py-1 text-xs shadow-sm">
              <ImageIcon className="w-3 h-3" />
              <span className="font-medium">{totalMediaCount}</span>
              {videoCount > 0 && (
                <span className="text-pink-300">
                  ({videoCount} video{videoCount > 1 ? "s" : ""})
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stock Badge */}
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
              product.stock === 0
                ? "bg-red-500"
                : product.stock < 10
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
          >
            {product.stock || 0} in stock
          </span>
        </div>

        {/* Rating Badge */}
        <div className="absolute bottom-2 left-2">
          <div className="flex items-center space-x-1 bg-white/90 rounded-full px-2 py-1 text-xs shadow-sm">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="font-medium">{product.rating || 0}</span>
          </div>
        </div>

        {/* Status Badges */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {product.is_featured && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Featured
            </span>
          )}
          {product.is_new && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              New
            </span>
          )}
          {product.is_sale && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Sale
            </span>
          )}
          {!product.is_active && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Inactive
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {category?.name || "Uncategorized"}
          </span>
          <span className="text-xs text-gray-500">
            ID: {product.id?.slice(0, 8)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-pink-600">
              {formatPrice(product.price || 0)}
            </span>
            {product.original_price &&
              product.original_price > product.price && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(product.original_price)}
                </span>
              )}
          </div>
          <div className={`w-2 h-2 rounded-full ${stockStatus.color}`}></div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onView(product)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1"
            aria-label={`View ${product.name}`}
          >
            <Eye className="w-3 h-3" />
            <span>View</span>
          </button>
          <button
            onClick={() => onEdit(product)}
            className="flex-1 bg-pink-100 hover:bg-pink-200 text-pink-700 py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1"
            aria-label={`Edit ${product.name}`}
          >
            <Edit className="w-3 h-3" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDelete(product)}
            className="bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded-lg text-xs font-medium transition-colors"
            aria-label={`Delete ${product.name}`}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
