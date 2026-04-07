import { neon } from "@neondatabase/serverless";

// GET /(api)/migrate — run once to update schema
export async function GET() {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    await sql`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'rider'
    `;

    await sql`
      ALTER TABLE rides
        ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
    `;

    // make driver_id, destination, fare nullable (assigned after request)
    await sql`ALTER TABLE rides ALTER COLUMN driver_id DROP NOT NULL`;
    await sql`ALTER TABLE rides ALTER COLUMN destination_address DROP NOT NULL`;
    await sql`ALTER TABLE rides ALTER COLUMN destination_latitude DROP NOT NULL`;
    await sql`ALTER TABLE rides ALTER COLUMN destination_longitude DROP NOT NULL`;
    await sql`ALTER TABLE rides ALTER COLUMN ride_time DROP NOT NULL`;
    await sql`ALTER TABLE rides ALTER COLUMN fare_price DROP NOT NULL`;
    await sql`ALTER TABLE rides ALTER COLUMN payment_status DROP NOT NULL`;

    await sql`
      ALTER TABLE drivers
        ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION
    `;

    return Response.json({ ok: true, message: "Migration complete" });
  } catch (error) {
    console.error("Migration error:", error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
