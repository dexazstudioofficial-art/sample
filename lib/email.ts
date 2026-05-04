import nodemailer from "nodemailer";
import { db } from "./db";

// ─── SMTP transporter (credentials from .env — never in DB) ──
function createTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || "smtp.gmail.com",
    port:   parseInt(process.env.SMTP_PORT || "465"),
    secure: true,
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
  });
}

// ─── Get setting from DB with fallback ───────────────────
async function getSetting(key: string, fallback = ""): Promise<string> {
  try {
    const s = await db.siteSettings.findUnique({ where: { key } });
    return s?.value || fallback;
  } catch {
    return fallback;
  }
}

// ─── HTML templates ──────────────────────────────────────
function adminEnquiryHtml(data: {
  name: string; phone: string; email: string;
  productName: string; message: string; timestamp: string;
  siteName: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .card { background: #fff; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; }
    .header { background: #111; color: #fff; padding: 24px 32px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 900; letter-spacing: 0.1em; }
    .header p { margin: 4px 0 0; font-size: 12px; opacity: 0.6; }
    .body { padding: 32px; }
    .row { display: flex; border-bottom: 1px solid #eee; padding: 12px 0; }
    .row:last-child { border-bottom: none; }
    .label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #888; width: 140px; flex-shrink: 0; }
    .value { font-size: 14px; color: #111; flex: 1; }
    .message-box { background: #f9f9f9; border: 1px solid #eee; padding: 16px; border-radius: 4px; font-size: 14px; line-height: 1.6; margin-top: 20px; }
    .footer { padding: 16px 32px; background: #f9f9f9; font-size: 11px; color: #999; text-align: center; }
    .badge { display: inline-block; background: #111; color: #fff; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 2px; text-transform: uppercase; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>${data.siteName}</h1>
      <p>New Enquiry Received</p>
    </div>
    <div class="body">
      <div class="badge">New Enquiry</div>
      <div class="row"><span class="label">Name</span><span class="value">${data.name}</span></div>
      <div class="row"><span class="label">Phone</span><span class="value">${data.phone}</span></div>
      <div class="row"><span class="label">Email</span><span class="value">${data.email || "Not provided"}</span></div>
      <div class="row"><span class="label">Product</span><span class="value">${data.productName || "General enquiry"}</span></div>
      <div class="row"><span class="label">Received</span><span class="value">${data.timestamp}</span></div>
      <div class="message-box"><strong>Message:</strong><br/><br/>${data.message.replace(/\n/g, "<br/>")}</div>
    </div>
    <div class="footer">This email was sent automatically by ${data.siteName} website.</div>
  </div>
</body>
</html>`;
}

function customerConfirmationHtml(data: {
  name: string; productName: string; siteName: string;
  sitePhone: string; siteEmail: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .card { background: #fff; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; }
    .header { background: #111; color: #fff; padding: 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 0.1em; }
    .body { padding: 32px; text-align: center; }
    .icon { font-size: 48px; margin-bottom: 16px; }
    .body h2 { font-size: 20px; font-weight: 900; color: #111; margin: 0 0 12px; }
    .body p { font-size: 14px; color: #555; line-height: 1.7; margin: 0 0 24px; }
    .info-box { background: #f9f9f9; border: 1px solid #eee; padding: 20px; border-radius: 4px; text-align: left; margin: 24px 0; }
    .info-box p { margin: 6px 0; font-size: 13px; color: #444; }
    .info-box strong { color: #111; }
    .footer { padding: 16px 32px; background: #f9f9f9; font-size: 11px; color: #999; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header"><h1>${data.siteName}</h1></div>
    <div class="body">
      <div class="icon">✅</div>
      <h2>Thank you, ${data.name}!</h2>
      <p>We have received your enquiry${data.productName ? ` about <strong>${data.productName}</strong>` : ""} and our team will get back to you within <strong>24 hours</strong>.</p>
      <div class="info-box">
        <p><strong>📞 Call us:</strong> ${data.sitePhone}</p>
        <p><strong>📧 Email us:</strong> ${data.siteEmail}</p>
        <p><strong>🕐 Working hours:</strong> Mon–Sat, 9 AM – 6 PM</p>
      </div>
      <p style="font-size: 12px; color: #999;">If this was not you, please ignore this email.</p>
    </div>
    <div class="footer">© ${new Date().getFullYear()} ${data.siteName}. All rights reserved.</div>
  </div>
</body>
</html>`;
}

// ─── Main send function ───────────────────────────────────
export async function sendEnquiryEmails(enquiry: {
  name: string; phone: string; email?: string | null;
  productName?: string | null; message: string;
}) {
  // Check SMTP is configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("Email: SMTP_USER or SMTP_PASS not set — skipping email send");
    return { ok: false, reason: "SMTP not configured" };
  }

  // Get dynamic settings from DB
  const [siteName, adminEmail, sitePhone, siteEmail, fromName, fromAddress] =
    await Promise.all([
      getSetting("site_name",       "SAM Enterprises"),
      getSetting("admin_email",     process.env.ADMIN_EMAIL || ""),
      getSetting("phone_primary",   ""),
      getSetting("email_info",      ""),
      getSetting("email_from_name", "SAM Enterprises"),
      getSetting("email_from_address", process.env.SMTP_USER || ""),
    ]);

  if (!adminEmail) {
    console.warn("Email: admin_email not set in SiteSettings — skipping admin notification");
  }

  const transporter = createTransporter();
  const fromField   = `${fromName} <${fromAddress}>`;
  const timestamp   = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "short",
  });

  const results: { type: string; ok: boolean; error?: string }[] = [];

  // 1. Send to admin
  if (adminEmail) {
    try {
      await transporter.sendMail({
        from:    fromField,
        to:      adminEmail,
        subject: `🔔 New Enquiry from ${enquiry.name} — ${siteName}`,
        html:    adminEnquiryHtml({
          name:        enquiry.name,
          phone:       enquiry.phone,
          email:       enquiry.email || "",
          productName: enquiry.productName || "",
          message:     enquiry.message,
          timestamp,
          siteName,
        }),
      });
      results.push({ type: "admin", ok: true });
    } catch (err) {
      console.error("Email: Failed to send admin notification:", err);
      results.push({ type: "admin", ok: false, error: String(err) });
    }
  }

  // 2. Send to customer (only if email provided)
  if (enquiry.email) {
    try {
      await transporter.sendMail({
        from:    fromField,
        to:      enquiry.email,
        subject: `We received your enquiry — ${siteName}`,
        html:    customerConfirmationHtml({
          name:        enquiry.name,
          productName: enquiry.productName || "",
          siteName,
          sitePhone,
          siteEmail,
        }),
      });
      results.push({ type: "customer", ok: true });
    } catch (err) {
      console.error("Email: Failed to send customer confirmation:", err);
      results.push({ type: "customer", ok: false, error: String(err) });
    }
  }

  return { ok: true, results };
}
