import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { listFactories } from '@/lib/db';
import { logout } from '@/lib/actions';
import AdminFactoryTable from '@/components/AdminFactoryTable';

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  if (!(await isAdmin())) redirect('/admin/login');

  const params = await searchParams;
  const query = params.q ?? '';
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const { rows, total, pageCount } = await listFactories({ query, page });

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Factory Network — admin</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {total.toLocaleString()} total. Add, edit, or remove factories — changes are visible on the public directory immediately.
          </p>
        </div>
        <form action={logout}>
          <button type="submit" className="text-sm text-zinc-500 hover:text-zinc-900">
            Sign out
          </button>
        </form>
      </div>
      <AdminFactoryTable factories={rows} query={query} page={page} pageCount={pageCount} />
    </div>
  );
}
