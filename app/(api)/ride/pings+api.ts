import { neon } from "@neondatabase/serverless";

// GET /(api)/ride/pings?driverClerkId=xxx
export async function GET(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { searchParams } = new URL(request.url);
    const driverClerkId = searchParams.get("driverClerkId");

    if (!driverClerkId) {
      return Response.json({ error: "Missing driverClerkId" }, { status: 400 });
    }

    const rows = await sql`
      SELECT
        pings.id         AS ping_id,
        pings.ride_id,
        pings.status     AS ping_status,
        pings.created_at,
        rides.origin_address,
        rides.origin_latitude,
        rides.origin_longitude,
        rides.destination_address,
        users.name       AS rider_name
      FROM pings
      JOIN rides ON pings.ride_id = rides.ride_id
      LEFT JOIN users ON rides.user_id = users.clerk_id
      WHERE pings.driver_clerk_id = ${driverClerkId}
        AND pings.status = 'pending'
        AND pings.active = true
        AND rides.status = 'pending'
      ORDER BY pings.created_at ASC
    `;

    return Response.json({ data: rows });
  } catch (error) {
    console.error("Error fetching pings:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH /(api)/ride/pings — update ping status
// If expire_ride_id is provided, also expire all other pending pings for that ride
export async function PATCH(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { ping_id, status, expire_ride_id } = await request.json();

    if (!ping_id || !status) {
      return Response.json({ error: "Missing ping_id or status" }, { status: 400 });
    }

    await sql`
      UPDATE pings
      SET status = ${status}, responded_at = NOW()
      WHERE id = ${ping_id}
    `;

    // Expire all other drivers' pending pings for the same ride
    if (expire_ride_id) {
      await sql`
        UPDATE pings
        SET status = 'expired', responded_at = NOW()
        WHERE ride_id = ${expire_ride_id}
          AND id != ${ping_id}
          AND status = 'pending'
      `;
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Error updating ping:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /(api)/ride/pings — toggle active on/off for a ping
export async function PUT(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { ping_id, active } = await request.json();

    if (ping_id === undefined || active === undefined) {
      return Response.json({ error: "Missing ping_id or active" }, { status: 400 });
    }

    const rows = await sql`
      UPDATE pings
      SET active = ${active}
      WHERE id = ${ping_id}
      RETURNING id, active
    `;

    return Response.json({ data: rows[0] });
  } catch (error) {
    console.error("Error toggling ping:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
