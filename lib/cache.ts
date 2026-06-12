import { redis } from "./redis";

const PRODUCTS_KEY = "cache:products";
const PRODUCTS_TTL = 60; // seconds

export async function getCachedProducts() {
  return redis.get<unknown[]>(PRODUCTS_KEY);
}

export async function setCachedProducts(products: unknown[]) {
  await redis.set(PRODUCTS_KEY, products, { ex: PRODUCTS_TTL });
}

export async function invalidateProductsCache() {
  await redis.del(PRODUCTS_KEY);
}
