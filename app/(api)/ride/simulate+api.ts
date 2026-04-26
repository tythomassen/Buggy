import { neon } from "@neondatabase/serverless";

const SIM_USERS = [
  { clerkId: "sim_alice_001", name: "Alice M.", email: "sim.alice@buggy.dev" },
  { clerkId: "sim_bob_002", name: "Bob T.", email: "sim.bob@buggy.dev" },
  { clerkId: "sim_carol_003", name: "Carol R.", email: "sim.carol@buggy.dev" },
  { clerkId: "sim_dave_004", name: "Dave K.", email: "sim.dave@buggy.dev" },
  { clerkId: "sim_eve_005", name: "Eve S.", email: "sim.eve@buggy.dev" },
  { clerkId: "sim_frank_006", name: "Frank L.", email: "sim.frank@buggy.dev" },
  { clerkId: "sim_grace_007", name: "Grace P.", email: "sim.grace@buggy.dev" },
];

const CAPE_MAY_LOCATIONS = [
  { address: "Sim Location 1", latitude: 38.93202617207581, longitude: -74.92429131509175 },
  { address: "Sim Location 2", latitude: 38.9304202018921,  longitude: -74.92473235523619 },
  { address: "Sim Location 3", latitude: 38.932289347631446, longitude: -74.91954176909412 },
  { address: "Sim Location 4", latitude: 38.93697707854369, longitude: -74.91424808590716 },
];


// DELETE /(api)/ride/simulate?after=27 — remove pings (and their rides) with id > after
export async function DELETE(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { searchParams } = new URL(request.url);
    const after = Number(searchParams.get("after") ?? 27);

    const deleted = await sql`
      DELETE FROM pings
      WHERE id > ${after}
      RETURNING id, ride_id
    `;

    const rideIds = deleted.map((r) => r.ride_id);
    if (rideIds.length > 0) {
      await sql`DELETE FROM rides WHERE ride_id = ANY(${rideIds})`;
    }

    return Response.json({ data: { deletedPings: deleted.length, deletedRides: rideIds.length } });
  } catch (error: any) {
    return Response.json({ error: error?.message ?? String(error) }, { status: 500 });
  }
}

// POST /(api)/ride/simulate — inject fake rider pings for a driver
export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { driverClerkId, count = 4 } = await request.json();

    if (!driverClerkId) {
      return Response.json({ error: "Missing driverClerkId" }, { status: 400 });
    }

    const n = CAPE_MAY_LOCATIONS.length;

    // Ensure sim users exist
    for (const u of SIM_USERS) {
      await sql`
        INSERT INTO users (clerk_id, name, email, role)
        VALUES (${u.clerkId}, ${u.name}, ${u.email}, 'rider')
        ON CONFLICT (clerk_id) DO NOTHING
      `;
    }

    const users = SIM_USERS.slice(0, n);
    const locations = CAPE_MAY_LOCATIONS;

    let created = 0;
    for (let i = 0; i < n; i++) {
      const user = users[i];
      const loc = locations[i];

      const rides = await sql`
        INSERT INTO rides (
          origin_address, origin_latitude, origin_longitude,
          user_id, status
        ) VALUES (
          ${loc.address}, ${loc.latitude}, ${loc.longitude},
          ${user.clerkId}, 'pending'
        )
        RETURNING ride_id
      `;
      const rideId = rides[0].ride_id;

      const pings = await sql`
        INSERT INTO pings (ride_id, driver_clerk_id)
        VALUES (${rideId}, ${driverClerkId})
        ON CONFLICT (ride_id, driver_clerk_id) DO NOTHING
        RETURNING id
      `;
      if (pings[0]?.id) created++;
    }

    return Response.json({ data: { created } }, { status: 201 });
  } catch (error: any) {
    console.error("Error simulating pings:", error);
    return Response.json({ error: error?.message ?? String(error) }, { status: 500 });
  }
}
