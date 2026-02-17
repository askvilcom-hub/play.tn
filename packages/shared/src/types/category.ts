import { SEOMeta, Timestamp } from './common';

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  parentId: string | null;
  image?: string;
  icon?: string;
  order: number;
  isActive: boolean;
  productCount: number;
  seo: SEOMeta;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  logo?: string;
  description?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
