// components/products/ProductDeleteModal.jsx
import React from "react";
import { AlertTriangle, Trash2, Package } from "lucide-react";
import ProductModal from "./ProductModal";
import { formatPrice } from "../../../../lib/productUtils";

const ProductDeleteModal = ({ isOpen, onClose, product, onConfirm }) => {
  if (!product) return null;

  return (
    <ProductModal isOpen={isOpen} onClose={onClose} title="Delete Product">
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <div>
            <h4 className="font-medium text-red-800">Are you sure?</h4>
            <p className="text-sm text-red-600">
              This action cannot be undone. This will permanently delete the
              product.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-2">
            Product to be deleted:
          </h5>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`w-full h-full flex items-center justify-center ${
                  product.image_url ? "hidden" : "flex"
                }`}
              >
                <Package className="w-6 h-6 text-gray-400" />
              </div>
            </div>
            <div>
              <p className="font-medium text-gray-900">{product.name}</p>
              <p className="text-sm text-gray-600">
                {formatPrice(product.price)} • {product.stock} in stock
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            aria-label="Delete product"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Product</span>
          </button>
        </div>
      </div>
    </ProductModal>
  );
};

export default ProductDeleteModal; // hooks/useProductsState.js
