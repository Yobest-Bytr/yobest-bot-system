import { neon } from "@neondatabase/serverless";

export const dbConfigured = !!process.env.DATABASE_URL;
const sql = dbConfigured ? neon(process.env.DATABASE_URL) : null;

export async function safeQuery(builder) {
  if (!sql) return [];
  try { return await builder(sql); }
  catch (e) { console.error("[db]", e.message); return []; }
}

/** True if bot pinged within last 90 seconds */
export async function isBotOnline() {
  if (!sql) return false;
  try {
    const rows = await sql`SELECT ts FROM bot_heartbeat ORDER BY ts DESC LIMIT 1`;
    return rows.length > 0 && Date.now() - new Date(rows[0].ts).getTime() < 90_000;
  } catch { return false; }
}

export async function getConfig(key) {
  if (!sql) return null;
  try {
    const r = await sql`SELECT value FROM bot_config WHERE key=${key}`;
    return r[0]?.value ?? null;
  } catch { return null; }
}

export async function getAllConfig() {
  if (!sql) return [];
  try { return await sql`SELECT key,value,updated_by,updated_at FROM bot_config ORDER BY key`; }
  catch { return []; }
}

export async function setConfig(key, value, updatedBy = "website") {
  if (!sql) throw new Error("No database");
  await sql`
    INSERT INTO bot_config (key,value,updated_by,updated_at)
    VALUES (${key},${String(value)},${updatedBy},NOW())
    ON CONFLICT (key) DO UPDATE
    SET value=EXCLUDED.value, updated_by=EXCLUDED.updated_by, updated_at=NOW()`;
}

export async function queueCommand(guildId, command, payload = {}) {
  if (!sql) throw new Error("No database");
  const r = await sql`
    INSERT INTO web_commands (guild_id,command,payload)
    VALUES (${guildId},${command},${JSON.stringify(payload)})
    RETURNING id`;
  return r[0].id;
}
