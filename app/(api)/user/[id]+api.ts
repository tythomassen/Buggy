import { neon } from "@neondatabase/serverless";

// GET /(api)/user/:clerkId — fetch role for routing after sign-in
export async function GET(_request: Request, { id }: { id: string }) {
  if (!id)
    return Response.json({ error: "Missing id" }, { status: 400 });

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const rows = await sql`
      SELECT role FROM users WHERE clerk_id = ${id} LIMIT 1
    `;

    if (!rows.length)
      return Response.json({ found: false, role: "rider" });

    return Response.json({ found: true, role: rows[0].role });
  } catch (error) {
    console.error("Error fetching user role:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
