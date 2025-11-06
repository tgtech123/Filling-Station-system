import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    console.log("📥 Upload request received");

    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("❌ Cloudinary not configured");
      return NextResponse.json(
        { error: "Cloudinary not configured. Check environment variables." },
        { status: 500 }
      );
    }

    const data = await request.formData();
    const file = data.get("file");
    const userId = data.get("userId");

    console.log("📦 File received:", file?.name, file?.size, "bytes");
    console.log("👤 User ID:", userId);

    if (!file) {
      console.error("❌ No file in request");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("📤 Uploading to Cloudinary...");

    // Upload to Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: userId ? `user_images/${userId}` : "user_images/general",
            public_id: userId ? `profile_${userId}` : undefined,
            overwrite: true,
            resource_type: "image",
            transformation: [
              { width: 500, height: 500, crop: "limit" },
              { quality: "auto" }
            ]
          },
          (error, result) => {
            if (error) {
              console.error("❌ Cloudinary error:", error);
              reject(error);
            } else {
              console.log("✅ Cloudinary upload successful");
              resolve(result);
            }
          }
        )
        .end(buffer);
    });

    console.log("✅ Image URL:", uploadResponse.secure_url);

    return NextResponse.json({
      success: true,
      secure_url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
      userId: userId,
    });
  } catch (error) {
    console.error("❌ Upload failed:", error);
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}