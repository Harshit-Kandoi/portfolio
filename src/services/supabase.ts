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

export interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  category?: string;
  status: 'reading' | 'read' | 'wishlist';
  rating?: number; // 1-5, only if read
  note?: string; // Personal notes for read books
  whyOnShelf?: string; // Reason why book is on shelf if unread
  oneThing?: string; // "One thing that stayed with me"
  buyUrl?: string; // Affiliate buy link
  year_read?: number;
  // Backward compatibility optional fields
  review?: string;
  takeaways?: string[];
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

export type MarketplaceCategory = 'template' | 'tool' | 'asset' | 'service' | 'personal';

export interface MarketplaceItem {
  id: string;
  name: string;
  category: MarketplaceCategory;
  tagline: string;
  description: string;
  icon: string; // emoji or icon key
  price: string; // 'Free', '$9', '₹499', etc.
  amountPaise?: number;
  
  // Software Metadata
  version?: string;
  license?: string;
  framework?: string;
  techStack?: string[];
  lastUpdated?: string;
  fileSize?: string;
  downloads?: number | string;
  githubStars?: number | string;
  
  // Links & Commands
  install_cmd?: string;
  repo_url?: string;
  demo_url?: string;
  docs_url?: string;
  story_url?: string;
  story_content?: string;
  
  // Services & Assets
  delivery_time?: string;
  availability?: string;
  file_format?: string;
  compatible_with?: string;
  
  tags: string[];
  is_featured: boolean;
  color?: string;
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
