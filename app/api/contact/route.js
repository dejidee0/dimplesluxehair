import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createServerSupabaseClient } from "../../../lib/supabase";

const clean = (value, max = 2000) => typeof value === "string" ? value.trim().slice(0, max) : "";
const escapeHtml = (value) => value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);

export async function POST(request) {
  try {
    const payload = await request.json();
    const name = clean(payload.name, 120);
    const email = clean(payload.email, 254).toLowerCase();
    const subject = clean(payload.subject, 160);
    const message = clean(payload.message, 4000);

    if (!name || !subject || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please complete every field with a valid email address." }, { status: 400 });
    }

    let stored = false;
    let sent = false;

    try {
      const database = createServerSupabaseClient();
      const { error: storageError } = await database.from("contact_messages").insert({
        name,
        email,
        subject,
        message,
      });
      if (storageError) throw storageError;
      stored = true;
    } catch (storageError) {
      console.error("Contact request could not be stored:", storageError.message);
    }

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });
        await transporter.sendMail({
          from: `"Dimplesluxe Website" <${process.env.EMAIL_USER}>`,
          to: process.env.CONTACT_EMAIL || "dimplesluxe@gmail.com",
          replyTo: email,
          subject: `Website contact — ${subject}`,
          html: `<h2>New website contact</h2><p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Subject:</strong> ${escapeHtml(subject)}</p><p><strong>Message:</strong><br>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
        });
        sent = true;
      } catch (mailErr) {
        console.warn("Mail send error:", mailErr.message);
      }
    }

    if (!stored && !sent) {
      return NextResponse.json(
        { error: "We could not safely deliver your message. Please email dimplesluxe@gmail.com directly." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        message: stored ? "Message received and saved." : "Message delivered by email.",
        stored,
        sent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unable to send contact request", error);
    return NextResponse.json({ error: "We could not send your message. Please try again." }, { status: 500 });
  }
}
