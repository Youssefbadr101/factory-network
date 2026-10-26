'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Plus, Trash2, Pencil, Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { addFactory, editFactory, removeFactory } from '@/lib/actions';
import type { FactoryRow } from '@/lib/db';

export default function AdminFactoryTable({
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
  const [editing, setEditing] = useState<FactoryRow | 'new' | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(query);
  const router = useRouter();
  const pathname = usePathname();

  async function handleDelete(id: string) {
    if (!confirm('Delete this factory? This cannot be undone.')) return;
    setDeletingId(id);
    await removeFactory(id);
    setDeletingId(null);
    router.refresh();
  }

  function goTo(q: string, p: number) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            goTo(searchInput.trim(), 1);
          }}
          className="relative max-w-sm flex-1"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" strokeWidth={2} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-zinc-500"
          />
        </form>
        <button
          onClick={() => setEditing('new')}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Add factory
        </button>
      </div>

      {factories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 py-16 text-center text-zinc-400">No factories yet — add the first one.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Categories</th>
                <th className="px-4 py-3">MOQ</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {factories.map((f) => (
                <tr key={f.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium">{f.name}</td>
                  <td className="px-4 py-3 text-zinc-500">{[f.city, f.country].filter(Boolean).join(', ') || '—'}</td>
                  <td className="px-4 py-3 text-zinc-500">{f.categories.join(', ') || '—'}</td>
                  <td className="px-4 py-3 text-zinc-500">{f.moq || '—'}</td>
                  <td className="px-4 py-3 text-zinc-500">{f.contact_name || f.email || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button onClick={() => setEditing(f)} className="mr-3 text-zinc-400 hover:text-zinc-900" title="Edit">
                      <Pencil className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                    <button onClick={() => handleDelete(f.id)} disabled={deletingId === f.id} className="text-zinc-400 hover:text-red-600" title="Delete">
                      {deletingId === f.id ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> : <Trash2 className="h-4 w-4" strokeWidth={1.75} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4 text-sm">
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

      {editing && <FactoryDialog factory={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function FactoryDialog({ factory, onClose }: { factory: FactoryRow | null; onClose: () => void }) {
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    if (factory) {
      await editFactory(factory.id, formData);
    } else {
      await addFactory(formData);
    }
    setSaving(false);
    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-8" onClick={onClose}>
      <form action={handleSubmit} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold">{factory ? 'Edit factory' : 'Add factory'}</h2>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input name="name" defaultValue={factory?.name} required placeholder="Factory name" className="col-span-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
          <input name="city" defaultValue={factory?.city ?? ''} placeholder="City" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
          <input name="country" defaultValue={factory?.country ?? ''} placeholder="Country" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
          <input
            name="categories"
            defaultValue={factory?.categories.join(', ') ?? ''}
            placeholder="Categories, comma separated"
            className="col-span-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <input name="moq" defaultValue={factory?.moq ?? ''} placeholder="MOQ (e.g. 500 units)" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
          <input name="capacity" defaultValue={factory?.capacity ?? ''} placeholder="Capacity" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
          <input name="contact_name" defaultValue={factory?.contact_name ?? ''} placeholder="Contact name" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
          <input name="phone" defaultValue={factory?.phone ?? ''} placeholder="Phone" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
          <input name="email" defaultValue={factory?.email ?? ''} placeholder="Email" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
          <input name="website" defaultValue={factory?.website ?? ''} placeholder="Website" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
          <textarea
            name="notes"
            defaultValue={factory?.notes ?? ''}
            placeholder="Notes — anything a visitor should know"
            rows={3}
            className="col-span-2 resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-zinc-500 hover:bg-zinc-100">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            {saving && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />}
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
