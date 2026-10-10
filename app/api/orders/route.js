import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "../../../lib/supabase";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value, max = 250) => String(value || "").trim().slice(0, max);

export async function POST(request) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Secure order service is not configured" }, { status: 503 });
    }

    const payload = await request.json();
    const form = payload.form || {};
    const requestedItems = Array.isArray(payload.items) ? payload.items : [];
    const productIds = [...new Set(requestedItems.map((item) => item.id).filter(Boolean))];
    const email = clean(form.email, 254).toLowerCase();

    if (
      !emailPattern.test(email) ||
      !clean(form.firstName, 80) ||
      !clean(form.lastName, 80) ||
      !clean(form.phone, 40) ||
      !clean(form.billingAddress) ||
      !clean(form.billingCity, 100) ||
      !clean(form.billingPostcode, 30) ||
      !productIds.length
    ) {
      return NextResponse.json({ error: "Please complete every required checkout field" }, { status: 400 });
    }

    const publicDatabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    const { data: products, error: productError } = await publicDatabase
      .from("products")
      .select("id, name, slug, price, stock, is_active")
      .in("id", productIds)
      .eq("is_active", true);
    if (productError) throw productError;
    if (!products || products.length !== productIds.length) {
      return NextResponse.json({ error: "One or more products are no longer available" }, { status: 409 });
    }

    const productMap = new Map(products.map((product) => [product.id, product]));
    const verifiedItems = requestedItems.map((item) => {
      const product = productMap.get(item.id);
      const quantity = Math.max(1, Math.min(20, Number.parseInt(item.quantity, 10) || 1));
      if (!product) throw new Error("Product validation failed");
      if (Number(product.stock) > 0 && quantity > Number(product.stock)) {
        throw new Error(`${product.name} does not have enough stock for that quantity`);
      }
      return { product, quantity, selectedLength: clean(item.selectedLength, 40) || null, selectedColor: clean(item.selectedColor, 80) || null };
    });

    const subtotal = verifiedItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
    const shippingCost = form.shippingMethod === "express" ? 9.99 : subtotal > 50 ? 0 : 4.99;
    const total = subtotal + shippingCost;
    const sameAsBilling = form.sameAsBilling !== false;
    const database = createServerSupabaseClient();

    let userId = null;
    const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (bearer) {
      const { data } = await database.auth.getUser(bearer);
      userId = data?.user?.id || null;
    }

    const orderNumber = `DLX${Date.now()}${Math.floor(Math.random() * 900 + 100)}`;
    const orderRecord = {
      order_number: orderNumber,
      user_id: userId,
      status: "pending",
      subtotal: Number(subtotal.toFixed(2)),
      shipping_cost: Number(shippingCost.toFixed(2)),
      total: Number(total.toFixed(2)),
      currency: "GBP",
      exchange_rate: 1,
      customer_name: `${clean(form.firstName, 80)} ${clean(form.lastName, 80)}`,
      customer_email: email,
      customer_phone: clean(form.phone, 40),
      billing_address_line1: clean(form.billingAddress),
      billing_address_line2: clean(form.billingAddress2) || null,
      billing_city: clean(form.billingCity, 100),
      billing_postcode: clean(form.billingPostcode, 30),
      billing_country: clean(form.billingCountry, 2).toUpperCase() || "GB",
      shipping_address_line1: clean(sameAsBilling ? form.billingAddress : form.shippingAddress),
      shipping_address_line2: clean(sameAsBilling ? form.billingAddress2 : form.shippingAddress2) || null,
      shipping_city: clean(sameAsBilling ? form.billingCity : form.shippingCity, 100),
      shipping_postcode: clean(sameAsBilling ? form.billingPostcode : form.shippingPostcode, 30),
      shipping_country: clean(sameAsBilling ? form.billingCountry : form.shippingCountry, 2).toUpperCase() || "GB",
      shipping_method: form.shippingMethod === "express" ? "express" : "standard",
      payment_method: ["card", "apple_pay", "paypal"].includes(form.paymentMethod) ? form.paymentMethod : "card",
    };

    const { data: order, error: orderError } = await database.from("orders").insert(orderRecord).select("id, order_number").single();
    if (orderError) throw orderError;

    const itemRecords = verifiedItems.map(({ product, quantity, selectedLength, selectedColor }) => ({
      order_id: order.id,
      product_id: product.id,
      product_name: product.name,
      product_slug: product.slug,
      quantity,
      unit_price: Number(product.price),
      total_price: Number((Number(product.price) * quantity).toFixed(2)),
      selected_length: selectedLength,
      selected_color: selectedColor,
    }));
    const { error: itemsError } = await database.from("order_items").insert(itemRecords);
    if (itemsError) {
      await database.from("orders").delete().eq("id", order.id);
      throw itemsError;
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Secure order creation failed:", error.message);
    return NextResponse.json({ error: error.message || "Could not create order" }, { status: 500 });
  }
}
