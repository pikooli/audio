import fs from "fs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try{ 
    const formData = await request.formData();
    const audio = formData.get("audio") as File;
    console.log("audio", audio);
    const buffer = await audio.arrayBuffer();
  
    fs.writeFileSync("public/audio.webm", Buffer.from(buffer));
    
    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("Error saving audio file:", error);
    return NextResponse.json({ message: "Error saving audio file" }, { status: 500 });
  }
}