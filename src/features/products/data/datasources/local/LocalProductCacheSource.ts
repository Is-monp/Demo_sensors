// src/features/product/data/datasources/cache/LocalProductCacheSource.ts
import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { Product } from "../../../domain/entities/Product";

export class LocalProductCacheSource {
  private static readonly CACHE_KEY = "cache_products";
  private static readonly CACHE_TIMESTAMP_KEY = "cache_products_timestamp";
  private static readonly CACHE_TTL_MINUTES = 10;

  private readonly prefs: ILocalPreferences;

  constructor() {
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
  }

  async isCacheValid(): Promise<boolean> {
    try {
      const timestampStr = await this.prefs.retrieveData<string>(
        LocalProductCacheSource.CACHE_TIMESTAMP_KEY
      );
      if (!timestampStr) return false;

      const timestamp = new Date(timestampStr);
      const diffMinutes = (Date.now() - timestamp.getTime()) / 1000 / 60;
      const isValid = diffMinutes < LocalProductCacheSource.CACHE_TTL_MINUTES;

      console.log(
        `⏱️ Product cache age: ${diffMinutes.toFixed(1)}m` +
          ` / TTL: ${LocalProductCacheSource.CACHE_TTL_MINUTES}m` +
          ` → ${isValid ? "VALID ✅" : "EXPIRED ❌"}`
      );

      return isValid;
    } catch (e) {
      console.error("Error checking product cache validity:", e);
      return false;
    }
  }

  async cacheProductData(products: Product[]): Promise<void> {
    try {
      const encoded = JSON.stringify(products);
      await this.prefs.storeData(LocalProductCacheSource.CACHE_KEY, encoded);
      await this.prefs.storeData(
        LocalProductCacheSource.CACHE_TIMESTAMP_KEY,
        new Date().toISOString()
      );
      console.log(`💾 Product cache saved: ${products.length} products`);
    } catch (e) {
      throw e;
    }
  }

  async getCachedProductData(): Promise<Product[]> {
    try {
      const encoded = await this.prefs.retrieveData<string>(
        LocalProductCacheSource.CACHE_KEY
      );

      if (!encoded || encoded.trim() === "") {
        console.log("📦 No product cache found");
        throw new Error("No product cache found");
      }

      const decoded = JSON.parse(encoded) as Product[];
      console.log(`📦 Product cache loaded: ${decoded.length} products`);
      return decoded;
    } catch (e) {
      console.error("Error reading product cache:", e);
      throw new Error("Failed to read product cache");
    }
  }

  async clearCache(): Promise<void> {
    try {
      await this.prefs.removeData(LocalProductCacheSource.CACHE_KEY);
      await this.prefs.removeData(
        LocalProductCacheSource.CACHE_TIMESTAMP_KEY
      );
      console.log("🗑️ Product cache invalidated");
    } catch (e) {
      console.error("Error invalidating product cache:", e);
    }
  }
}
