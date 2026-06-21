import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!sql)     return NextResponse.json({ guilds: [] });

  try {
    const rows = await sql`
      SELECT guild_id, name, icon_url, member_count, boost_level, updated_at
      FROM guilds ORDER BY member_count DESC`;
    return NextResponse.json({ guilds: rows });
  } catch (e) {
    return NextResponse.json({ guilds: [], error: e.message });
  }
}
