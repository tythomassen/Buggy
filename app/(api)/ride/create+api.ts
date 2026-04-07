import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const {
      origin_address,
      origin_latitude,
      origin_longitude,
      destination_address,
      destination_latitude,
      destination_longitude,
      user_id,
    } = await request.json();

    if (!origin_address || !origin_latitude || !origin_longitude || !user_id) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO rides (
        origin_address,
        origin_latitude,
        origin_longitude,
        destination_address,
        destination_latitude,
        destination_longitude,
        user_id,
        status
      ) VALUES (
        ${origin_address},
        ${origin_latitude},
        ${origin_longitude},
        ${destination_address ?? null},
        ${destination_latitude ?? null},
        ${destination_longitude ?? null},
        ${user_id},
        'pending'
      )
      RETURNING *
    `;

    return Response.json({ data: rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating ride:", error);
    return Response.json({ error: error?.message ?? String(error) }, { status: 500 });
  }
}
