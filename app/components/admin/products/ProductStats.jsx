// components/products/ProductStats.jsx
import React from "react";
import { motion } from "framer-motion";

const ProductStats = ({ stats }) => {
  const statItems = [
    { label: "Total Products", value: stats.total, color: "text-gray-900" },
    { label: "Active", value: stats.active, color: "text-green-600" },
    { label: "Inactive", value: stats.inactive, color: "text-gray-600" },
    { label: "Low Stock", value: stats.lowStock, color: "text-yellow-600" },
    { label: "Out of Stock", value: stats.outOfStock, color: "text-red-600" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {statItems.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
        >
          <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          <div className="text-sm text-gray-600">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
};

export default ProductStats;
