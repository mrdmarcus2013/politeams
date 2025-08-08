import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const seriesID = searchParams.get("series_id");

  if (!seriesID) {
    return NextResponse.json({ error: "Missing series_id" }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_FRED_API_KEY;

  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesID}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=1`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const observation = data?.observations?.[0];
    if (observation?.value) {
      return NextResponse.json({ value: observation.value });
    } else {
      return NextResponse.json({ error: "No data" }, { status: 500 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
