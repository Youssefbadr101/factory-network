# Factory Network

An open-source, self-hostable directory of manufacturing factories/suppliers — searchable by anyone, no account required. Only one thing is gated: adding, editing, or deleting a listing, which needs a single admin password.

This started as an internal admin tool inside a larger product and was pulled out into its own small, dependency-light project so it could be public and forkable on its own.

## Why it's built this way

- **No hosted database required.** It uses [SQLite](https://www.sqlite.org/) via `better-sqlite3` — one file on disk. Clone it, run it, done. No Postgres/Supabase/Railway account needed to try it out.
- **No user accounts.** The public directory needs zero auth. The admin side is a single shared password (set via `ADMIN_PASSWORD`), not a multi-user system — there's exactly one operator per deployment, so that's all the access control this needs.
- **Next.js App Router + Server Actions.** Reads are server components, writes are server actions — no separate API layer to maintain.

## Running it locally

```bash
npm install
cp .env.example .env.local   # then set ADMIN_PASSWORD
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public directory, and `/admin/login` to sign in and manage listings. The SQLite file is created automatically at `./data/factories.db` on first run.

## Deploying it

Any Node host works, with one caveat: SQLite is a local file, so it needs **persistent disk** — a plain VPS, Fly.io (with a volume), Railway, or Render all work fine. A purely serverless platform (Vercel's default) won't persist the file between invocations; if you want to deploy there, swap `lib/db.ts` for a hosted Postgres connection (the query shapes are simple enough that this is a small change) and point `DATABASE_PATH`-style config at that instead.

## License

MIT — see [LICENSE](./LICENSE). Fork it, rebrand it, run your own directory.
