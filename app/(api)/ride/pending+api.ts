import { neon } from "@neondatabase/serverless";

// GET /(api)/ride/pending — all unaccepted ride requests (driver dashboard)
export async function GET() {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const rows = await sql`
      SELECT
        rides.ride_id,
        rides.origin_address,
        rides.destination_address,
        rides.origin_latitude,
        rides.origin_longitude,
        rides.destination_latitude,
        rides.destination_longitude,
        rides.status,
        rides.created_at,
        users.name AS rider_name
      FROM rides
      JOIN users ON rides.user_id = users.clerk_id
      WHERE rides.status = 'pending'
      ORDER BY rides.created_at ASC
    `;
    return Response.json({ data: rows });
  } catch (error) {
    console.error("Error fetching pending rides:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
