import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { db } from "@/lib/db";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const runtime = "nodejs";

// GET /api/cms/upload?folder=general — fetch media list
export async function GET(req: NextRequest) {
  try {
    const folder = req.nextUrl.searchParams.get("folder");
    const media  = await db.media.findMany({
      where:   folder ? { folder } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(media);
  } catch (err) {
    console.error("GET /api/cms/upload:", err);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

// POST /api/cms/upload — upload to Cloudinary
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file     = formData.get("file") as File;
    const folder   = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      return NextResponse.json(
        { error: "Cloudinary not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to environment variables." },
        { status: 500 }
      );
    }

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{
      secure_url: string; public_id: string; bytes: number;
    }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder:           `sam-enterprises/${folder}`,
          resource_type:    "image",
          allowed_formats:  ["jpg", "jpeg", "png", "webp", "svg", "gif"],
          transformation:   [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else       resolve(result as { secure_url: string; public_id: string; bytes: number });
        }
      ).end(buffer);
    });

    const media = await db.media.create({
      data: {
        filename: file.name,
        url:      result.secure_url,
        alt:      file.name.replace(/\.[^/.]+$/, ""),
        size:     result.bytes,
        mimeType: file.type,
        folder,
      },
    });

    return NextResponse.json({ ok: true, url: result.secure_url, media });
  } catch (err) {
    console.error("POST /api/cms/upload:", err);
    return NextResponse.json({ error: "Upload failed. Check Cloudinary credentials." }, { status: 500 });
  }
}
