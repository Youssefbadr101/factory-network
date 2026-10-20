'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Pencil, Loader2 } from 'lucide-react';
import { addFactory, editFactory, removeFactory } from '@/lib/actions';
import type { FactoryRow } from '@/lib/db';

export default function AdminFactoryTable({ factories }: { factories: FactoryRow[] }) {
  const [editing, setEditing] = useState<FactoryRow | 'new' | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm('Delete this factory? This cannot be undone.')) return;
    setDeletingId(id);
    await removeFactory(id);
    setDeletingId(null);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setEditing('new')}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
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
