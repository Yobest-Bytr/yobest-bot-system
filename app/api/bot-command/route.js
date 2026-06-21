import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

const OWNER_IDS = (process.env.OWNER_DISCORD_IDS ?? "")
  .split(",").map((s) => s.trim()).filter(Boolean);

function isOwner(session) {
  if (!OWNER_IDS.length) return true;
  return OWNER_IDS.includes(session?.user?.discordId);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || !isOwner(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!sql) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const { guildId, command, payload } = await req.json();
  if (!guildId || !command) {
    return NextResponse.json({ error: "guildId and command are required" }, { status: 400 });
  }

  try {
    const rows = await sql`
      INSERT INTO web_commands (guild_id, command, payload)
      VALUES (${guildId}, ${command}, ${JSON.stringify(payload ?? {})})
      RETURNING id, created_at`;
    return NextResponse.json({ ok: true, commandId: rows[0].id });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !isOwner(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!sql) return NextResponse.json({ commands: [] });

  try {
    const rows = await sql`
      SELECT id, guild_id, command, payload, status, result, created_at, executed_at
      FROM web_commands ORDER BY created_at DESC LIMIT 50`;
    return NextResponse.json({ commands: rows });
  } catch (e) {
    return NextResponse.json({ commands: [], error: e.message });
  }
}
