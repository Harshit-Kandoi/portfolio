import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// ─── Client (gracefully handles missing env vars) ────────────────────────────
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  category: string;
  status: 'reading' | 'read' | 'wishlist';
  rating: number; // 1-5
  review: string;
  takeaways: string[];
  year_read?: number;
}

export interface Note {
  id: string;
  title: string;
  content: string; // Markdown
  tags: string[];
  date: string; // ISO date string
  read_time_mins: number;
  is_featured: boolean;
  category?: string;
  status?: 'stable' | 'evolving' | 'experiment';
  last_updated?: string;
  observation?: string;
  takeaways?: string[];
  still_thinking?: string;
  thought_type?: 'Thought' | 'Observation' | 'Principle' | 'Question' | 'Mistake' | 'Experiment' | 'Lesson' | 'Framework';
  related_note_ids?: string[];
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: 'projects' | 'hobbies' | 'creative' | 'travel';
  date: string;
  tags: string[];
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  logo_url: string;
  demo_url?: string;
  repo_url?: string;
  tags: string[];
  status: 'live' | 'beta' | 'archived' | 'wip';
  stars?: number;
  is_featured: boolean;
}

export interface Publication {
  id: string;
  title: string;
  platform: string; // 'Medium', 'Dev.to', 'Research Paper', etc.
  url: string;
  date: string;
  summary: string;
  tags: string[];
  read_time_mins: number;
  cover_url?: string;
  views?: number;
}

export interface MarketplaceItem {
  id: string;
  name: string;
  category: 'tool' | 'template' | 'service' | 'open-source';
  tagline: string;
  description: string;
  icon: string; // emoji
  price: string; // 'Free', '$9', etc.
  repo_url?: string;
  install_cmd?: string;
  tags: string[];
  downloads?: number;
  is_featured: boolean;
}

// ─── Fetchers with static fallback ───────────────────────────────────────────

async function fetchFromSupabase<T>(
  table: string,
  fallback: T[]
): Promise<T[]> {
  if (!supabase) return fallback;
  const { data, error } = await supabase.from(table).select('*');
  if (error || !data) return fallback;
  return data as T[];
}

export const fetchBooks = (fallback: Book[]) =>
  fetchFromSupabase<Book>('books', fallback);

export const fetchNotes = (fallback: Note[]) =>
  fetchFromSupabase<Note>('notes', fallback);

export const fetchGallery = (fallback: GalleryItem[]) =>
  fetchFromSupabase<GalleryItem>('gallery', fallback);

export const fetchProducts = (fallback: Product[]) =>
  fetchFromSupabase<Product>('products', fallback);

export const fetchPublications = (fallback: Publication[]) =>
  fetchFromSupabase<Publication>('publications', fallback);

export const fetchMarketplace = (fallback: MarketplaceItem[]) =>
  fetchFromSupabase<MarketplaceItem>('marketplace', fallback);
