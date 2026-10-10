// components/admin/CustomersManagement.js
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Mail,
  Phone,
  MapPin,
  Star,
  Users,
  TrendingUp,
  Calendar,
  CreditCard,
  Filter,
  Download,
} from "lucide-react";
import { formatPrice } from "../../../lib/currency";

const CustomersManagement = ({ loading, customers, stats }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  // Customer segmentation logic
  const getCustomerSegment = (customer) => {
    const totalSpent = customer.total_spent || 0;
    const totalOrders = customer.total_orders || 0;

    if (totalSpent > 500 && totalOrders > 3) return "vip";
    if (totalSpent > 200 || totalOrders > 1) return "regular";
    if (totalOrders === 1) return "returning";
    return "new";
  };

  // Filter and sort customers
  const filteredCustomers = customers
    .filter((customer) => {
      const matchesSearch =
        customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase());

      const customerSegment = getCustomerSegment(customer);
      const matchesSegment =
        selectedSegment === "all" || customerSegment === selectedSegment;

      return matchesSearch && matchesSegment;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case "oldest":
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        case "spending-high":
          return (b.total_spent || 0) - (a.total_spent || 0);
        case "spending-low":
          return (a.total_spent || 0) - (b.total_spent || 0);
        case "orders-high":
          return (b.total_orders || 0) - (a.total_orders || 0);
        case "orders-low":
          return (a.total_orders || 0) - (b.total_orders || 0);
        case "name":
          return (a.full_name || a.email || "").localeCompare(
            b.full_name || b.email || ""
          );
        default:
          return 0;
      }
    });

  // Customer analytics
  const customerAnalytics = {
    total: customers.length,
    vip: customers.filter((c) => getCustomerSegment(c) === "vip").length,
    regular: customers.filter((c) => getCustomerSegment(c) === "regular")
      .length,
    returning: customers.filter((c) => getCustomerSegment(c) === "returning")
      .length,
    new: customers.filter((c) => getCustomerSegment(c) === "new").length,
    avgOrderValue:
      customers.length > 0
        ? customers.reduce((sum, c) => sum + (c.total_spent || 0), 0) /
          customers.length
        : 0,
    totalRevenue: customers.reduce((sum, c) => sum + (c.total_spent || 0), 0),
  };

  const getSegmentColor = (segment) => {
    switch (segment) {
      case "vip":
        return "bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 border border-pink-200";
      case "regular":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "returning":
        return "bg-green-100 text-green-800 border border-green-200";
      case "new":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getSegmentIcon = (segment) => {
    switch (segment) {
      case "vip":
        return <Star className="w-3 h-3 mr-1 fill-current" />;
      case "regular":
        return <Users className="w-3 h-3 mr-1" />;
      case "returning":
        return <TrendingUp className="w-3 h-3 mr-1" />;
      case "new":
        return <Calendar className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const handleExportCustomers = () => {
    const csvContent = [
      [
        "Name",
        "Email",
        "Phone",
        "Total Orders",
        "Total Spent",
        "Segment",
        "Last Order",
      ],
      ...filteredCustomers.map((customer) => [
        customer.full_name || customer.email,
        customer.email,
        customer.phone || "",
        customer.total_orders || 0,
        customer.total_spent || 0,
        getCustomerSegment(customer),
        customer.last_order
          ? new Date(customer.last_order).toLocaleDateString()
          : "Never",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Customer Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {customerAnalytics.total}
              </p>
            </div>
            <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-green-600 font-medium">+8%</span>
            <span className="text-gray-600 ml-1">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">VIP Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {customerAnalytics.vip}
              </p>
            </div>
            <div className="w-12 h-12 bg-stone-600 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-green-600 font-medium">+12%</span>
            <span className="text-gray-600 ml-1">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Avg. Order Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(customerAnalytics.avgOrderValue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-zinc-700 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-green-600 font-medium">+5%</span>
            <span className="text-gray-600 ml-1">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(customerAnalytics.totalRevenue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-green-600 font-medium">+18%</span>
            <span className="text-gray-600 ml-1">vs last month</span>
          </div>
        </div>
      </div>

      {/* Customer Segments */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { id: "all", label: "All Customers", count: customerAnalytics.total },
          { id: "vip", label: "VIP", count: customerAnalytics.vip },
          { id: "regular", label: "Regular", count: customerAnalytics.regular },
          { id: "new", label: "New", count: customerAnalytics.new },
        ].map((segment) => (
          <div
            key={segment.id}
            className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedSegment === segment.id
                ? "border-pink-500 bg-pink-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setSelectedSegment(segment.id)}
          >
            <div className="text-2xl font-bold text-gray-900">
              {segment.count}
            </div>
            <div className="text-sm text-gray-600">{segment.label}</div>
          </div>
        ))}
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent w-full sm:w-64"
              />
            </div>

            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="all">All Customers</option>
              <option value="vip">VIP Customers</option>
              <option value="regular">Regular Customers</option>
              <option value="returning">Returning Customers</option>
              <option value="new">New Customers</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
              <option value="spending-high">Spending High-Low</option>
              <option value="spending-low">Spending Low-High</option>
              <option value="orders-high">Orders High-Low</option>
              <option value="orders-low">Orders Low-High</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
              onClick={handleExportCustomers}
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No customers found
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedSegment !== "all"
                ? "Try adjusting your search or filters"
                : "Customers will appear here when they make their first purchase"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                    Customer
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                    Contact
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                    Orders
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                    Total Spent
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                    Segment
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((customer) => {
                  const segment = getCustomerSegment(customer);

                  return (
                    <tr
                      key={customer.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center text-white font-medium">
                            {(customer.full_name || customer.email || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {customer.full_name || customer.email}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-600">
                                {customer.location || "Location not set"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {customer.email}
                            </span>
                          </div>
                          {customer.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {customer.phone}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">
                            {customer.total_orders || 0}
                          </p>
                          <p className="text-xs text-gray-600">orders</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-gray-900">
                          {formatPrice(customer.total_spent || 0)}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <div
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getSegmentColor(
                            segment
                          )}`}
                        >
                          {getSegmentIcon(segment)}
                          {segment.toUpperCase()}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-gray-600">
                          {customer.last_order
                            ? new Date(customer.last_order).toLocaleDateString()
                            : "No orders"}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results Summary */}
      {filteredCustomers.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-6 py-3">
          <div className="text-sm text-gray-600">
            Showing {filteredCustomers.length} of {customers.length} customers
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>
              Total Value:{" "}
              {formatPrice(
                filteredCustomers.reduce(
                  (sum, c) => sum + (c.total_spent || 0),
                  0
                )
              )}
            </span>
            <span>
              Avg. Order Value:{" "}
              {formatPrice(
                filteredCustomers.length > 0
                  ? filteredCustomers.reduce(
                      (sum, c) => sum + (c.total_spent || 0),
                      0
                    ) / filteredCustomers.length
                  : 0
              )}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CustomersManagement;
