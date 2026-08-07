import { api } from "./client";

// ----- Brand embedded in product responses (match backend domain Brand shape) -----
export interface ProductBrand {
  id: number;
  name: string;
  slug?: string;
}

// ----- Full Product type returned by backend -----
export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  image?: string | null;
  isActive: boolean;
  category: string;
  brandId: number;
  brand?: ProductBrand;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// ----- Inputs (match backend DTOs) -----
export interface CreateProductInput {
  sku: string;
  name: string;
  description?: string | null;
  price: number;
  stock?: number; // default 1
  image?: string | null;
  isActive?: boolean; // default true
  category: string;
  brandId: number;
}

export type UpdateProductInput = Partial<CreateProductInput>;

// ----- Infinity pagination response envelope (backend: infinityPagination()) -----
export interface ProductsListResponse {
  data: Product[];
  hasNextPage: boolean;
}

// ----- Convenience helpers (in case non-hook callers need direct access) -----
export const productsApi = {
  list: (page = 1, limit = 50) =>
    api.get<ProductsListResponse>(`/products?page=${page}&limit=${limit}`),
  get: (id: string) => api.get<Product>(`/products/${id}`),
  create: (payload: CreateProductInput) =>
    api.post<Product>(`/products`, payload),
  update: (id: string, payload: UpdateProductInput) =>
    api.patch<Product | null>(`/products/${id}`, payload),
  remove: (id: string) => api.delete<void>(`/products/${id}`),
};