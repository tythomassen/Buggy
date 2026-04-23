import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { name, email, clerkId, role = "rider" } = await request.json();

    if (!name || !email || !clerkId) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const response = await sql`
      INSERT INTO users (
        name,
        email,
        clerk_id,
        role
      ) VALUES (
        ${name},
        ${email},
        ${clerkId},
        ${role}
      )
      ON CONFLICT (clerk_id) DO NOTHING`;

    return Response.json({ data: response }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
