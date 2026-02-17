import { Address, MoneyAmount, Timestamp } from './common';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod = 'stripe' | 'cod';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  productId: string;
  variantId?: string;
  name: string;
  image: string;
  sku: string;
  price: MoneyAmount;
  quantity: number;
  total: MoneyAmount;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  subtotal: MoneyAmount;
  shippingCost: MoneyAmount;
  tax: MoneyAmount;
  discount: MoneyAmount;
  total: MoneyAmount;
  couponCode?: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  stripePaymentIntentId?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateOrderInput {
  items: { productId: string; variantId?: string; quantity: number }[];
  shippingAddressId: string;
  billingAddressId: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
}

export interface OrderStatusUpdate {
  status: OrderStatus;
  trackingNumber?: string;
  notes?: string;
}
