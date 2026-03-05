# TT Trader

Table tennis buy, sell & trade marketplace. Users can list items, post trades (have X / want Y), filter by location and distance, save searches, get match notifications, and message each other.

## Stack

- **Next.js 14** (App Router), TypeScript, Tailwind CSS
- **Prisma** + SQLite (dev); switch to PostgreSQL in production by changing `datasource` in `prisma/schema.prisma` and `DATABASE_URL`
- **NextAuth.js** (credentials: email + password)
- **Geocoding**: Nominatim (OpenStreetMap) for location → lat/lng

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and set `NEXTAUTH_SECRET` (e.g. `openssl rand -base64 32`)
3. Create DB: `npx prisma generate && npx prisma db push`
4. Run: `npm run dev` → http://localhost:3000

## Features

- **Auth**: Sign up, log in, profile (name, bio, location, reseller badge)
- **Listings**: Create/edit/delete, categories (Blades, Rubbers, etc.), condition, price, photos, location, max delivery/meet distance (km)
- **Trades**: Post “have” / “want”, optional location and max distance
- **Discovery**: Filter by category, condition, price, “within X km”, sort by newest/price/distance; “Listings near you” on homepage (uses profile location or browser geolocation)
- **Contact**: Mailto “Contact seller” or in-app **Messages** (threads per listing or trade)
- **Favourites**: Save listings; **Saved searches** with optional radius (alerts when new listings match)
- **Matching**: When a new listing matches a user’s saved search and is within range, a notification is created; view under Dashboard → Matches for you
- **Reviews**: Leave rating + comment on a user’s profile (e.g. after a sale/trade)
- **Reports**: Report listing, trade, or user; admin can dismiss or remove content (set `ADMIN_USER_ID` in `.env` to your user id, then use `/admin/reports`)

## Admin

Set `ADMIN_USER_ID` in `.env` to your user’s id (from DB or profile). Then visit `/admin/reports` to review and dismiss/remove reported content.

## Scripts

- `npm run dev` – development server
- `npm run build` / `npm run start` – production
- `npx prisma studio` – browse DB
