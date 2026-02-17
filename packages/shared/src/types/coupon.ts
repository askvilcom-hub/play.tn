import { MoneyAmount, Timestamp } from './common';

export type DiscountType = 'percentage' | 'fixed';

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minimumOrder?: MoneyAmount;
  maximumDiscount?: MoneyAmount;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  applicableCategories: string[];
  applicableProducts: string[];
  isActive: boolean;
  startsAt: Timestamp;
  expiresAt: Timestamp;
  createdAt: Timestamp;
}

export interface ApplyCouponInput {
  code: string;
  cartTotal: MoneyAmount;
  items: { productId: string; categoryId: string; total: MoneyAmount }[];
}
