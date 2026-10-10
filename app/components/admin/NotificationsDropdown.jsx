// components/admin/NotificationsDropdown.js
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Bell,
  ShoppingCart,
  Package,
  AlertTriangle,
  CreditCard,
  User,
  Star,
  TrendingUp,
} from "lucide-react";
import { formatPrice } from "../../../lib/currency";

const NotificationsDropdown = ({
  showNotifications,
  setShowNotifications,
  orders,
}) => {
  // Helper function to format time ago
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hour${
        Math.floor(diffInMinutes / 60) > 1 ? "s" : ""
      } ago`;
    return `${Math.floor(diffInMinutes / 1440)} day${
      Math.floor(diffInMinutes / 1440) > 1 ? "s" : ""
    } ago`;
  };

  // Generate notifications based on orders and system events
  const generateNotifications = () => {
    const notifications = [];

    // Recent orders
    orders.slice(0, 3).forEach((order, index) => {
      notifications.push({
        id: `order-${order.id}`,
        type: "order",
        title: "New Order Received",
        message: `Order #${order.order_number || `ORD-${order.id}`} from ${
          order.customer_name || order.customer_email
        }`,
        time: formatTimeAgo(order.created_at),
        amount: order.total,
        currency: order.currency,
        icon: ShoppingCart,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        priority: "normal",
      });
    });

    // Low stock alerts (simulated)
    notifications.push({
      id: "stock-alert-1",
      type: "warning",
      title: "Low Stock Alert",
      message: 'Brazilian Hair Bundle 18" is running low (3 items left)',
      time: "1 hour ago",
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      priority: "high",
    });

    // Payment notifications
    if (orders.length > 0) {
      const latestOrder = orders[0];
      notifications.push({
        id: "payment-1",
        type: "payment",
        title: "Payment Received",
        message: `${formatPrice(
          latestOrder.total,
          latestOrder.currency
        )} payment processed successfully`,
        time: formatTimeAgo(latestOrder.created_at),
        icon: CreditCard,
        color: "text-green-600",
        bgColor: "bg-green-50",
        priority: "normal",
      });
    }

    // Customer review notification (simulated)
    notifications.push({
      id: "review-1",
      type: "review",
      title: "New 5-Star Review",
      message: '"Amazing quality! Will definitely order again" - Sarah J.',
      time: "2 hours ago",
      icon: Star,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      priority: "normal",
    });

    // Performance notification (simulated)
    notifications.push({
      id: "performance-1",
      type: "analytics",
      title: "Sales Milestone",
      message: "Congratulations! You've reached £5,000 in monthly revenue",
      time: "1 day ago",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      priority: "normal",
    });

    // New customer notification (simulated)
    notifications.push({
      id: "customer-1",
      type: "customer",
      title: "New Customer Signup",
      message: "Emma Wilson just created an account and added items to cart",
      time: "3 hours ago",
      icon: User,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      priority: "normal",
    });

    return notifications
      .sort((a, b) => {
        // Sort by priority (high first) then by time
        if (a.priority === "high" && b.priority !== "high") return -1;
        if (b.priority === "high" && a.priority !== "high") return 1;
        return 0; // Keep original order for same priority
      })
      .slice(0, 6); // Limit to 6 notifications
  };

  const notifications = generateNotifications();
  const unreadCount = notifications.length;

  const getNotificationIcon = (notification) => {
    const IconComponent = notification.icon;
    return (
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center ${notification.bgColor}`}
      >
        <IconComponent className={`w-4 h-4 ${notification.color}`} />
      </div>
    );
  };

  const handleNotificationClick = (notification) => {
    // Handle different notification types
    switch (notification.type) {
      case "order":
        // Navigate to order details
        console.log("Navigate to order:", notification.id);
        break;
      case "warning":
        // Navigate to inventory
        console.log("Navigate to inventory");
        break;
      case "payment":
        // Navigate to payments
        console.log("Navigate to payments");
        break;
      case "review":
        // Navigate to reviews
        console.log("Navigate to reviews");
        break;
      default:
        console.log("Handle notification:", notification.type);
    }
    setShowNotifications(false);
  };

  const markAllAsRead = () => {
    // Implementation for marking all notifications as read
    console.log("Mark all notifications as read");
  };

  return (
    <AnimatePresence>
      {showNotifications && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-16 right-4 lg:right-8 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-pink-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-pink-600 hover:text-pink-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {notification.title}
                        </p>
                        {notification.priority === "high" && (
                          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-gray-600 text-xs leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-gray-400 text-xs">
                          {notification.time}
                        </p>
                        {notification.amount && (
                          <p className="text-green-600 text-xs font-medium">
                            {formatPrice(
                              notification.amount,
                              notification.currency
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No notifications yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  We'll notify you about important updates
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <button
              className="w-full text-center text-pink-600 hover:text-pink-700 text-sm font-medium transition-colors"
              onClick={() => {
                setShowNotifications(false);
                // Navigate to full notifications page
                console.log("Navigate to notifications page");
              }}
            >
              View all notifications
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationsDropdown;
