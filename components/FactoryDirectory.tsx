'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, MapPin, Mail, Phone, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import type { FactoryRow } from '@/lib/db';

/** Public, read-only directory — anyone can search/page through it, no login required. Writes only ever happen through /admin. Search and pagination are both server-side (the table has thousands of rows; the original client-filter design silently hit Postgres's default 1000-row cap). */
export default function FactoryDirectory({
  factories,
  query,
  page,
  pageCount,
}: {
  factories: FactoryRow[];
  query: string;
  page: number;
  pageCount: number;
}) {
  const [input, setInput] = useState(query);
  const router = useRouter();
  const pathname = usePathname();

  function goTo(q: string, p: number) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    goTo(input.trim(), 1);
  }

  return (
    <div>
      <form onSubmit={submitSearch} className="relative mb-6 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" strokeWidth={2} />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search by name, contact, or zone..."
          className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-zinc-400"
        />
      </form>

      {factories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 py-16 text-center text-zinc-400">
          {query ? 'No matches for that search.' : 'No factories listed yet.'}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {factories.map((f) => (
              <div key={f.id} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-zinc-900" dir="auto">
                  {f.name}
                </h3>
                {(f.city || f.country) && (
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                    <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {[f.city, f.country].filter(Boolean).join(', ')}
                  </div>
                )}
                {f.categories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {f.categories.map((c) => (
                      <span key={c} className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600" dir="auto">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
                <dl className="mt-3 space-y-1 text-xs text-zinc-500">
                  {f.contact_name && (
                    <div dir="auto">
                      <dt className="inline font-medium text-zinc-600">Contact: </dt>
                      <dd className="inline">{f.contact_name}</dd>
                    </div>
                  )}
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
                {f.notes && (
                  <p className="mt-3 text-xs leading-relaxed text-zinc-500" dir="auto">
                    {f.notes}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-3 border-t border-zinc-100 pt-3 text-xs">
                  {f.email && (
                    <a href={`mailto:${f.email}`} className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-900">
                      <Mail className="h-3.5 w-3.5" strokeWidth={1.75} /> Email
                    </a>
                  )}
                  {f.phone && (
                    <a href={`tel:${f.phone.split('/')[0].trim()}`} className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-900">
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

          {pageCount > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4 text-sm">
              <button
                onClick={() => goTo(query, page - 1)}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-zinc-600 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.75} /> Prev
              </button>
              <span className="text-zinc-500">
                Page {page} of {pageCount}
              </span>
              <button
                onClick={() => goTo(query, page + 1)}
                disabled={page >= pageCount}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-zinc-600 disabled:opacity-40"
              >
                Next <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
