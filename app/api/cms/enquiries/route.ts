export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";
import { sendEnquiryEmails } from "@/lib/email";

// GET — admin only
export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status");
    const enquiries = await db.enquiry.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(enquiries);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch enquiries" },
      { status: 500 }
    );
  }
}

// PATCH — admin only
export async function PATCH(req: NextRequest) {
  try {
    const adminId = req.headers.get("x-admin-id");
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing id or status" },
        { status: 400 }
      );
    }
    const e = await db.enquiry.update({ where: { id }, data: { status } });
    await audit(adminId, "UPDATE", "Enquiry", id, { status }, ip);
    return NextResponse.json({ ok: true, enquiry: e });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// POST — PUBLIC (no auth required)
export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    const { name, phone, email, productName, message } =
      body as Record<string, string>;

    if (!name?.trim() || !phone?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Name, phone and message are required" },
        { status: 400 }
      );
    }

    const e = await db.enquiry.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        productName: productName?.trim() || null,
        message: message.trim(),
        status: "new",
      },
    });

    // Send emails non-blocking
    sendEnquiryEmails({
      name: e.name,
      phone: e.phone,
      email: e.email,
      productName: e.productName,
      message: e.message,
    }).catch((err) => console.error("Email error:", err));

    return NextResponse.json({ ok: true, id: e.id }, { status: 201 });
  } catch (err) {
    console.error("POST enquiry error:", err);
    return NextResponse.json(
      { error: "Failed to submit enquiry" },
      { status: 500 }
    );
  }
}