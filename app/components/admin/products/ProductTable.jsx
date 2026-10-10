// components/products/ProductTable.jsx
import React from "react";
import { Package, Star, Eye, Edit, Trash2 } from "lucide-react";
import { formatPrice, getStockStatus } from "../../utils/productUtils";

const ProductTable = ({ products, categories, onView, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {["Product", "Price", "Stock", "Status", "Rating", "Actions"].map(
                (header) => (
                  <th
                    key={header}
                    className="text-left py-3 px-6 font-semibold text-gray-900 text-sm"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                categories={categories}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
const ProductRow = ({ product, categories, onView, onEdit, onDelete }) => {
  const stockStatus = getStockStatus(product.stock || 0);
  const category = categories.find((cat) => cat.id === product.category_id);

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="py-4 px-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex-shrink-0">
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
            <p className="text-xs text-gray-500">
              {category?.name || "Uncategorized"}
            </p>
            <p className="text-xs text-gray-400">
              ID: {product.id?.slice(0, 8)}
            </p>
          </div>
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="flex flex-col">
          <span className="text-lg font-bold text-pink-600">
            {formatPrice(product.price || 0)}
          </span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${stockStatus.color}`}></div>
          <span className={`text-sm font-medium ${stockStatus.textColor}`}>
            {product.stock || 0}
          </span>
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="flex flex-col space-y-1">
          {product.is_active !== false && (
            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          )}
          {product.is_featured && (
            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Featured
            </span>
          )}
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center space-x-1">
          <Star className="w-3 h-3 text-yellow-400 fill-current" />
          <span className="text-sm text-gray-600">{product.rating || 0}</span>
          <span className="text-xs text-gray-400">
            ({product.review_count || 0})
          </span>
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="flex space-x-2">
          <button
            onClick={() => onView(product)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label={`View ${product.name}`}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(product)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            aria-label={`Edit ${product.name}`}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(product)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label={`Delete ${product.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ProductTable;
