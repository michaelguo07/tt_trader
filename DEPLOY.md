# Deploy TT Trader to Vercel

Follow these steps after pushing the repo to GitHub.

---

## 1. Create a PostgreSQL database

Vercel’s serverless environment can’t use SQLite, so you need a hosted Postgres:

- **Vercel Postgres** (e.g. [vercel.com/dashboard](https://vercel.com/dashboard) → Storage → Create Database → Postgres), or  
- **Neon** – [neon.tech](https://neon.tech) → Sign up → Create project → copy the connection string, or  
- **Supabase** – [supabase.com](https://supabase.com) → New project → Settings → Database → copy “Connection string” (URI).

You need the **connection string** that looks like:  
`postgresql://user:password@host/database?sslmode=require`

---

## 2. Deploy the app on Vercel

1. Go to **[vercel.com/new](https://vercel.com/new)**.
2. **Import** your GitHub repo (e.g. `tt_trader`).
3. Leave **Framework Preset** as Next.js. Don’t change **Root Directory**.
4. Before clicking **Deploy**, open **Environment Variables** and add:

   | Name             | Value |
   |------------------|--------|
   | `DATABASE_URL`   | Your Postgres connection string from step 1 |
   | `NEXTAUTH_SECRET`| Generate one: run `openssl rand -base64 32` in a terminal and paste the result |
   | `NEXTAUTH_URL`   | Leave empty for the first deploy; set it after (see step 4 below). |

5. Click **Deploy**. Wait for the build to finish.

---

## 3. Create the database tables

Your app needs tables in the **production** database. Use the same `DATABASE_URL` you added on Vercel.

**Option A – From your computer (easiest)**  
In your project folder, set `DATABASE_URL` in `.env` to the **production** Postgres URL (same as on Vercel), then run:

```bash
npx prisma db push
```

**Option B – From Vercel**  
If your provider supports running one-off commands, you can run `npx prisma db push` there with the same env.

---

## 4. Set the production URL for NextAuth

1. In Vercel, open your project → **Settings** → **Environment Variables**.
2. Add or edit **`NEXTAUTH_URL`** and set it to your live URL, e.g.:
   - `https://tt-trader.vercel.app`  
   (Use the exact URL Vercel gives you.)
3. **Redeploy**: Deployments → … on latest deployment → **Redeploy**.

---

## 5. Optional: Admin reports

To use the reports moderation page:

1. Deploy the app and create at least one user (sign up on the live site).
2. Get your user id (e.g. from the database or from a profile/API that exposes it).
3. In Vercel → **Environment Variables**, add **`ADMIN_USER_ID`** = your user id.
4. Redeploy. Then visit `https://your-site.vercel.app/admin/reports` when logged in as that user.

---

## Summary

1. Create a Postgres DB (Vercel / Neon / Supabase) and copy the connection string.  
2. Import the repo on Vercel and add `DATABASE_URL` and `NEXTAUTH_SECRET`.  
3. Deploy.  
4. Run `npx prisma db push` against the production `DATABASE_URL`.  
5. Set `NEXTAUTH_URL` to your live URL and redeploy.

After that, the site should be live and usable.
