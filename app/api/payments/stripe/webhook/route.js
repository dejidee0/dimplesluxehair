import { NextResponse } from "next/server";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import { createServerSupabaseClient } from "../../../../../lib/supabase";
import { formatPrice } from "../../../../../lib/currency";

export const runtime = "nodejs";

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const paymentIntentIdFrom = (session) =>
  typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id;

async function sendPaidOrderEmails({ order, items, session }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Paid-order email skipped because email credentials are missing.");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  const currency = (session.currency || order.currency || "GBP").toUpperCase();
  const total = Number(session.amount_total || 0) / 100;
  const shipping = Number(session.shipping_cost?.amount_total || 0) / 100;
  const itemRows = (items || [])
    .map(
      (item) =>
        `<li>${escapeHtml(item.product_name)} (${Number(item.quantity) || 1}×) — ${escapeHtml(
          formatPrice(Number(item.total_price), currency, 1)
        )}</li>`
    )
    .join("");
  const shippingAddress = [
    order.shipping_address_line1,
    order.shipping_address_line2,
    order.shipping_city,
    order.shipping_state,
    order.shipping_postcode,
    order.shipping_country,
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join(", ");

  const customerHtml = `
    <h2>Thank you for your Dimplesluxe order</h2>
    <p>Dear ${escapeHtml(order.customer_name)},</p>
    <p>Your payment for order <strong>#${escapeHtml(order.order_number)}</strong> has been confirmed.</p>
    <h3>Order details</h3>
    <ul>${itemRows}</ul>
    <p><strong>Shipping:</strong> ${shipping === 0 ? "Free" : escapeHtml(formatPrice(shipping, currency, 1))}</p>
    <p><strong>Total paid:</strong> ${escapeHtml(formatPrice(total, currency, 1))}</p>
    <p><strong>Delivery address:</strong> ${shippingAddress}</p>
    <p>We’ll email you again when your order ships.</p>
    <p>Dimplesluxe — The Hair Destination</p>`;

  const ownerHtml = `
    <h2>New paid Dimplesluxe order</h2>
    <p><strong>Order:</strong> #${escapeHtml(order.order_number)}</p>
    <p><strong>Customer:</strong> ${escapeHtml(order.customer_name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(order.customer_email)}</p>
    <p><strong>Total paid:</strong> ${escapeHtml(formatPrice(total, currency, 1))}</p>
    <p><strong>Delivery address:</strong> ${shippingAddress}</p>
    <p>Open the admin dashboard for the complete order and fulfilment controls.</p>`;

  const from = `"Dimplesluxe" <${process.env.EMAIL_USER}>`;
  const results = await Promise.allSettled([
    transporter.sendMail({
      from,
      to: order.customer_email,
      subject: `Order confirmed — ${order.order_number}`,
      html: customerHtml,
    }),
    transporter.sendMail({
      from,
      to: process.env.ORDER_NOTIFICATION_EMAIL || "dimplesluxe@gmail.com",
      replyTo: order.customer_email,
      subject: `New paid order — ${order.order_number}`,
      html: ownerHtml,
    }),
  ]);

  for (const result of results) {
    if (result.status === "rejected") console.error("Paid-order email failed:", result.reason?.message);
  }
}

export async function POST(request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe webhook is not configured" }, { status: 503 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  try {
    const supabase = createServerSupabaseClient();

    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      const paymentIntentId = paymentIntentIdFrom(session);

      if (!orderId || !paymentIntentId) throw new Error("Stripe session is missing order metadata");

      if (session.payment_status === "unpaid") {
        return NextResponse.json({ received: true, pending: true });
      }

      const { data: existingPayment } = await supabase
        .from("payments")
        .select("id")
        .eq("payment_intent_id", paymentIntentId)
        .maybeSingle();

      const { data: order, error: orderFetchError } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, customer_email, currency, shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_postcode, shipping_country")
        .eq("id", orderId)
        .single();

      if (orderFetchError || !order) throw orderFetchError || new Error("Order not found");

      const { error: orderUpdateError } = await supabase
        .from("orders")
        .update({ status: "confirmed", updated_at: new Date().toISOString() })
        .eq("id", orderId);
      if (orderUpdateError) throw orderUpdateError;

      if (!existingPayment) {
        const { error: paymentError } = await supabase.from("payments").insert({
          order_id: orderId,
          payment_intent_id: paymentIntentId,
          provider: "stripe",
          method: session.metadata?.paymentMethod || "card",
          amount: Number(session.amount_total || 0) / 100,
          currency: (session.currency || "gbp").toUpperCase(),
          status: "succeeded",
        });
        if (paymentError) throw paymentError;

        const { data: items, error: itemsError } = await supabase
          .from("order_items")
          .select("product_id, product_name, quantity, total_price")
          .eq("order_id", orderId);
        if (itemsError) throw itemsError;

        for (const item of items || []) {
          if (!item.product_id) continue;
          const { data: product } = await supabase.from("products").select("stock").eq("id", item.product_id).single();
          if (product) {
            const nextStock = Math.max(0, Number(product.stock || 0) - Number(item.quantity || 0));
            const { error: stockError } = await supabase.from("products").update({ stock: nextStock }).eq("id", item.product_id);
            if (stockError) console.error("Stock update failed:", stockError.message);
          }
        }

        await sendPaidOrderEmails({ order, items, session });
      }
    } else if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object;
      const paymentIntentId = paymentIntentIdFrom(session);
      if (paymentIntentId) {
        await supabase
          .from("payments")
          .update({
            status: "failed",
            failure_reason: "The asynchronous payment did not complete.",
            updated_at: new Date().toISOString(),
          })
          .eq("payment_intent_id", paymentIntentId);
      }
    } else if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object;
      await supabase
        .from("payments")
        .update({
          status: "failed",
          failure_reason: intent.last_payment_error?.message || "Payment failed",
          updated_at: new Date().toISOString(),
        })
        .eq("payment_intent_id", intent.id);
    } else if (event.type === "charge.dispute.created") {
      console.error(`Stripe dispute opened: ${event.data.object.id}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing failed:", error.message);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
