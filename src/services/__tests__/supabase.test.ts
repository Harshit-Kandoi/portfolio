import { describe, it, expect } from 'vitest';
import { fetchNotes, fetchProducts, Note, Product } from '../supabase';

describe('Supabase Service Unit Tests', () => {
  it('should fall back gracefully to seed data when Supabase client is not configured', async () => {
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
  });
});
