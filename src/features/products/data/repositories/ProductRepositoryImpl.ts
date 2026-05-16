// src/features/product/data/repositories/ProductRepositoryImpl.ts
import { NewProduct, Product } from "../../domain/entities/Product";
import { ProductRepository } from "../../domain/repositories/ProductRepository";
import { LocalProductCacheSource } from "../datasources/local/LocalProductCacheSource";
import { ProductDataSource } from "../datasources/ProductDataSource";

export class ProductRepositoryImpl implements ProductRepository {

  private readonly remote: ProductDataSource;
  private readonly cache: LocalProductCacheSource;

  constructor( remote: ProductDataSource, cache: LocalProductCacheSource) {
    this.remote = remote;
    this.cache = cache;
  }

  async getProducts(): Promise<Product[]> {
    // 1️⃣ Intentar desde cache
    try {
      if (await this.cache.isCacheValid()) {
        return await this.cache.getCachedProductData();
      }
    } catch {
      // Cache falló → continuar al remote
    }

    // 2️⃣ Cache miss → llamar al datasource remoto
    console.log("🌐 Cache miss: Fetching from remote");

    try {
      const products = await this.remote.getProducts();
      await this.cache.cacheProductData(products);
      return products;
    } catch (e) {
      console.error("Error fetching products from remote:", e);
      throw e;
    }
  }

  async getProductById(id: string): Promise<Product | undefined> {
    // Buscar en cache antes de ir al remote
    try {
      if (await this.cache.isCacheValid()) {
        const cached = await this.cache.getCachedProductData();
        const found = cached.find((p) => p._id === id);
        if (found) {
          console.log(`📦 Cache hit for product id: ${id}`);
          return found;
        }
      }
    } catch {
      // Ignorar errores de cache
    }

    return this.remote.getProductById(id);
  }

  async addProduct(product: NewProduct): Promise<void> {
    await this.remote.addProduct(product);
    await this.cache.clearCache(); // 🗑️ Invalidar
  }

  async updateProduct(product: Product): Promise<void> {
    await this.remote.updateProduct(product);
    await this.cache.clearCache(); // 🗑️ Invalidar
  }

  async deleteProduct(id: string): Promise<void> {
    await this.remote.deleteProduct(id);
    await this.cache.clearCache(); // 🗑️ Invalidar
  }

  // ── Extras ────────────────────────────────────────────────

  async forceRefresh(): Promise<Product[]> {
    console.log("🔄 Force refresh from remote");
    const products = await this.remote.getProducts();
    await this.cache.cacheProductData(products);
    return products;
  }

  async clearCache(): Promise<void> {
    await this.cache.clearCache();
  }
}
