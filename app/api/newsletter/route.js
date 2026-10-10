import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createServerSupabaseClient } from "../../../lib/supabase";

const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const payload = await request.json();
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase().slice(0, 254) : "";

    if (!validEmail.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    let stored = false;
    let notified = false;

    try {
      const database = createServerSupabaseClient();
      const { error: storageError } = await database
        .from("newsletter_subscribers")
        .upsert({ email, source: "homepage", status: "subscribed", updated_at: new Date().toISOString() }, { onConflict: "email" });
      if (storageError) throw storageError;
      stored = true;
    } catch (storageError) {
      console.error("Newsletter subscription could not be stored:", storageError.message);
    }

    // 2. Try sending notification email to dimplesluxe@gmail.com
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });
        await transporter.sendMail({
          from: `"Dimplesluxe Website" <${process.env.EMAIL_USER}>`,
          to: process.env.BACKEND_NOTIFICATION_EMAIL || "dimplesluxe@gmail.com",
          replyTo: email,
          subject: `New Dimplesluxe VIP drop signup — ${email}`,
          html: `<h2>New Dimplesluxe VIP Subscriber</h2><p><strong>Email:</strong> ${email}</p><p><strong>Source:</strong> Homepage — New drops. Hair notes. No noise.</p><p><strong>Date:</strong> ${new Date().toUTCString()}</p>`,
        });
        notified = true;
      } catch (emailErr) {
        console.warn("Newsletter email notification skipped:", emailErr.message);
      }
    }

    if (!stored) {
      return NextResponse.json(
        { error: "We could not save your subscription. Please try again shortly.", notified },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        message: "You’re on the list. Welcome to Dimplesluxe.",
        stored,
        notified,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unable to add newsletter subscriber", error);
    return NextResponse.json({ error: "We could not add you just now." }, { status: 500 });
  }
}
