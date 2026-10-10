"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../../../lib/supabase";
import { useAuthStore } from "../../../lib/store";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, initialized, setUser, initialize } = useAuthStore();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize auth on mount
  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  // Redirect if already logged in
  useEffect(() => {
    if (initialized && !loading && user) {
      if (user.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/account");
      }
    }
  }, [user, loading, initialized, router]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitLoading(true);

    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password");
        } else {
          toast.error(error.message);
        }
        return;
      }

      // Extract user ID from the response
      const userId = data.user.id;

      // Fetch user profile from the 'users' table
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        toast.error("Error loading user profile");
        return;
      }

      if (profileData) {
        // Set user in the auth store
        setUser(profileData);
        toast.success("Welcome back!");

        // Redirect based on role in the users table
        if (profileData.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/account");
        }
      } else {
        toast.error("User profile not found");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Show loading while auth is initializing
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // If user is already logged in, don't show the form
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
          >
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg sm:text-xl">
                    D
                  </span>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Sign in to your Dimplesluxe account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-sm sm:text-base ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className={`w-full pl-10 sm:pl-12 pr-12 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-sm sm:text-base ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-600">Remember me</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-pink-600 hover:text-pink-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {submitLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span className="text-sm sm:text-base">
                  {submitLoading ? "Signing in..." : "Sign In"}
                </span>
              </button>
            </form>

            <div className="text-center mt-6 sm:mt-8">
              <p className="text-gray-600 text-sm sm:text-base">
                Don't have an account?{" "}
                <Link
                  href="/auth/register"
                  className="text-pink-600 hover:text-pink-700 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
