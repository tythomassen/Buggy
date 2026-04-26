# Buggy — Pitch Context

Use this file to get up to speed on the Buggy app before helping pitch, refine messaging, or prepare for a demo or investor conversation.

---

## What it is

**Buggy** is a golf cart ride-sharing app built for Cape May, NJ — think Uber, but for beach buggies. Riders open the app, tap "Ping," and a nearby driver accepts the request and picks them up. It's hyper-local by design: the map is geofenced to Cape May's boundaries and the whole product is built around the town's laid-back, no-car beach culture.

---

## The problem it solves

Cape May is a walkable Victorian beach town where cars feel out of place. In summer the streets are packed with tourists who need short hops — from the beach to a restaurant, from Congress Hall to the ferry terminal — but don't want to drive or park. Golf carts already exist informally in this environment. Buggy gives that informal economy a real platform: on-demand dispatch, real-time driver tracking, and seamless payment.

---

## How it works (user flow)

### Rider
1. Opens the app → full-screen Cape May map loads, current location auto-detected
2. Optionally types a destination in the "Where to?" field (powered by Google Places)
3. Taps **Ping** → ride request created instantly, pushed to nearby drivers
4. Waiting screen shows a live spinner: "Looking for a driver..."
5. When a driver accepts, the screen flips to "Driver on the way!" with the driver's name
6. Rider taps "Got it" and returns to the home screen

### Driver
1. Opens driver dashboard → full-screen map of Cape May
2. Toggles **Online** switch → starts polling for incoming pings every 5 seconds
3. Ping markers (green pin icons) appear on the map at rider locations
4. A card slides up from the bottom showing: rider name, pickup address
5. Driver taps **Accept** → navigates to Active Ride screen with pickup pin on map
6. Driver arrives, completes the ride → taps **Complete Ride** → returns to dashboard
7. Driver can also tap **Pass** to skip a ping or **Cancel & Release** during an active ride

---

## Tech stack

- **React Native + Expo** (expo-router for file-based navigation)
- **NativeWind** (Tailwind CSS for React Native)
- **Clerk** — auth (Apple Sign-In, Google, email)
- **Stripe** — payment processing
- **Neon** (serverless PostgreSQL) — rides, pings, users tables
- **Google Maps / Directions API** — map, geocoding, routing
- **Zustand** — lightweight state management

---

## Database schema (simplified)

| Table | Key columns |
|-------|-------------|
| `users` | `clerk_id`, `name`, `email`, `role` (rider/driver) |
| `rides` | `ride_id`, `user_id`, `origin_*`, `destination_*`, `status` (pending/accepted/completed/cancelled) |
| `pings` | `id`, `ride_id`, `driver_clerk_id`, `status` (pending/accepted/passed/expired), `active` |

When a rider pings, a ride row is created and pings are dispatched to nearby drivers. When one driver accepts, all other pings for that ride are expired automatically.

---

## Screens

| Screen | Who sees it | What it does |
|--------|------------|--------------|
| Welcome | Everyone (onboarding) | 3-slide swipeable intro with Cape May imagery |
| Sign In / Sign Up | Unauthenticated | Clerk auth (Apple, Google, email) |
| Home | Riders | Full-screen map + location search + Ping button + slide-out menu |
| Waiting | Riders | Polls ride status every 4s, shows spinner → confirmation |
| My Rides | Riders | Ride history |
| Profile | All users | Name, email, phone (from Clerk) |
| Legal | All users | Terms & Conditions |
| Driver Dashboard | Drivers | Online toggle, live ping map, Accept/Pass card |
| Driver Active Ride | Drivers | Pickup map pin, rider name, Complete / Cancel & Release |

---

## Branding & design

- **Name:** Buggy
- **Logo font:** LibreBodoni-BoldItalic ("Buggy" wordmark)
- **Body font:** Plus Jakarta Sans (Regular through ExtraBold)
- **Primary color:** `#1a2e35` (dark teal/navy) — buttons, headers, accents
- **Accent color:** `#dfc925` (golden yellow) — highlights, driver UI accents
- **Map style:** Muted standard (Apple Maps, light mode)
- **Vibe:** Clean, coastal, premium-casual — not techy or corporate

---

## Current state (as of demo)

- Full rider flow working end-to-end: ping → waiting → driver accepted → home
- Full driver flow working: online toggle → receive pings → accept → active ride → complete
- Real-time ping dispatch via polling (5s driver, 4s rider)
- Geofenced map — constrained to Cape May bounds, can't scroll away
- Sim mode: driver dashboard has a "+ Sim Pings" button that injects 4 test pings at fixed Cape May coordinates for demo purposes (one-use per session)
- Auth via Clerk (Apple Sign-In live)
- Stripe integrated (payment infra in place)
- Legal / Terms & Conditions screen in app

---

## What makes it interesting to pitch

1. **Hyper-local moat** — built specifically for Cape May's geography, culture, and existing golf cart ecosystem. Not trying to be Uber everywhere.
2. **Low-cost fleet** — drivers use their own golf carts. No vehicle acquisition cost for the platform.
3. **Tourist-heavy TAM** — Cape May draws ~3M visitors/year. Summer demand is concentrated, predictable, and high.
4. **Seasonal proof-of-concept** — one summer season can validate the model before any major expansion.
5. **Replicable playbook** — every beach town with a golf cart culture (Avalon, Sea Isle, Ocean City, The Hamptons, Martha's Vineyard) is a potential next market.
6. **No direct competitor** — no one has done Uber-style dispatch for golf carts in a geofenced resort town.

---

## Potential objections & responses

**"Why not just call a regular cab or Lyft?"**
Golf carts are the right vehicle for Cape May — short distances, no parking stress, part of the local identity. A regular car is overkill and often unwelcome in the crowded Victorian streets.

**"Is there enough demand?"**
Cape May's entire summer economy is built around leisure and mobility. Visitors walk everywhere but still need help getting around after a long beach day, especially with kids, gear, or after dinner drinks.

**"Golf carts are slow — is that a problem?"**
In Cape May it's an advantage. Nothing moves fast in town. A golf cart feels right, fits the vibe, and doesn't require a parking spot.

**"How do you make money?"**
Per-ride commission on fares processed through Stripe. Potential for subscription driver plans during peak season.

---

## One-liner options

- "Uber for beach buggies — on-demand golf cart rides in Cape May, NJ."
- "The ride-sharing app built for towns where cars don't belong."
- "Buggy brings golf cart dispatch to the Jersey Shore."
