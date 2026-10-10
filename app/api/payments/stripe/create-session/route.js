import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function checkoutBaseUrl(request) {
  const configured = process.env.NEXT_PUBLIC_BASE_URL;
  const origin = request.nextUrl?.origin;
  const candidate = origin?.includes("localhost") || origin?.includes("127.0.0.1") ? origin : configured || origin;
  const url = new URL(candidate);
  if (url.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(url.hostname)) {
    throw new Error("Checkout return URL must use HTTPS");
  }
  return url.origin;
}

function imageUrls(images = []) {
  return images
    .filter((image) => !image?.is_video)
    .sort((a, b) => Number(b?.is_primary) - Number(a?.is_primary) || Number(a?.sort_order || 0) - Number(b?.sort_order || 0))
    .map((image) => image?.image_url)
    .filter((url) => typeof url === "string" && /^https:\/\//i.test(url))
    .slice(0, 8);
}

export async function POST(request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
    }

    const orderData = await request.json();
    const email = String(orderData.customerEmail || "").trim().toLowerCase();
    const requestedItems = Array.isArray(orderData.items) ? orderData.items : [];
    const productIds = [...new Set(requestedItems.map((item) => item.id).filter(Boolean))];

    if (!orderData.orderId || !orderData.orderNumber || !emailPattern.test(email) || !productIds.length) {
      return NextResponse.json({ error: "Incomplete checkout request" }, { status: 400 });
    }

    const database = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    const { data: products, error: productsError } = await database
      .from("products")
      .select("id, name, short_description, price, is_active, images:product_images(image_url, is_primary, sort_order, is_video)")
      .in("id", productIds)
      .eq("is_active", true);

    if (productsError) throw productsError;
    if (!products || products.length !== productIds.length) {
      return NextResponse.json({ error: "One or more products are no longer available" }, { status: 409 });
    }

    const productMap = new Map(products.map((product) => [product.id, product]));
    const verifiedItems = requestedItems.map((item) => {
      const product = productMap.get(item.id);
      if (!product) throw new Error("Product validation failed");
      return {
        product,
        quantity: Math.max(1, Math.min(20, Number.parseInt(item.quantity, 10) || 1)),
      };
    });
    const subtotal = verifiedItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
    const shipping = orderData.shippingMethod === "express" ? 9.99 : subtotal > 50 ? 0 : 4.99;
    const currency = "gbp";
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const baseUrl = checkoutBaseUrl(request);

    const session = await stripe.checkout.sessions.create({
      line_items: verifiedItems.map(({ product, quantity }) => ({
        price_data: {
          currency,
          product_data: {
            name: product.name,
            description: product.short_description || "Premium hair product from Dimplesluxe",
            images: imageUrls(product.images),
            metadata: { product_id: product.id },
          },
          unit_amount: Math.round(Number(product.price) * 100),
        },
        quantity,
      })),
      ...(shipping > 0 && {
        shipping_options: [{
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: Math.round(shipping * 100), currency },
            display_name: orderData.shippingMethod === "express" ? "Express Delivery" : "Standard Delivery",
            delivery_estimate: {
              minimum: { unit: "business_day", value: orderData.shippingMethod === "express" ? 1 : 3 },
              maximum: { unit: "business_day", value: orderData.shippingMethod === "express" ? 2 : 5 },
            },
          },
        }],
      }),
      mode: "payment",
      success_url: `${baseUrl}/order-confirmation/${encodeURIComponent(orderData.orderNumber)}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout?cancelled=true`,
      customer_email: email,
      metadata: {
        orderId: String(orderData.orderId),
        orderNumber: String(orderData.orderNumber),
        customerName: String(orderData.customerName || "Customer").slice(0, 120),
        paymentMethod: "stripe_checkout",
        preferredPaymentMethod: String(orderData.paymentMethod || "card").slice(0, 40),
        shippingMethod: String(orderData.shippingMethod || "standard").slice(0, 40),
        source: "dimplesluxe_website",
      },
      billing_address_collection: "required",
      shipping_address_collection: { allowed_countries: ["GB", "US", "CA", "AU", "IE", "FR", "DE", "ES", "IT", "NL"] },
      custom_text: {
        shipping_address: { message: "We’ll deliver your Dimplesluxe order to this address." },
        submit: { message: "Complete your Dimplesluxe order securely" },
      },
      expires_at: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      phone_number_collection: { enabled: true },
    });

    return NextResponse.json({ id: session.id, url: session.url, payment_methods: ["dynamic"] });
  } catch (error) {
    console.error("Stripe session creation error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to create payment session", code: error.code || "checkout_error" },
      { status: 500 }
    );
  }
}
