# Factory Network

An open-source directory of manufacturing factories/suppliers — searchable by anyone, no account required. Only one thing is gated: adding, editing, or deleting a listing, which needs a single admin password.

This started as an internal admin tool inside a larger product and was pulled out into its own small project so it could be public and forkable on its own.

## Why it's built this way

- **No user accounts.** The public directory needs zero auth. The admin side is a single shared password (set via `ADMIN_PASSWORD`), not a multi-user system — there's exactly one operator per deployment, so that's all the access control this needs.
- **Next.js App Router + Server Actions.** Reads are server components, writes are server actions — no separate API layer to maintain.
- **Postgres-backed (`@supabase/supabase-js`), serverless-friendly.** Works correctly on Vercel's default deployment — no persistent disk needed, no cross-instance consistency issues. `schema.sql` has the one table it needs; any Supabase project (or any Postgres you front with PostgREST) works.

## Running it locally

```bash
npm install
cp .env.example .env.local   # set ADMIN_PASSWORD, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
```

Run `schema.sql` against your database once (Supabase SQL editor, `psql`, or `supabase db query -f schema.sql` if you have the Supabase CLI linked), then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public directory, and `/admin/login` to sign in and manage listings.

## Deploying it

Any Node host works — Vercel, a VPS, Fly.io, Render. There's no local file storage to worry about; all state lives in Postgres.

## License

MIT — see [LICENSE](./LICENSE). Fork it, rebrand it, run your own directory.
