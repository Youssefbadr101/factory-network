'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { checkPassword, setAdminCookie, clearAdminCookie, isAdmin } from './auth';
import { insertFactory, updateFactory, deleteFactory, type FactoryInput } from './db';

export async function login(formData: FormData) {
  const password = (formData.get('password') as string) ?? '';
  if (!checkPassword(password)) {
    redirect('/admin/login?error=1');
  }
  await setAdminCookie();
  redirect('/admin');
}

export async function logout() {
  await clearAdminCookie();
  redirect('/');
}

function parseInput(formData: FormData): FactoryInput {
  const str = (key: string) => (formData.get(key) as string | null)?.trim() || null;
  const categories = (formData.get('categories') as string | null)
    ?.split(',')
    .map((c) => c.trim())
    .filter(Boolean) ?? [];

  return {
    name: str('name') ?? '',
    city: str('city'),
    country: str('country'),
    categories,
    moq: str('moq'),
    capacity: str('capacity'),
    contact_name: str('contact_name'),
    phone: str('phone'),
    email: str('email'),
    website: str('website'),
    notes: str('notes'),
  };
}

export async function addFactory(formData: FormData) {
  if (!(await isAdmin())) redirect('/admin/login');
  const input = parseInput(formData);
  if (!input.name) return;
  await insertFactory(input);
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function editFactory(id: string, formData: FormData) {
  if (!(await isAdmin())) redirect('/admin/login');
  const input = parseInput(formData);
  if (!input.name) return;
  await updateFactory(id, input);
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function removeFactory(id: string) {
  if (!(await isAdmin())) redirect('/admin/login');
  await deleteFactory(id);
  revalidatePath('/');
  revalidatePath('/admin');
}
