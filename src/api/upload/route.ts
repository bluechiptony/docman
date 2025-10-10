import { NextResponse } from "next/server";

export async function POST() {
  await new Promise((res) => setTimeout(res, 1000)); // simulate delay
  return NextResponse.json({ success: true });
}
