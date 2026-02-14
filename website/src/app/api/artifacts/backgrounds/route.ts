import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
    try {
        const imagesDir = path.join(process.cwd(), "public/images");
        if (!fs.existsSync(imagesDir)) {
            return NextResponse.json({ images: [] });
        }

        const images = fs.readdirSync(imagesDir)
            .filter(f => f.endsWith(".jpg") || f.endsWith(".png"))
            .map(f => `/images/${f}`);

        return NextResponse.json({ images });
    } catch (e) {
        return NextResponse.json({ error: "Failed to load images" }, { status: 500 });
    }
}