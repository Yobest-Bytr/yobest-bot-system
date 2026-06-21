import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("⚠️ DATABASE_URL is not set");
}

export const sql = postgres(connectionString, {
  ssl: { rejectUnauthorized: false },
  max: 10,
});

export const dbConfigured = !!connectionString;

export async function safeQuery(queryFn) {
  if (!dbConfigured) {
    console.warn("⚠️ Database not configured - returning empty data");
    return [];
  }
  try {
    const result = await queryFn(sql);
    return result;
  } catch (error) {
    console.error("DB query error:", error.message);
    return [];
  }
}
