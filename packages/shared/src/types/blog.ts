import { SEOMeta, Timestamp } from './common';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorId: string;
  authorName: string;
  categoryId?: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: Timestamp;
  seo: SEOMeta;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BlogCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  postCount: number;
}
