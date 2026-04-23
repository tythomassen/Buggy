import { neon } from "@neondatabase/serverless";

// PATCH /(api)/ride/update — update ride status, assign driver
export async function PATCH(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { ride_id, status, driver_id, clear_driver } = await request.json();

    if (!ride_id || !status)
      return Response.json({ error: "Missing ride_id or status" }, { status: 400 });

    let rows;
    if (driver_id) {
      rows = await sql`
        UPDATE rides
        SET status = ${status}, driver_id = ${driver_id}
        WHERE ride_id = ${ride_id}
        RETURNING *
      `;
    } else if (clear_driver) {
      rows = await sql`
        UPDATE rides
        SET status = ${status}, driver_id = NULL
        WHERE ride_id = ${ride_id}
        RETURNING *
      `;
    } else {
      rows = await sql`
        UPDATE rides
        SET status = ${status}
        WHERE ride_id = ${ride_id}
        RETURNING *
      `;
    }

    return Response.json({ data: rows[0] });
  } catch (error) {
    console.error("Error updating ride:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
