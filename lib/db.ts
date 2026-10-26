import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// A shared Postgres table (factory_network_listings), not a dedicated
// database for this project — see the migration note in the repo history
// for why. All access here goes through the service-role key, server-side
// only (Server Components / Server Actions) — this file is never imported
// client-side, so the key is never exposed to the browser. Public read
// access is also enforced at the database level via RLS, independent of
// this app's own logic.
let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set — see .env.example.');
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export interface FactoryRow {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  categories: string[];
  moq: string | null;
  capacity: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FactoryInput {
  name: string;
  city: string | null;
  country: string | null;
  categories: string[];
  moq: string | null;
  capacity: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  notes: string | null;
}

const TABLE = 'factory_network_listings';
export const PAGE_SIZE = 48;

export interface ListFactoriesParams {
  query?: string;
  page?: number; // 1-based
}

export interface ListFactoriesResult {
  rows: FactoryRow[];
  total: number;
  page: number;
  pageCount: number;
}

/** Real server-side search + pagination — this table has thousands of rows, so "fetch everything and filter in the browser" (the original design, fine for a handful of rows) silently hit Postgres/PostgREST's default 1000-row cap and would have shipped a multi-thousand-node page to every visitor. */
export async function listFactories(params: ListFactoriesParams = {}): Promise<ListFactoriesResult> {
  const page = Math.max(1, params.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let q = getClient().from(TABLE).select('*', { count: 'exact' }).order('name', { ascending: true });

  const query = params.query?.trim();
  if (query) {
    const escaped = query.replace(/[%_]/g, '\\$&');
    q = q.or(`name.ilike.%${escaped}%,contact_name.ilike.%${escaped}%,notes.ilike.%${escaped}%`);
  }

  const { data, error, count } = await q.range(from, to);
  if (error) throw error;

  const total = count ?? 0;
  return { rows: (data ?? []) as FactoryRow[], total, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function insertFactory(input: FactoryInput): Promise<FactoryRow> {
  const { data, error } = await getClient().from(TABLE).insert(input).select().single();
  if (error) throw error;
  return data as FactoryRow;
}

export async function updateFactory(id: string, input: FactoryInput): Promise<FactoryRow | null> {
  const { data, error } = await getClient().from(TABLE).update(input).eq('id', id).select().maybeSingle();
  if (error) throw error;
  return data as FactoryRow | null;
}

export async function deleteFactory(id: string): Promise<void> {
  const { error } = await getClient().from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
