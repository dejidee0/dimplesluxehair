import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    if (!process.env.INTERNAL_API_SECRET || request.headers.get("x-internal-secret") !== process.env.INTERNAL_API_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { to, subject, html } = await request.json();

    if (!to || !subject || !html || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json({ error: "Invalid email request" }, { status: 400 });
    }

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: `"Dimplesluxe" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error.message);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
