// src/types/index.ts
// Global TypeScript type definitions

import type { Product, User, Order, OrderItem, Review, Address, Cart } from "@prisma/client";

// ─── Re-export Prisma types ──────────────────────────────────────────────────
export type { Product, User, Order, OrderItem, Review, Address, Cart };

// ─── Extended types ──────────────────────────────────────────────────────────

export type ProductWithReviews = Product & {
  reviews: (Review & {
    user: Pick<User, "id" | "name" | "image">;
  })[];
  _count: {
    reviews: number;
    orderItems: number;
  };
};

export type CartWithProduct = Cart & {
  product: Product;
};

export type OrderWithItems = Order & {
  orderItems: (OrderItem & {
    product: Pick<Product, "id" | "name" | "slug" | "imageUrls">;
  })[];
  address: Address | null;
};

export type UserProfile = Pick<
  User,
  "id" | "email" | "name" | "image" | "role" | "createdAt"
> & {
  addresses: Address[];
  _count: {
    orders: number;
    reviews: number;
  };
};

// ─── API Response types ──────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─── Server Action return types ───────────────────────────────────────────────

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

// ─── Product types ───────────────────────────────────────────────────────────

export type ProductCategory =
  | "floral"
  | "woody"
  | "oriental"
  | "fresh"
  | "citrus"
  | "gourmand"
  | "chypre"
  | "fougere"
  | "aquatic";

export type ProductConcentration = "Parfum" | "EDP" | "EDT" | "EDC" | "Splash";
export type ProductGender = "unisex" | "masculine" | "feminine";

export type SortOption = "price_asc" | "price_desc" | "newest" | "popular";

// ─── Midtrans types ──────────────────────────────────────────────────────────

export type PaymentStatus = "UNPAID" | "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";
export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
