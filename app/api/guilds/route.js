import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { safeQuery } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const guilds = await safeQuery((sql) => sql`
    SELECT guild_id, name, icon_url, member_count, boost_level, updated_at
    FROM guilds ORDER BY member_count DESC`);

  return NextResponse.json({ guilds });
}
