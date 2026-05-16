import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { NewProduct, Product } from "@/src/features/products/domain/entities/Product";
import { ProductRepository } from "../../domain/repositories/ProductRepository";

export type ProductContextType = {
  products: Product[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  clearError: () => void;
  addProduct: (product: NewProduct) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => Promise<Product | undefined>;
  refreshProducts: () => Promise<void>;
  forceRefresh: () => Promise<void>;
};

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const di = useDI();

  // ✅ Directly resolve the repository, no use cases
  const productRepo = useMemo(() => di.resolve<ProductRepository>(TOKENS.ProductRepo), [di]);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const clearError = () => setError(null);

  useEffect(() => {
    refreshProducts();
  }, []);

  const refreshProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const list = await productRepo.getProducts();
      setProducts(list);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const forceRefresh = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      const list = await productRepo.forceRefresh();
      setProducts(list);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const addProduct = async (product: NewProduct) => {
    try {
      setIsLoading(true);
      setError(null);
      await productRepo.addProduct(product);
      await refreshProducts();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      setIsLoading(true);
      setError(null);
      await productRepo.updateProduct(product);
      await refreshProducts();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const removeProduct = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await productRepo.deleteProduct(id);
      await refreshProducts();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const getProduct = async (id: string) => {
    if (__DEV__) console.log("Getting product with id:", id);
    try {
      setIsLoading(true);
      setError(null);
      return await productRepo.getProductById(id);
    } catch (e) {
      setError((e as Error).message);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      products,
      isLoading,
      isRefreshing,
      error,
      clearError,
      addProduct,
      updateProduct,
      removeProduct,
      getProduct,
      refreshProducts,
      forceRefresh,
    }),
    [products, isLoading, error]
  );

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used inside ProductProvider");
  return ctx;
}
