import { listFactories } from '@/lib/db';
import FactoryDirectory from '@/components/FactoryDirectory';

export default function HomePage() {
  const factories = listFactories();

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
