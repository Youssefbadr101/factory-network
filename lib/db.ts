import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const DB_PATH = process.env.DATABASE_PATH || './data/factories.db';

let db: Database.Database | null = null;

/** Lazily opens (and schema-initializes) the one SQLite file this app uses — no external database to stand up, which is the whole point for a project meant to be cloned and run by anyone. */
export function getDb(): Database.Database {
  if (db) return db;

  mkdirSync(dirname(DB_PATH), { recursive: true });
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  db.exec(`
    create table if not exists factories (
      id text primary key,
      name text not null,
      city text,
      country text,
      categories text not null default '[]', -- JSON array of strings
      moq text,
      capacity text,
      contact_name text,
      phone text,
      email text,
      website text,
      notes text,
      created_at text not null default (datetime('now')),
      updated_at text not null default (datetime('now'))
    );
    create index if not exists factories_name_idx on factories (name);
  `);

  return db;
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

interface FactoryRowRaw extends Omit<FactoryRow, 'categories'> {
  categories: string;
}

function parseRow(row: FactoryRowRaw): FactoryRow {
  let categories: string[] = [];
  try {
    categories = JSON.parse(row.categories);
  } catch {
    categories = [];
  }
  return { ...row, categories };
}

export function listFactories(): FactoryRow[] {
  const rows = getDb().prepare('select * from factories order by name asc').all() as FactoryRowRaw[];
  return rows.map(parseRow);
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

export function insertFactory(input: FactoryInput): FactoryRow {
  const id = crypto.randomUUID();
  getDb()
    .prepare(
      `insert into factories (id, name, city, country, categories, moq, capacity, contact_name, phone, email, website, notes)
       values (@id, @name, @city, @country, @categories, @moq, @capacity, @contact_name, @phone, @email, @website, @notes)`
    )
    .run({ id, ...input, categories: JSON.stringify(input.categories) });
  return parseRow(getDb().prepare('select * from factories where id = ?').get(id) as FactoryRowRaw);
}

export function updateFactory(id: string, input: FactoryInput): FactoryRow | null {
  getDb()
    .prepare(
      `update factories set name=@name, city=@city, country=@country, categories=@categories, moq=@moq,
       capacity=@capacity, contact_name=@contact_name, phone=@phone, email=@email, website=@website, notes=@notes,
       updated_at=datetime('now') where id=@id`
    )
    .run({ id, ...input, categories: JSON.stringify(input.categories) });
  const row = getDb().prepare('select * from factories where id = ?').get(id) as FactoryRowRaw | undefined;
  return row ? parseRow(row) : null;
}

export function deleteFactory(id: string): void {
  getDb().prepare('delete from factories where id = ?').run(id);
}
