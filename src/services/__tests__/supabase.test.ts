import { describe, it, expect } from 'vitest';
import {
  fetchBooks,
  fetchNotes,
  fetchGallery,
  fetchProducts,
  fetchPublications,
  fetchMarketplace,
  Book,
  Note,
  GalleryItem,
  Product,
  Publication,
  MarketplaceItem,
} from '../supabase';

describe('Supabase Service Unit Tests', () => {
  it('should fall back gracefully to seed data when Supabase client is not configured', async () => {
    const mockBook: Book = {
      id: 'b1',
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      cover_url: '',
      status: 'read',
    };
    const books = await fetchBooks([mockBook]);
    expect(books).toEqual([mockBook]);

    const mockNote: Note = {
      id: 'n1',
      title: 'Test Note',
      type: 'Observation',
      date: '2026-07-22',
      is_featured: true,
      observation: 'Observation test text',
    };
    const notes = await fetchNotes([mockNote]);
    expect(notes).toEqual([mockNote]);

    const mockGallery: GalleryItem = {
      id: 'g1',
      title: 'Gallery Item',
      description: 'Desc',
      image_url: '',
      category: 'projects',
      date: '2026-07-22',
      tags: ['test'],
    };
    const gallery = await fetchGallery([mockGallery]);
    expect(gallery).toEqual([mockGallery]);

    const mockProduct: Product = {
      id: 'p1',
      name: 'Test Product',
      tagline: 'Tagline',
      description: 'Desc',
      logo_url: '',
      tags: ['test'],
      status: 'live',
      is_featured: true,
    };
    const products = await fetchProducts([mockProduct]);
    expect(products).toEqual([mockProduct]);

    const mockPublication: Publication = {
      id: 'pub1',
      title: 'Paper',
      platform: 'Medium',
      url: 'https://medium.com',
      date: '2026-07-22',
      summary: 'Summary',
      tags: ['tech'],
      read_time_mins: 5,
    };
    const publications = await fetchPublications([mockPublication]);
    expect(publications).toEqual([mockPublication]);

    const mockMarketplace: MarketplaceItem = {
      id: 'm1',
      name: 'Item',
      category: 'template',
      tagline: 'Tagline',
      description: 'Desc',
      icon: '⚡',
      price: 'Free',
      tags: ['template'],
      is_featured: true,
    };
    const marketplace = await fetchMarketplace([mockMarketplace]);
    expect(marketplace).toEqual([mockMarketplace]);
  });
});
