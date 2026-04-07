import { neon } from "@neondatabase/serverless";

// GET /(api)/ride/:id/status — rider polls this while waiting
export async function GET(_request: Request, { id }: { id: string }) {
  if (!id)
    return Response.json({ error: "Missing id" }, { status: 400 });

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const rows = await sql`
      SELECT
        rides.ride_id,
        rides.status,
        users.name AS driver_name
      FROM rides
      LEFT JOIN users ON rides.driver_id::text = users.clerk_id
      WHERE rides.ride_id = ${id}
      LIMIT 1
    `;

    if (!rows.length)
      return Response.json({ error: "Ride not found" }, { status: 404 });

    return Response.json({ data: rows[0] });
  } catch (error) {
    console.error("Error fetching ride status:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
