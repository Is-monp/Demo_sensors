export const TOKENS = {
  AuthRemoteDS: Symbol("AuthRemoteDS"),
  AuthRepo: Symbol("AuthRepo"),
  LocalProductCacheDS: Symbol("LocalProductCacheDS"),
  ProductRemoteDS: Symbol("ProductRemoteDS"),
  ProductRepo: Symbol("ProductRepo"),
  // Add Product tokens if you want to DI those too...
} as const;
