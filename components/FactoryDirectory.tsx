'use client';

import { useMemo, useState } from 'react';
import { Search, MapPin, Mail, Phone, Globe } from 'lucide-react';
import type { FactoryRow } from '@/lib/db';

/** Public, read-only directory — anyone can search/filter, no login required. Writes only ever happen through /admin. */
export default function FactoryDirectory({ factories }: { factories: FactoryRow[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return factories;
    return factories.filter((f) =>
      [f.name, f.city, f.country, f.moq, f.capacity, f.notes, ...f.categories].filter(Boolean).join(' ').toLowerCase().includes(q)
    );
  }, [factories, query]);

  return (
    <div>
      <div className="relative mb-6 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" strokeWidth={2} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, location, or category..."
          className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-zinc-400"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 py-16 text-center text-zinc-400">
          {factories.length === 0 ? 'No factories listed yet.' : 'No matches for that search.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f) => (
            <div key={f.id} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-zinc-900">{f.name}</h3>
              {(f.city || f.country) && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                  <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {[f.city, f.country].filter(Boolean).join(', ')}
                </div>
              )}
              {f.categories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {f.categories.map((c) => (
                    <span key={c} className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                      {c}
                    </span>
                  ))}
                </div>
              )}
              <dl className="mt-3 space-y-1 text-xs text-zinc-500">
                {f.moq && (
                  <div>
                    <dt className="inline font-medium text-zinc-600">MOQ: </dt>
                    <dd className="inline">{f.moq}</dd>
                  </div>
                )}
                {f.capacity && (
                  <div>
                    <dt className="inline font-medium text-zinc-600">Capacity: </dt>
                    <dd className="inline">{f.capacity}</dd>
                  </div>
                )}
              </dl>
              {f.notes && <p className="mt-3 text-xs leading-relaxed text-zinc-500">{f.notes}</p>}
              <div className="mt-4 flex flex-wrap gap-3 border-t border-zinc-100 pt-3 text-xs">
                {f.email && (
                  <a href={`mailto:${f.email}`} className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-900">
                    <Mail className="h-3.5 w-3.5" strokeWidth={1.75} /> Email
                  </a>
                )}
                {f.phone && (
                  <a href={`tel:${f.phone}`} className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-900">
                    <Phone className="h-3.5 w-3.5" strokeWidth={1.75} /> {f.phone}
                  </a>
                )}
                {f.website && (
                  <a href={f.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-900">
                    <Globe className="h-3.5 w-3.5" strokeWidth={1.75} /> Website
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
