import { login } from '@/lib/actions';

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 pt-16">
      <div>
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="mt-1 text-sm text-zinc-500">Enter the admin password to add, edit, or remove factories. Everyone else only needs the directory itself — no login required.</p>
      </div>
      <form action={login} className="flex flex-col gap-3">
        <input
          type="password"
          name="password"
          required
          autoFocus
          placeholder="Admin password"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm outline-none focus:border-zinc-500"
        />
        <button type="submit" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          Sign in
        </button>
        {error && <p className="text-sm text-red-600">Wrong password.</p>}
      </form>
    </div>
  );
}
