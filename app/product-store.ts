"use client";

import { create } from "zustand";
import { api, getApiError } from "./api-client";
import {
  normalizeProduct,
  type ApiProduct,
  type ProductRecord,
} from "./product-types";

type ProductState = {
  products: ProductRecord[];
  loading: boolean;
  error: string;
  mutationId: string;
  fetchProducts: () => Promise<void>;
  toggleProduct: (product: ProductRecord) => Promise<void>;
  deleteProduct: (product: ProductRecord) => Promise<void>;
};

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  error: "",
  mutationId: "",
  fetchProducts: async () => {
    set({ loading: true, error: "" });
    try {
      const response = await api.get<
        ApiProduct[] | { products?: ApiProduct[] }
      >("/api/product");
      const records = Array.isArray(response.data)
        ? response.data
        : response.data.products || [];
      set({ products: records.map(normalizeProduct), loading: false });
    } catch (error) {
      set({
        loading: false,
        error: getApiError(error, "Unable to load products."),
      });
    }
  },
  toggleProduct: async (product) => {
    set({ mutationId: product.id, error: "" });
    try {
      await api.put(`/api/product/${product.id}`, {
        active: !product.active,
        isActive: !product.active,
      });
      set({
        products: get().products.map((item) =>
          item.id === product.id ? { ...item, active: !item.active } : item,
        ),
        mutationId: "",
      });
    } catch (error) {
      set({
        mutationId: "",
        error: getApiError(error, "Unable to update product status."),
      });
    }
  },
  deleteProduct: async (product) => {
    set({ mutationId: product.id, error: "" });
    try {
      await api.delete(`/api/product/${product.id}`);
      set({
        products: get().products.filter((item) => item.id !== product.id),
        mutationId: "",
      });
    } catch (error) {
      set({
        mutationId: "",
        error: getApiError(error, "Unable to delete product."),
      });
    }
  },
}));
