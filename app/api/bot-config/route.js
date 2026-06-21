import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllConfig, setConfig } from "@/lib/db";

const OWNER_IDS = (process.env.OWNER_DISCORD_IDS ?? "")
  .split(",").map((s) => s.trim()).filter(Boolean);

function isOwner(session) {
  if (!OWNER_IDS.length) return true;           // no list set → open to any signed-in user
  return OWNER_IDS.includes(session?.user?.discordId);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !isOwner(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const config = await getAllConfig();
  return NextResponse.json({ config });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || !isOwner(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { key, value } = await req.json();
  if (!key || value === undefined) {
    return NextResponse.json({ error: "key and value required" }, { status: 400 });
  }
  try {
    await setConfig(key, String(value), `website:${session.user.name}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
