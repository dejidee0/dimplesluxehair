"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  User,
  Package,
  Heart,
  Settings,
  LogOut,
  Eye,
  Calendar,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Edit3,
  ShoppingBag,
  Star,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  ArrowRight,
  Plus,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore, useWishlistStore } from "../../lib/store";
import { supabase } from "../../lib/supabase";
import { formatPrice } from "../../lib/currency";
import toast from "react-hot-toast";

export default function AccountPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const {
    wishlist,
    setWishlist,
    removeFromWishlist: removeFromWishlistStore,
    addToWishlist,
  } = useWishlistStore();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    city: "",
    postcode: "",
  });

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    fetchUserData();
  }, [user, router]);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Fetch wishlist
      const { data: wishlistData } = await supabase
        .from("wishlists")
        .select(
          `
          *,
          product:products(*)
        `
        )
        .eq("user_id", user.id);

      setOrders(ordersData || []);

      // Convert wishlistData to product objects for the store
      if (wishlistData) {
        const wishlistProducts = wishlistData
          .map((item) => ({
            ...item.product,
            id: item.product_id || item.product?.id,
          }))
          .filter(Boolean);
        setWishlist(wishlistProducts);
      } else {
        setWishlist([]);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Error loading account data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      logout();
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
      removeFromWishlistStore(productId);
      toast.success("Removed from wishlist");
    } catch (error) {
      toast.error("Error removing from wishlist");
    }
  };

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
        return <Truck className="w-3 h-3" />;
      case "processing":
        return <Clock className="w-3 h-3" />;
      case "pending":
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <User className="w-5 h-5" />,
      color: "text-pink-600",
    },
    {
      id: "orders",
      label: "Orders",
      icon: <Package className="w-5 h-5" />,
      color: "text-pink-600",
    },
    {
      id: "wishlist",
      label: "Wishlist",
      icon: <Heart className="w-5 h-5" />,
      color: "text-pink-600",
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-5 h-5" />,
      color: "text-pink-600",
    },
  ];

  const totalSpent = orders.reduce(
    (sum, order) => sum + parseFloat(order.total || 0),
    0
  );

  // Professional stat cards with sophisticated colors
  const statsCards = [
    {
      title: "Total Orders",
      value: orders.length,
      icon: <Package className="w-6 h-6" />,
      color: "bg-slate-700",
      textColor: "text-white",
    },
    {
      title: "Wishlist Items",
      value: wishlist.length,
      icon: <Heart className="w-6 h-6" />,
      color: "bg-stone-600",
      textColor: "text-white",
    },
    {
      title: "Total Spent",
      value: formatPrice(totalSpent),
      icon: <CreditCard className="w-6 h-6" />,
      color: "bg-zinc-700",
      textColor: "text-white",
    },
  ];

  if (!user) {
    return null;
  }
  console.log(user);
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-playfair text-4xl font-bold text-gray-900 mb-2">
            My Account
          </h1>
          <p className="text-gray-600">
            Welcome back,{" "}
            {profile.first_name || user.user_metadata?.first_name || user.email}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
              {/* Profile Header */}
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {profile.first_name ||
                      user.user_metadata?.first_name ||
                      "User"}
                  </h3>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-gray-500">Active</span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-pink-50 to-rose-50 text-pink-600 shadow-sm border border-pink-100"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div
                      className={`${
                        activeTab === tab.id
                          ? tab.color
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    >
                      {tab.icon}
                    </div>
                    <span className="font-medium">{tab.label}</span>
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeAccountTab"
                        className="ml-auto w-2 h-2 bg-pink-500 rounded-full"
                      />
                    )}
                  </button>
                ))}

                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                </div>
              ) : (
                <>
                  {/* Overview Tab */}
                  {activeTab === "overview" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-8"
                    >
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          Account Overview
                        </h2>
                        <p className="text-gray-600">
                          Manage your account and view your activity
                        </p>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {statsCards.map((card, index) => (
                          <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`${card.color} p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-shadow duration-300`}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="p-2 rounded-xl bg-white bg-opacity-20">
                                {card.icon}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm opacity-90">{card.title}</p>
                              <p className="text-2xl font-bold">{card.value}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Recent Activity */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Recent Orders */}
                        <div>
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Recent Orders
                            </h3>
                            <button
                              onClick={() => setActiveTab("orders")}
                              className="text-pink-600 hover:text-pink-700 text-sm font-medium flex items-center space-x-1"
                            >
                              <span>View all</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="space-y-4">
                            {orders.slice(0, 3).map((order) => (
                              <div
                                key={order.id}
                                className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-pink-100 to-rose-100 rounded-lg flex items-center justify-center">
                                      <Package className="w-5 h-5 text-pink-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        #
                                        {order.order_number ||
                                          `ORD-${order.id}`}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {new Date(
                                          order.created_at
                                        ).toLocaleDateString()}
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
                                      <span className="capitalize">
                                        {order.status}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {orders.length === 0 && (
                              <div className="text-center py-8">
                                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No orders yet</p>
                                <button
                                  onClick={() => router.push("/products")}
                                  className="mt-2 text-pink-600 hover:text-pink-700 text-sm font-medium"
                                >
                                  Start shopping
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Wishlist Preview */}
                        <div>
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Wishlist
                            </h3>
                            <button
                              onClick={() => setActiveTab("wishlist")}
                              className="text-pink-600 hover:text-pink-700 text-sm font-medium flex items-center space-x-1"
                            >
                              <span>View all</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="space-y-4">
                            {wishlist.slice(0, 3).map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                              >
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg"></div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 truncate">
                                    {item.name || "Product"}
                                  </p>
                                  <p className="text-sm text-pink-600 font-semibold">
                                    {formatPrice(item.price || 0)}
                                  </p>
                                </div>
                                <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                  <Heart className="w-4 h-4 fill-current" />
                                </button>
                              </div>
                            ))}
                            {wishlist.length === 0 && (
                              <div className="text-center py-8">
                                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">
                                  No items in wishlist
                                </p>
                                <button
                                  onClick={() => router.push("/products")}
                                  className="mt-2 text-pink-600 hover:text-pink-700 text-sm font-medium"
                                >
                                  Browse products
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Orders Tab */}
                  {activeTab === "orders" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          Order History
                        </h2>
                        <p className="text-gray-600">
                          Track and manage your orders
                        </p>
                      </div>

                      {orders.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-12 h-12 text-gray-400" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No orders yet
                          </h3>
                          <p className="text-gray-600 mb-8">
                            Start shopping to see your orders here
                          </p>
                          <button
                            onClick={() => router.push("/products")}
                            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            Browse Products
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {orders.map((order) => (
                            <div
                              key={order.id}
                              className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-sm transition-shadow"
                            >
                              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-3">
                                    <div className="w-12 h-12 bg-gradient-to-r from-pink-100 to-rose-100 rounded-xl flex items-center justify-center">
                                      <Package className="w-6 h-6 text-pink-600" />
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-gray-900 text-lg">
                                        Order #
                                        {order.order_number ||
                                          `ORD-${order.id}`}
                                      </h3>
                                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <span className="flex items-center">
                                          <Calendar className="w-4 h-4 mr-1" />
                                          {new Date(
                                            order.created_at
                                          ).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center">
                                          <CreditCard className="w-4 h-4 mr-1" />
                                          {formatPrice(
                                            order.total,
                                            order.currency
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {order.shipping_address && (
                                    <div className="text-sm text-gray-600">
                                      <p className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        Delivery to: {order.shipping_city},{" "}
                                        {order.shipping_postcode}
                                      </p>
                                      {order.tracking_number && (
                                        <p className="mt-1">
                                          Tracking: {order.tracking_number}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center space-x-4">
                                  <div
                                    className={`inline-flex items-center space-x-1 px-3 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                                      order.status
                                    )}`}
                                  >
                                    {getStatusIcon(order.status)}
                                    <span className="capitalize">
                                      {order.status}
                                    </span>
                                  </div>
                                  <button className="flex items-center space-x-2 text-pink-600 hover:text-pink-700 font-medium">
                                    <Eye className="w-4 h-4" />
                                    <span>View Details</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Wishlist Tab */}
                  {activeTab === "wishlist" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          My Wishlist
                        </h2>
                        <p className="text-gray-600">
                          Save items you love for later
                        </p>
                      </div>

                      {wishlist.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart className="w-12 h-12 text-gray-400" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Your wishlist is empty
                          </h3>
                          <p className="text-gray-600 mb-8">
                            Save items you love for later
                          </p>
                          <button
                            onClick={() => router.push("/products")}
                            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            Browse Products
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {wishlist.map((item) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                            >
                              <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 relative">
                                {item.images && item.images.length > 0 ? (
                                  <img
                                    src={item.images[0]}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-12 h-12 text-gray-400" />
                                  </div>
                                )}
                                <div className="absolute top-3 right-3">
                                  <div className="flex items-center space-x-1 bg-white rounded-full px-2 py-1 text-xs shadow-sm">
                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                    <span className="font-medium">4.8</span>
                                  </div>
                                </div>
                              </div>
                              <div className="p-4">
                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                  {item.name || "Product"}
                                </h3>
                                <div className="flex items-center justify-between mb-4">
                                  <span className="text-lg font-bold text-pink-600">
                                    {formatPrice(item.price || 0)}
                                  </span>
                                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                                    In Stock
                                  </span>
                                </div>
                                <div className="flex space-x-2">
                                  <button className="flex-1 bg-slate-700 hover:bg-slate-800 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1">
                                    <ShoppingBag className="w-4 h-4" />
                                    <span>Add to Cart</span>
                                  </button>
                                  <button
                                    onClick={() => removeFromWishlist(item.id)}
                                    className="bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Settings Tab */}
                  {activeTab === "settings" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-8"
                    >
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          Account Settings
                        </h2>
                        <p className="text-gray-600">
                          Manage your personal information and preferences
                        </p>
                      </div>

                      {/* Profile Information */}
                      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Profile Information
                          </h3>
                          <button className="text-pink-600 hover:text-pink-700 font-medium flex items-center space-x-1">
                            <Edit3 className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              First Name
                            </label>
                            <input
                              type="text"
                              defaultValue={
                                profile.first_name ||
                                user.user_metadata?.first_name ||
                                ""
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                              placeholder="Enter your first name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Last Name
                            </label>
                            <input
                              type="text"
                              defaultValue={
                                profile.last_name ||
                                user.user_metadata?.last_name ||
                                ""
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                              placeholder="Enter your last name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Address
                            </label>
                            <input
                              type="email"
                              defaultValue={user.email}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                              disabled
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              defaultValue={profile.phone || ""}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                              placeholder="Enter your phone number"
                            />
                          </div>
                        </div>

                        <div className="mt-6">
                          <button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                            Update Profile
                          </button>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Shipping Address
                          </h3>
                          <button className="text-pink-600 hover:text-pink-700 font-medium flex items-center space-x-1">
                            <Edit3 className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Street Address
                            </label>
                            <input
                              type="text"
                              defaultValue={profile.address || ""}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                              placeholder="Enter your street address"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              City
                            </label>
                            <input
                              type="text"
                              defaultValue={profile.city || ""}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                              placeholder="Enter your city"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Postcode
                            </label>
                            <input
                              type="text"
                              defaultValue={profile.postcode || ""}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                              placeholder="Enter your postcode"
                            />
                          </div>
                        </div>

                        <div className="mt-6">
                          <button className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                            Update Address
                          </button>
                        </div>
                      </div>

                      {/* Password Change */}
                      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Change Password
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>Secure</span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Current Password
                            </label>
                            <input
                              type="password"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                              placeholder="Enter your current password"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              New Password
                            </label>
                            <input
                              type="password"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                              placeholder="Enter your new password"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                              placeholder="Confirm your new password"
                            />
                          </div>
                        </div>

                        <div className="mt-6">
                          <button className="bg-stone-600 hover:bg-stone-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                            Update Password
                          </button>
                        </div>
                      </div>

                      {/* Account Preferences */}
                      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">
                          Preferences
                        </h3>

                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                Email Notifications
                              </h4>
                              <p className="text-sm text-gray-600">
                                Receive updates about your orders and promotions
                              </p>
                            </div>
                            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-pink-500 transition-colors">
                              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                SMS Updates
                              </h4>
                              <p className="text-sm text-gray-600">
                                Get text messages about order status
                              </p>
                            </div>
                            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors">
                              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                Marketing Communications
                              </h4>
                              <p className="text-sm text-gray-600">
                                Receive news about new products and sales
                              </p>
                            </div>
                            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-pink-500 transition-colors">
                              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Danger Zone */}
                      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-red-900 mb-4">
                          Danger Zone
                        </h3>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-red-900">
                              Delete Account
                            </h4>
                            <p className="text-sm text-red-700">
                              Permanently delete your account and all data
                            </p>
                          </div>
                          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
