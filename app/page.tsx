import { listFactories } from '@/lib/db';
import FactoryDirectory from '@/components/FactoryDirectory';

export const dynamic = 'force-dynamic'; // always read the current directory, never a build-time snapshot

export default async function HomePage() {
  const factories = await listFactories();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Browse the directory</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {factories.length} factor{factories.length === 1 ? 'y' : 'ies'} — searchable, no account needed.
        </p>
      </div>
      <FactoryDirectory factories={factories} />
    </div>
  );
}
