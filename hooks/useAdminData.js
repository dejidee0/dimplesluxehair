// hooks/useAdminData.js
import { useState, useMemo } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

export function useAdminData() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch orders with better error handling
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (ordersError) {
        console.error("Orders fetch error:", ordersError);
        throw new Error("Failed to fetch orders");
      }

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select(
          `
      *,
      images:product_images(
        id,
        image_url,
        alt_text,
        is_primary,
        sort_order,
        file_size
      )
    `
        )
        .order("created_at", { ascending: false });

      if (productsError) {
        console.error("Products fetch error:", productsError);
        throw new Error("Failed to fetch products");
      }

      // Fetch customers from auth.users (via RPC or profiles table)
      const { data: customersData, error: customersError } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (customersError) {
        console.error("Customers fetch error:", customersError);
        // Don't throw error for customers as it's less critical
      }

      // Calculate comprehensive stats
      const totalOrders = ordersData?.length || 0;
      const totalRevenue =
        ordersData?.reduce(
          (sum, order) => sum + parseFloat(order.total || 0),
          0
        ) || 0;
      const totalProducts = productsData?.length || 0;
      const totalCustomers = customersData?.length || 0;

      // Update state
      setOrders(ordersData || []);
      setProducts(productsData || []);
      setCustomers(customersData || []);
      setStats({
        totalOrders,
        totalRevenue,
        totalProducts,
        totalCustomers,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error(error.message || "Error loading dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Memoized filtered orders for performance
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === "all" || order.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, selectedStatus]);

  // Additional computed stats
  const computedStats = useMemo(() => {
    const pendingOrders = orders.filter(
      (order) => order.status === "pending"
    ).length;
    const processingOrders = orders.filter(
      (order) => order.status === "processing"
    ).length;
    const completedOrders = orders.filter(
      (order) => order.status === "delivered"
    ).length;
    const lowStockProducts = products.filter(
      (product) => (product.stock || 0) < 10
    ).length;

    return {
      ...stats,
      pendingOrders,
      processingOrders,
      completedOrders,
      lowStockProducts,
    };
  }, [stats, orders, products]);

  return {
    loading,
    stats: computedStats,
    orders,
    products,
    customers,
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    filteredOrders,
    fetchDashboardData,
  };
}
