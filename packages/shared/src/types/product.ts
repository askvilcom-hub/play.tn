import { MoneyAmount, SEOMeta, Timestamp } from './common';

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  order: number;
  isMain: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: MoneyAmount;
  compareAtPrice?: MoneyAmount;
  stock: number;
  attributes: Record<string, string>;
  isActive: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  categoryPath: string[];
  brandId?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  price: MoneyAmount;
  compareAtPrice?: MoneyAmount;
  sku: string;
  stock: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  averageRating: number;
  reviewCount: number;
  seo: SEOMeta;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProductListItem {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  mainImage: string;
  price: MoneyAmount;
  compareAtPrice?: MoneyAmount;
  averageRating: number;
  reviewCount: number;
  isOnSale: boolean;
  isFeatured: boolean;
  stock: number;
  categoryId: string;
}

export interface ProductFilter {
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  inStock?: boolean;
  onSale?: boolean;
  search?: string;
  sortBy?: 'price' | 'name' | 'rating' | 'createdAt' | 'popularity';
  sortDir?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateProductInput {
  name: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  brandId?: string;
  variants: Omit<ProductVariant, 'id'>[];
  price: MoneyAmount;
  compareAtPrice?: MoneyAmount;
  sku: string;
  stock: number;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  tags: string[];
  isFeatured: boolean;
  seo: SEOMeta;
}
