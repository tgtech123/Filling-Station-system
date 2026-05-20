import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Only PNG, JPG, SVG or WebP allowed" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "platform_branding",
            public_id: "platform_logo",
            overwrite: true,
            resource_type: "image",
            transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
          },
          (error, res) => (error ? reject(error) : resolve(res))
        )
        .end(buffer);
    });

    return NextResponse.json({ success: true, secure_url: result.secure_url });
  } catch (err) {
    console.error("Logo upload error:", err);
    return NextResponse.json({ error: "Upload failed", details: err.message }, { status: 500 });
  }
}
