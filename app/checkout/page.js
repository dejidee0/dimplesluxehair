"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Lock,
  Check,
  AlertCircle,
  ShoppingBag,
  Package,
  Smartphone,
  Truck,
  WalletCards,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore, useAuthStore } from "../../lib/store";
import { formatPrice } from "../../lib/currency";
import { supabase } from "../../lib/supabase";
import { createStripeCheckoutSession } from "../../lib/payments/stripe";
import { getProductImage, getRealisticFallback } from "../../lib/productImage";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useAuthStore();
  const {
    items,
    getTotal,
    clearCart,
    currency,
    exchangeRate,
    setCurrency,
    setExchangeRate,
  } = useCartStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    billingAddress: "",
    billingAddress2: "",
    billingCity: "",
    billingPostcode: "",
    billingCountry: "GB",
    sameAsBilling: true,
    shippingAddress: "",
    shippingAddress2: "",
    shippingCity: "",
    shippingPostcode: "",
    shippingCountry: "GB",
    shippingMethod: "standard",
    paymentMethod: "card",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && !userLoading) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || "",
        firstName: user.user_metadata?.first_name || "",
        lastName: user.user_metadata?.last_name || "",
      }));
    }
  }, [user, userLoading]);

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, router]);

  useEffect(() => {
    updateAvailablePaymentMethods();
  }, [currency, formData.billingCountry]);

  useEffect(() => {
    setCurrency("GBP");
    setExchangeRate(1);
    setFormData((prev) => ({ ...prev, paymentMethod: "card" }));
  }, [setCurrency, setExchangeRate]);

  const updateAvailablePaymentMethods = () => {
    const methods = [
      {
        id: "card",
        name: "Credit / Debit Card",
        description: "Visa, Mastercard and American Express",
        icon: CreditCard,
        currencies: ["GBP"],
        color: "bg-slate-700",
      },
      {
        id: "apple_pay",
        name: "Apple Pay",
        description: "Fast checkout on an eligible Apple device",
        icon: Smartphone,
        currencies: ["GBP"],
        color: "bg-black",
        note: "When eligible",
      },
      {
        id: "paypal",
        name: "PayPal",
        description: "Pay securely with your PayPal account",
        icon: WalletCards,
        currencies: ["GBP"],
        color: "bg-[#4b5563]",
        note: "When enabled",
      },
    ];

    setAvailablePaymentMethods(methods);
    if (!methods.find((m) => m.id === formData.paymentMethod)) {
      setFormData((prev) => ({ ...prev, paymentMethod: methods[0].id }));
    }
  };

  const subtotal = getTotal();
  const shippingCost =
    formData.shippingMethod === "express" ? 9.99 : subtotal > 50 ? 0 : 4.99;
  const total = subtotal + shippingCost;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.email) newErrors.email = "Email is required";
      if (!formData.firstName) newErrors.firstName = "First name is required";
      if (!formData.lastName) newErrors.lastName = "Last name is required";
      if (!formData.phone) newErrors.phone = "Phone number is required";
    }
    if (step === 2) {
      if (!formData.billingAddress)
        newErrors.billingAddress = "Address is required";
      if (!formData.billingCity) newErrors.billingCity = "City is required";
      if (!formData.billingPostcode)
        newErrors.billingPostcode = "Postcode is required";
      if (!formData.sameAsBilling) {
        if (!formData.shippingAddress)
          newErrors.shippingAddress = "Shipping address is required";
        if (!formData.shippingCity)
          newErrors.shippingCity = "Shipping city is required";
        if (!formData.shippingPostcode)
          newErrors.shippingPostcode = "Shipping postcode is required";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(4, prev + 1));
      // Scroll to top on mobile
      if (window.innerWidth < 768) {
        window.scrollTo({ top: 104, behavior: "auto" });
      }
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    // Scroll to top on mobile
    if (window.innerWidth < 768) {
      window.scrollTo({ top: 104, behavior: "auto" });
    }
  };

  const createOrder = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionData?.session?.access_token ? { Authorization: `Bearer ${sessionData.session.access_token}` } : {}),
        },
        body: JSON.stringify({
          form: formData,
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            selectedLength: item.selectedLength || null,
            selectedColor: item.selectedColor || null,
          })),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not create order");
      return result.order;
    } catch (error) {
      console.error("Order creation error:", error);
      throw error;
    }
  };
  const handlePayment = async () => {
    if (!validateStep(4)) return;
    setLoading(true);

    try {
      const order = await createOrder();

      const paymentData = {
        orderId: order.id,
        orderNumber: order.order_number,
        customerEmail: formData.email,
        customerName: `${formData.firstName} ${formData.lastName}`,
        total,
        currency,
        paymentMethod: formData.paymentMethod,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.short_description || "",
          price: item.price,
          quantity: item.quantity,
          images: item.images || [],
        })),
        shipping: shippingCost,
        shippingMethod: formData.shippingMethod,
        billingCountry: formData.billingCountry,
      };

      // Legacy pre-payment email is disabled. Paid-order confirmations are sent by the verified webhook.
      if (process.env.NEXT_PUBLIC_SEND_PREPAYMENT_EMAIL === "true") {
      const emailResponse = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: formData.email,
          subject: `Order Confirmation - ${order.order_number}`,
          html: `
          <h2>Thank You for Your Order!</h2>
          <p>Dear ${formData.firstName},</p>
          <p>Your order <strong>#${
            order.order_number
          }</strong> has been successfully received. </p>
          <h3>Order Details:</h3>
          <ul>
            ${items
              .map(
                (item) => `
                  <li>
                    ${item.name} (${item.quantity}x) - ${formatPrice(
                  item.price * item.quantity,
                  currency,
                  exchangeRate
                )}
                  </li>
                `
              )
              .join("")}
          </ul>
          <p><strong>Subtotal:</strong> ${formatPrice(
            subtotal,
            currency,
            exchangeRate
          )}</p>
          <p><strong>Shipping:</strong> ${
            shippingCost === 0
              ? "Free"
              : formatPrice(shippingCost, currency, exchangeRate)
          }</p>
          <p><strong>Total:</strong> ${formatPrice(
            total,
            currency,
            exchangeRate
          )}</p>
          <p><strong>Shipping Address:</strong> ${
            formData.sameAsBilling
              ? formData.billingAddress
              : formData.shippingAddress
          }, ${
            formData.sameAsBilling
              ? formData.billingCity
              : formData.shippingCity
          }, ${
            formData.sameAsBilling
              ? formData.billingPostcode
              : formData.shippingPostcode
          }</p>
          <p>We’ll notify you once your order has shipped. Thank you for shopping with us!</p>
          <p>Best regards,<br>Dimplesluxe</p>
        `,
        }),
      });

      if (!emailResponse.ok) {
        throw new Error("Failed to send confirmation email");
      }
      }

      // Create Stripe checkout session after email is sent
      await createStripeCheckoutSession(paymentData);

      clearCart();
      toast.success("Redirecting to payment...");
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const steps = [
    {
      number: 1,
      title: "Contact",
      description: "Your details",
      icon: Package,
      shortTitle: "Contact",
    },
    {
      number: 2,
      title: "Address",
      description: "Billing & shipping",
      icon: Package,
      shortTitle: "Address",
    },
    {
      number: 3,
      title: "Shipping",
      description: "Delivery method",
      icon: Truck,
      shortTitle: "Shipping",
    },
    {
      number: 4,
      title: "Payment",
      description: "Complete order",
      icon: CreditCard,
      shortTitle: "Payment",
    },
  ];

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
        {/* Mobile Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Checkout
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Complete your order securely
          </p>
        </div>

        {/* Mobile Progress Steps */}
        <div className="mb-6 lg:hidden">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">
                Step {currentStep} of {steps.length}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {steps[currentStep - 1].shortTitle}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Desktop Progress Steps */}
        <div className="hidden lg:block mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-center">
              <div className="flex items-center">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div className="flex items-center">
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                          currentStep >= step.number
                            ? "bg-slate-700 border-slate-700 text-white"
                            : "border-gray-300 text-gray-500"
                        }`}
                      >
                        {currentStep > step.number ? (
                          <Check className="w-6 h-6" />
                        ) : (
                          <span className="text-base font-semibold">
                            {step.number}
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div
                          className={`text-base font-semibold ${
                            currentStep >= step.number
                              ? "text-slate-700"
                              : "text-gray-500"
                          }`}
                        >
                          {step.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {step.description}
                        </div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-16 h-1 mx-6 ${
                          currentStep > step.number
                            ? "bg-slate-700"
                            : "bg-gray-200"
                        } transition-all duration-300`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Order Summary Toggle */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowOrderSummary(!showOrderSummary)}
            className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <ShoppingBag className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">
                Order Summary ({items.length}{" "}
                {items.length === 1 ? "item" : "items"})
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="font-bold text-gray-900">
                {formatPrice(total, currency, exchangeRate)}
              </span>
              <ChevronRight
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                  showOrderSummary ? "rotate-90" : ""
                }`}
              />
            </div>
          </button>

          {/* Mobile Order Summary Dropdown */}
          <AnimatePresence>
            {showOrderSummary && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-2 p-4">
                  <MobileOrderSummary
                    items={items}
                    subtotal={subtotal}
                    shippingCost={shippingCost}
                    total={total}
                    currency={currency}
                    exchangeRate={exchangeRate}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Main Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStep === 1 && (
                    <ContactStep
                      formData={formData}
                      errors={errors}
                      handleInputChange={handleInputChange}
                    />
                  )}

                  {currentStep === 2 && (
                    <AddressStep
                      formData={formData}
                      errors={errors}
                      handleInputChange={handleInputChange}
                    />
                  )}

                  {currentStep === 3 && (
                    <ShippingStep
                      formData={formData}
                      handleInputChange={handleInputChange}
                      subtotal={subtotal}
                      currency={currency}
                      exchangeRate={exchangeRate}
                    />
                  )}

                  {currentStep === 4 && (
                    <PaymentStep
                      formData={formData}
                      handleInputChange={handleInputChange}
                      availablePaymentMethods={availablePaymentMethods}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row justify-between pt-6 lg:pt-8 border-t border-gray-100 space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </button>

                {currentStep < 4 ? (
                  <button
                    onClick={nextStep}
                    className="flex items-center justify-center px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl order-1 sm:order-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                ) : (
                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="flex items-center justify-center px-8 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl order-1 sm:order-2"
                  >
                    {loading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    <Lock className="w-4 h-4 mr-2" />
                    <span>
                      {loading
                        ? "Processing..."
                        : `Pay ${formatPrice(total, currency, exchangeRate)}`}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Order Summary */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <DesktopOrderSummary
                items={items}
                subtotal={subtotal}
                shippingCost={shippingCost}
                total={total}
                currency={currency}
                exchangeRate={exchangeRate}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Contact Step Component
function ContactStep({ formData, errors, handleInputChange }) {
  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        Contact Information
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 ${
              errors.firstName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter first name"
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 ${
              errors.lastName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter last name"
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter phone number"
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Address Step Component
function AddressStep({ formData, errors, handleInputChange }) {
  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        Addresses
      </h2>

      {/* Billing Address */}
      <div className="mb-6 sm:mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Billing Address
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <input
              type="text"
              value={formData.billingAddress}
              onChange={(e) =>
                handleInputChange("billingAddress", e.target.value)
              }
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 ${
                errors.billingAddress ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter street address"
            />
            {errors.billingAddress && (
              <p className="text-red-500 text-xs mt-1">
                {errors.billingAddress}
              </p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 2
            </label>
            <input
              type="text"
              value={formData.billingAddress2}
              onChange={(e) =>
                handleInputChange("billingAddress2", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
              placeholder="Apartment, suite, etc. (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              value={formData.billingCity}
              onChange={(e) => handleInputChange("billingCity", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 ${
                errors.billingCity ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter city"
            />
            {errors.billingCity && (
              <p className="text-red-500 text-xs mt-1">{errors.billingCity}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postcode *
            </label>
            <input
              type="text"
              value={formData.billingPostcode}
              onChange={(e) =>
                handleInputChange("billingPostcode", e.target.value)
              }
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 ${
                errors.billingPostcode ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter postcode"
            />
            {errors.billingPostcode && (
              <p className="text-red-500 text-xs mt-1">
                {errors.billingPostcode}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Same as Billing Checkbox */}
      <div className="mb-6">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.sameAsBilling}
            onChange={(e) =>
              handleInputChange("sameAsBilling", e.target.checked)
            }
            className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
          />
          <span className="ml-2 text-sm text-gray-700">
            Shipping address same as billing
          </span>
        </label>
      </div>

      {/* Shipping Address */}
      {!formData.sameAsBilling && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Shipping Address
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                value={formData.shippingAddress}
                onChange={(e) =>
                  handleInputChange("shippingAddress", e.target.value)
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 ${
                  errors.shippingAddress ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter street address"
              />
              {errors.shippingAddress && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.shippingAddress}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={formData.shippingCity}
                onChange={(e) =>
                  handleInputChange("shippingCity", e.target.value)
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 ${
                  errors.shippingCity ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter city"
              />
              {errors.shippingCity && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.shippingCity}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postcode *
              </label>
              <input
                type="text"
                value={formData.shippingPostcode}
                onChange={(e) =>
                  handleInputChange("shippingPostcode", e.target.value)
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 ${
                  errors.shippingPostcode ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter postcode"
              />
              {errors.shippingPostcode && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.shippingPostcode}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Shipping Step Component
function ShippingStep({
  formData,
  handleInputChange,
  subtotal,
  currency,
  exchangeRate,
}) {
  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        Shipping Method
      </h2>
      <div className="space-y-4">
        <label className="flex items-start p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all duration-200">
          <input
            type="radio"
            name="shipping"
            value="standard"
            checked={formData.shippingMethod === "standard"}
            onChange={(e) =>
              handleInputChange("shippingMethod", e.target.value)
            }
            className="w-4 h-4 text-pink-600 border-gray-300 focus:ring-pink-500 mt-1 flex-shrink-0"
          />
          <div className="ml-4 flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
              <div className="mb-2 sm:mb-0">
                <div className="text-base font-semibold text-gray-900">
                  Standard Delivery
                </div>
                <div className="text-sm text-gray-600">4-8 business days</div>
              </div>
              <div className="text-base font-semibold text-gray-900">
                {subtotal > 50
                  ? "Free"
                  : formatPrice(4.99, currency, exchangeRate)}
              </div>
            </div>
          </div>
        </label>

        <label className="flex items-start p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all duration-200">
          <input
            type="radio"
            name="shipping"
            value="express"
            checked={formData.shippingMethod === "express"}
            onChange={(e) =>
              handleInputChange("shippingMethod", e.target.value)
            }
            className="w-4 h-4 text-pink-600 border-gray-300 focus:ring-pink-500 mt-1 flex-shrink-0"
          />
        </label>
      </div>

      <div className="mt-6 flex items-start space-x-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
        <AlertCircle className="w-5 h-5 flex-shrink-0 text-gray-500 mt-0.5" />
        <span>
          All orders are fully tracked and insured for your peace of mind.
        </span>
      </div>
    </div>
  );
}

// Payment Step Component
function PaymentStep({ formData, handleInputChange, availablePaymentMethods }) {
  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        Payment Method
      </h2>

      <div className="mb-6 p-4 bg-pink-50 rounded-xl border border-pink-100">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
          <span className="text-base font-semibold text-pink-900">
            Secure Payment in British Pounds (£)
          </span>
        </div>
        <p className="text-sm text-pink-800">
          Continue to Stripe to complete payment with any method eligible for your device and location.
        </p>
      </div>

      <div className="space-y-4">
        {availablePaymentMethods.map((method) => {
          const IconComponent = method.icon;
          return (
            <label
              key={method.id}
              className={`flex cursor-pointer items-start rounded-xl border-2 p-4 transition-colors duration-200 hover:border-pink-200 hover:bg-gray-50 ${formData.paymentMethod === method.id ? "border-pink-500 bg-pink-50/40" : "border-gray-200"}`}
            >
              <input
                type="radio"
                name="payment"
                value={method.id}
                checked={formData.paymentMethod === method.id}
                onChange={(e) =>
                  handleInputChange("paymentMethod", e.target.value)
                }
                className="w-4 h-4 text-pink-600 border-gray-300 focus:ring-pink-500 mt-1 flex-shrink-0"
              />
              <div
                className={`w-12 h-12 ${method.color} rounded-xl flex items-center justify-center ml-4 flex-shrink-0`}
              >
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                  <div>
                    <div className="text-base font-semibold text-gray-900">
                      {method.name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {method.description}
                    </div>
                    {method.note && (
                      <span className="mt-2 inline-flex rounded-full bg-gray-100 px-2 py-1 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-gray-500">
                        {method.note}
                      </span>
                    )}
                  </div>
                  {formData.paymentMethod === method.id && (
                    <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 sm:mt-1 flex-shrink-0"></div>
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      <div className="mt-6 flex items-start space-x-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
        <Lock className="w-5 h-5 flex-shrink-0 text-gray-500 mt-0.5" />
        <span>
          Your payment information is encrypted and secure. We never store your
          card details. Apple Pay and PayPal are displayed by Stripe only when
          they are enabled and eligible for the customer.
        </span>
      </div>
    </div>
  );
}

function CheckoutProductImage({ item, sizes }) {
  const fallback = getRealisticFallback(item);
  const [source, setSource] = useState(() => getProductImage(item));

  useEffect(() => {
    setSource(getProductImage(item));
  }, [item]);

  return (
    <Image
      src={source}
      alt={item.name || "Dimplesluxe hair product"}
      fill
      sizes={sizes}
      className="object-cover"
      onError={() => {
        if (source !== fallback) setSource(fallback);
      }}
    />
  );
}

// Mobile Order Summary Component
function MobileOrderSummary({
  items,
  subtotal,
  shippingCost,
  total,
  currency,
  exchangeRate,
}) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-4">Items in your order</h3>

      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center space-x-3">
            <div className="w-12 h-12 relative rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
              <CheckoutProductImage item={item} sizes="48px" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {item.name}
              </div>
              <div className="text-xs text-gray-600">
                {item.selectedLength && `${item.selectedLength}" • `}
                {item.selectedColor} • Qty: {item.quantity}
              </div>
            </div>
            <div className="text-sm font-medium text-gray-900">
              {formatPrice(item.price * item.quantity, currency, exchangeRate)}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 border-t border-gray-200 pt-4">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal, currency, exchangeRate)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Shipping</span>
          <span>
            {shippingCost === 0 ? (
              <span className="text-green-600 font-medium">Free</span>
            ) : (
              formatPrice(shippingCost, currency, exchangeRate)
            )}
          </span>
        </div>
        <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-2">
          <span>Total</span>
          <span>{formatPrice(total, currency, exchangeRate)}</span>
        </div>
      </div>
    </div>
  );
}

// Desktop Order Summary Component
function DesktopOrderSummary({
  items,
  subtotal,
  shippingCost,
  total,
  currency,
  exchangeRate,
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex items-center space-x-4">
            <div className="w-16 h-16 relative rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
              <CheckoutProductImage item={item} sizes="64px" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-semibold text-gray-900 truncate">
                {item.name}
              </div>
              <div className="text-sm text-gray-600">
                {item.selectedLength && `${item.selectedLength}" • `}
                {item.selectedColor}
              </div>
              <div className="text-sm text-gray-900">Qty: {item.quantity}</div>
            </div>
            <div className="text-base font-semibold text-gray-900">
              {formatPrice(item.price * item.quantity, currency, exchangeRate)}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 mb-6 border-t border-gray-100 pt-4">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal, currency, exchangeRate)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span>
            {shippingCost === 0 ? (
              <span className="text-green-600 font-semibold">Free</span>
            ) : (
              formatPrice(shippingCost, currency, exchangeRate)
            )}
          </span>
        </div>
        {subtotal < 50 && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            Spend {formatPrice(50 - subtotal, currency, exchangeRate)} more for
            free shipping
          </div>
        )}
      </div>

      <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-4">
        <span>Total</span>
        <span>{formatPrice(total, currency, exchangeRate)}</span>
      </div>

      <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-gray-500">
        <Lock className="w-3 h-3" />
        <span>Secured by SSL encryption</span>
      </div>
    </div>
  );
}
