import { listFactories } from '@/lib/db';
import FactoryDirectory from '@/components/FactoryDirectory';

export const dynamic = 'force-dynamic'; // always read the current directory, never a build-time snapshot

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q ?? '';
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);

  const { rows, total, pageCount } = await listFactories({ query, page });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Browse the directory</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {total.toLocaleString()} factor{total === 1 ? 'y' : 'ies'} — searchable, no account needed.
        </p>
      </div>
      <FactoryDirectory factories={rows} query={query} page={page} pageCount={pageCount} />
    </div>
  );
}
