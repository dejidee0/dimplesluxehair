// components/admin/OrdersManagement.js
import { motion } from "framer-motion";
import {
  Search,
  Download,
  Eye,
  Edit,
  CheckCircle,
  ArrowUpRight,
  Clock,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { formatPrice } from "../../../lib/currency";

const OrdersManagement = ({
  loading,
  orders,
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="w-3 h-3" />;
      case "shipped":
        return <ArrowUpRight className="w-3 h-3" />;
      case "processing":
        return <Clock className="w-3 h-3" />;
      case "pending":
        return <AlertCircle className="w-3 h-3" />;
      case "cancelled":
        return <XCircle className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const handleExportOrders = () => {
    // CSV export functionality
    const csvContent = [
      ["Order Number", "Customer", "Status", "Total", "Date", "Payment Method"],
      ...orders.map((order) => [
        order.order_number || `ORD-${order.id}`,
        order.customer_name || order.customer_email,
        order.status,
        order.total,
        new Date(order.created_at).toLocaleDateString(),
        order.payment_method || "Card",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Order Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div
            key={status}
            className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedStatus === status
                ? "border-pink-500 bg-pink-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setSelectedStatus(status)}
          >
            <div className="text-2xl font-bold text-gray-900">{count}</div>
            <div className="text-sm text-gray-600 capitalize">
              {status === "all" ? "Total Orders" : status}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="all">All Status ({statusCounts.all})</option>
              <option value="pending">Pending ({statusCounts.pending})</option>
              <option value="processing">
                Processing ({statusCounts.processing})
              </option>
              <option value="shipped">Shipped ({statusCounts.shipped})</option>
              <option value="delivered">
                Delivered ({statusCounts.delivered})
              </option>
              <option value="cancelled">
                Cancelled ({statusCounts.cancelled})
              </option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleExportOrders}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Orders will appear here when customers make purchases"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                    Order
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                    Customer
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                    Payment
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                    Total
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">
                          #{order.order_number || `ORD-${order.id}`}
                        </p>
                        <p className="text-xs text-gray-600">
                          Items: {order.items?.length || 1}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.customer_name || "Customer"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.customer_email}
                        </p>
                        {order.customer_phone && (
                          <p className="text-xs text-gray-500">
                            {order.customer_phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm text-gray-900 capitalize">
                          {order.payment_method || "Card"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.payment_status || "Pending"}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {formatPrice(order.total, order.currency)}
                        </p>
                        {order.shipping_cost > 0 && (
                          <p className="text-xs text-gray-500">
                            +{formatPrice(order.shipping_cost, order.currency)}{" "}
                            shipping
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination could be added here if needed */}
      {orders.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-6 py-3">
          <div className="text-sm text-gray-600">
            Showing {orders.length} order{orders.length !== 1 ? "s" : ""}
          </div>
          <div className="text-sm text-gray-600">
            Total Revenue:{" "}
            {formatPrice(
              orders.reduce(
                (sum, order) => sum + parseFloat(order.total || 0),
                0
              )
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default OrdersManagement;
