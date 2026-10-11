import { createClient } from '@supabase/supabase-js';
import type { Note } from '../types/note-types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// ─── Client (gracefully handles missing env vars) ────────────────────────────
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ─── Types ────────────────────────────────────────────────────────────────────

export type { Note };

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  logo_url: string;
  demo_url?: string;
  repo_url?: string;
  tags: string[];
  status: 'live' | 'beta' | 'complete' | 'wip' | 'archived';
  stars?: number;
  is_featured: boolean;
}

// ─── Fetchers with static fallback ───────────────────────────────────────────

async function fetchFromSupabase<T>(
  table: string,
  fallback: T[]
): Promise<T[]> {
  if (!supabase) return fallback;
  const { data, error } = await supabase.from(table).select('*');
  // An empty table keeps the bundled seed data instead of blanking the app.
  if (error || !data || data.length === 0) return fallback;
  return data as T[];
}

export const fetchNotes = (fallback: Note[]) =>
  fetchFromSupabase<Note>('notes', fallback);

export const fetchProducts = (fallback: Product[]) =>
  fetchFromSupabase<Product>('products', fallback);
