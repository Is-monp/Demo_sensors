import { NewProduct, Product } from "../entities/Product";

export interface ProductRepository {
  getProducts(): Promise<Product[]>;
  forceRefresh(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  addProduct(product: NewProduct): Promise<void>;
  updateProduct(product: Product): Promise<void>;
  deleteProduct(id: string): Promise<void>;
}
