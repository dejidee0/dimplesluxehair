// components/admin/DashboardOverview.js
import { motion } from "framer-motion";
import {
  ShoppingCart,
  DollarSign,
  Package,
  Users,
  Star,
  CheckCircle,
  ArrowUpRight,
  Clock,
  AlertCircle,
} from "lucide-react";
import { formatPrice } from "../../../lib/currency";

const DashboardOverview = ({ loading, stats, orders, products }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      change: "+12%",
      icon: <ShoppingCart className="w-6 h-6" />,
      color: "from-slate-700 to-slate-800",
      textColor: "text-white",
    },
    {
      title: "Revenue",
      value: formatPrice(stats.totalRevenue),
      change: "+8.5%",
      icon: <DollarSign className="w-6 h-6" />,
      color: "bg-slate-700",
      textColor: "text-white",
    },
    {
      title: "Products",
      value: stats.totalProducts,
      change: "+3%",
      icon: <Package className="w-6 h-6" />,
      color: "from-stone-600 to-stone-700",
      textColor: "text-white",
    },
    {
      title: "Customers",
      value: stats.totalCustomers,
      change: "+15%",
      icon: <Users className="w-6 h-6" />,
      color: "from-zinc-700 to-zinc-800",
      textColor: "text-white",
    },
  ];

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
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative overflow-hidden rounded-2xl ${
              card.color.includes("from-")
                ? `bg-gradient-to-r ${card.color}`
                : card.color
            } p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-xl bg-white bg-opacity-20">
                {card.icon}
              </div>
              <span className="text-xs font-medium bg-white bg-opacity-20 px-2 py-1 rounded-full">
                {card.change}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm opacity-90">{card.title}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
            <div className="absolute -bottom-4 -right-4 opacity-10">
              <div className="w-24 h-24 flex items-center justify-center">
                <div className="scale-[4]">{card.icon}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Orders
            </h3>
            <button className="text-pink-600 hover:text-pink-700 text-sm font-medium">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {orders.slice(0, 4).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-100 to-rose-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      #{order.order_number || `ORD-${order.id}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.customer_name || order.customer_email}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatPrice(order.total, order.currency)}
                  </p>
                  <div
                    className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardOverview;
