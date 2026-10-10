"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Mail, Phone, MapPin, Clock, Send, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      question: "How long does shipping take?",
      answer:
        "Standard shipping takes 3-5 business days within the UK. Express shipping is available for 1-2 business days. International shipping varies by location.",
    },
    {
      question: "What is your return policy?",
      answer:
        "We offer a 30-day money-back guarantee. Items must be in original condition and packaging. Please contact us to initiate a return.",
    },
    {
      question: "How do I care for my hair extensions?",
      answer:
        "Wash with sulfate-free shampoo, use deep conditioner weekly, avoid excessive heat, and store properly when not in use. Full care instructions are included with your order.",
    },
    {
      question: "Do you offer international shipping?",
      answer:
        "Yes! We ship worldwide. Shipping costs and delivery times vary by location. All international orders are fully tracked.",
    },
    {
      question: "Can I dye or bleach the hair?",
      answer:
        "Yes, our 100% virgin human hair can be dyed, bleached, and styled just like your natural hair. We recommend professional coloring for best results.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards, Apple Pay, and Paystack for Nigerian customers. All payments are secure and encrypted.",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-primary-50 to-rose-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
                Get in <span className="gradient-text">Touch</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                Have questions about our products or need assistance? We're here
                to help! Reach out to our friendly customer service team.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="bg-white rounded-2xl shadow-luxury p-6 sm:p-8">
                <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                  Send us a Message
                </h2>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) =>
                        handleInputChange("subject", e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base"
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="product-inquiry">Product Inquiry</option>
                      <option value="order-support">Order Support</option>
                      <option value="shipping">Shipping Question</option>
                      <option value="returns">Returns & Exchanges</option>
                      <option value="technical">Technical Support</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) =>
                        handleInputChange("message", e.target.value)
                      }
                      rows={6}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none text-sm sm:text-base"
                      placeholder="Tell us how we can help you..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">
                      {loading ? "Sending..." : "Send Message"}
                    </span>
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Contact Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6 sm:space-y-8"
            >
              <div>
                <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Contact Information
                </h2>
                <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
                  We're here to help! Reach out via email or phone, and we'll
                  get back to you as soon as possible.
                </p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-6 bg-white rounded-2xl shadow-lg">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                      Email Support
                    </h3>
                    <p className="text-gray-600 mb-1 sm:mb-2 text-sm sm:text-base">
                      dimplesluxe@gmail.com
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      We respond within 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-6 bg-white rounded-2xl shadow-lg">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                      Business Hours
                    </h3>
                    <p className="text-gray-600 mb-1 sm:mb-2 text-sm sm:text-base">
                      Monday - Sunday: 8AM - 8PM GMT
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              Find quick answers to common questions about our products and
              services
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <details className="group">
                  <summary className="flex items-center justify-between p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 flex-shrink-0" />
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                        {faq.question}
                      </h3>
                    </div>
                    <div className="transform group-open:rotate-180 transition-transform">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </summary>
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <p className="text-gray-600 leading-relaxed ml-8 sm:ml-10 text-sm sm:text-base">
                      {faq.answer}
                    </p>
                  </div>
                </details>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
