import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const { resources } = await cloudinary.api.resources({
      type: "upload",
      prefix: "nextjs_uploads/", // optional folder filter
      max_results: 10,
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error("Fetch images failed:", error);
    return NextResponse.json({ error: "Fetch images failed" }, { status: 500 });
  }
}
