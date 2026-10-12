"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Bell, X } from "lucide-react";

// Components
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import DashboardOverview from "../components/admin/DashboardOveriew";
import OrdersManagement from "../components/admin/OrdersManagement";
import ProductsManagement from "../components/admin/ProductsManagement";
import CustomersManagement from "../components/admin/CustomersManagement";
import NotificationsDropdown from "../components/admin/NotificationsDropdown";
import NotAuthorized from "../components/NotAuthorized";

// Hooks & Utils
import { useAuthStore } from "../../lib/store";
import { useAdminData } from "../../hooks/useAdminData";
import { supabase } from "../../lib/supabase";

export default function AdminPage() {
  const router = useRouter();
  const {
    user,
    loading: authLoading,
    initialized,
    initialize,
  } = useAuthStore();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [categories, setCategories] = useState([]);
  const [authChecked, setAuthChecked] = useState(false);
  const initializeCalledRef = useRef(false);

  // Custom hook for admin data management
  const {
    loading: dataLoading,
    stats,
    orders,
    products,
    customers,
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    filteredOrders,
    fetchDashboardData,
  } = useAdminData();

  // Initialize auth only once on mount
  useEffect(() => {
    if (!initialized && !initializeCalledRef.current) {
      initializeCalledRef.current = true;
      initialize();
    }
  }, [initialized, initialize]);

  // Handle authentication and authorization
  useEffect(() => {
    if (initialized) {
      setAuthChecked(true);

      if (!authLoading) {
        if (!user) {
          // No user logged in, redirect to login
          router.replace("/auth/login");
        } else if (user.role !== "admin") {
          // User logged in but not admin, will show NotAuthorized
        } else {
          // User is admin, fetch data
          fetchDashboardData();
          fetchCategories();
        }
      }
    }
  }, [user, authLoading, initialized, router]);

  // Handle page visibility changes to prevent re-initialization
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Don't re-initialize when page becomes visible again
      if (document.visibilityState === "visible" && initialized) {
        // Just refresh data if user is admin
        if (user && user.role === "admin") {
          fetchDashboardData();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [initialized, user, fetchDashboardData]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const handleCreateCategory = async (name) => {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!sessionData.session?.access_token) {
      throw new Error("Please sign in again before adding a category.");
    }

    const response = await fetch("/api/admin/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
      body: JSON.stringify({ name }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Unable to add category.");
    }

    setCategories((currentCategories) => {
      if (
        currentCategories.some(
          (category) => category.id === result.category.id
        )
      ) {
        return currentCategories;
      }
      return [...currentCategories, result.category];
    });
    return result.category;
  };

  // Show loading state only during initial auth check
  if (!authChecked || (!initialized && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff1783] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show NotAuthorized if user exists but is not admin
  if (user && user.role !== "admin") {
    return <NotAuthorized />;
  }

  // If no user after initialization, redirect is handled above
  if (!user && !authLoading) {
    return null;
  }

  // Still loading user data
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "orders", label: "Orders" },
    { id: "products", label: "Products" },
    { id: "customers", label: "Customers" },
  ];

  const handleAddProduct = async (product) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert([product])
        .select();

      if (error) throw error;
      fetchDashboardData();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleUpdateProduct = async (product) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .update(product)
        .eq("id", product.id)
        .select();

      if (error) throw error;
      fetchDashboardData();
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;
      fetchDashboardData();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const renderActiveContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardOverview
            loading={dataLoading}
            stats={stats}
            orders={orders}
            products={products}
          />
        );
      case "orders":
        return (
          <OrdersManagement
            loading={dataLoading}
            orders={filteredOrders}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
          />
        );
      case "products":
        return (
          <ProductsManagement
            loading={dataLoading}
            products={products}
            categories={categories}
            supabase={supabase}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateProduct={handleUpdateProduct}
            onCreateCategory={handleCreateCategory}
            onFetchCategories={fetchCategories}
          />
        );
      case "customers":
        return (
          <CustomersManagement
            loading={dataLoading}
            customers={customers}
            stats={stats}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-luxe min-h-screen bg-[#f2f2f2]">
      <Navbar />

      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#ff1783] text-black font-black text-sm flex items-center justify-center">
              <span className="text-black font-black text-sm">D</span>
            </div>
            <span className="font-bold text-lg text-gray-900">Dimplesluxe</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 relative transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#ff1783] rounded-full"></span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-screen pt-16 lg:pt-0">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <AdminSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabs={tabs}
          />
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="lg:hidden fixed left-0 top-0 bottom-0 w-64 z-50"
              >
                <AdminSidebar
                  activeTab={activeTab}
                  setActiveTab={(tab) => {
                    setActiveTab(tab);
                    setSidebarOpen(false);
                  }}
                  tabs={tabs}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop Header */}
          <div className="hidden lg:block">
            <AdminHeader
              activeTab={activeTab}
              showNotifications={showNotifications}
              setShowNotifications={setShowNotifications}
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4 lg:p-8">
            {renderActiveContent()}
          </div>
        </div>
      </div>

      {/* Notifications Dropdown */}
      <NotificationsDropdown
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        orders={orders}
      />

      <Footer />
    </div>
  );
}
