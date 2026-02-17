import { MoneyAmount } from './common';

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  image: string;
  price: MoneyAmount;
  quantity: number;
  stock: number;
}

export interface Cart {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  subtotal: MoneyAmount;
  itemCount: number;
  updatedAt: number;
}

export interface AddToCartInput {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
}
