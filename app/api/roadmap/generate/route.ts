import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { generateRoadmap } from "@/lib/roadmap";

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const result = await generateRoadmap(session.userId);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
