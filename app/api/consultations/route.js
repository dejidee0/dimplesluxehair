import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "../../../lib/supabase";

const clean = (value, max = 2000) => typeof value === "string" ? value.trim().slice(0, max) : "";
const escapeHtml = (value) => value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);

export async function POST(request) {
  try {
    const payload = await request.json();
    const customerName = clean(payload.customerName, 120);
    const customerEmail = clean(payload.customerEmail, 254).toLowerCase();

    if (!customerName || !customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return NextResponse.json({ error: "Please provide your name and a valid email address." }, { status: 400 });
    }

    const fields = [
      ["Name", customerName],
      ["Email", customerEmail],
      ["Phone / WhatsApp", clean(payload.customerPhone, 50)],
      ["Desired look", clean(payload.desiredLook, 300)],
      ["Texture", clean(payload.preferredTexture, 100)],
      ["Length", clean(payload.preferredLength, 30)],
      ["Budget", clean(payload.budget, 100)],
      ["Preferred contact", clean(payload.contactPreference, 30)],
      ["Notes", clean(payload.notes, 3000)],
    ].filter(([, value]) => value);

    let stored = false;
    let sent = false;

    try {
      const database = createServerSupabaseClient();
      const { error: storageError } = await database.from("consultation_requests").insert({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: clean(payload.customerPhone, 50) || null,
        desired_look: clean(payload.desiredLook, 300) || null,
        preferred_texture: clean(payload.preferredTexture, 100) || null,
        preferred_length: clean(payload.preferredLength, 30) || null,
        budget: clean(payload.budget, 100) || null,
        contact_preference: clean(payload.contactPreference, 30) || "Email",
        notes: clean(payload.notes, 3000) || null,
      });
      if (storageError) throw storageError;
      stored = true;
    } catch (storageError) {
      console.error("Concierge request could not be stored:", storageError.message);
    }

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        await transporter.sendMail({
          from: `"Dimplesluxe Concierge" <${process.env.EMAIL_USER}>`,
          to: process.env.CONCIERGE_EMAIL || "dimplesluxe@gmail.com",
          replyTo: customerEmail,
          subject: `New concierge request — ${customerName}`,
          html: `<h2>New Dimplesluxe concierge request</h2><table>${fields.map(([label, value]) => `<tr><th align="left" style="padding:6px 16px 6px 0">${escapeHtml(label)}</th><td style="padding:6px 0">${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`).join("")}</table>`,
        });
        sent = true;
      } catch (mailErr) {
        console.warn("Concierge email dispatch note:", mailErr.message);
      }
    }

    if (!stored && !sent) {
      return NextResponse.json(
        { error: "We could not safely deliver this request. Please email dimplesluxe@gmail.com directly." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        message: stored ? "Consultation request received and saved." : "Consultation request delivered by email.",
        stored,
        sent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unable to send consultation request", error);
    return NextResponse.json({ error: "We could not send your request. Please try again." }, { status: 500 });
  }
}
