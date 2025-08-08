import { NextResponse } from "next/server";

export async function GET() {
  const url =
    "https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_trend_gl.csv";

  try {
    const res = await fetch(url);
    const text = await res.text();

    const lines = text.trim().split("\n");
    const lastLine = lines[lines.length - 1];
    const parts = lastLine.split(",");

    const date = parts[0];
    const value = parts[1];

    return NextResponse.json({ date, value });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch CO₂ data" },
      { status: 500 }
    );
  }
}
