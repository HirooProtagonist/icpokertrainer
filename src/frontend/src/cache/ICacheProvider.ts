// ─── ICacheProvider — abstraction layer for range data caching ───────────────
// Iteration 1: interface + MemoryCacheProvider.
// Future iterations: LocalStorageCacheProvider (it2), IndexedDBCacheProvider (it3).

import type { RangeCell } from "../types/spot";

// ─── ICacheProvider interface ─────────────────────────────────────────────────

/**
 * Generic cache abstraction for RangeCell arrays keyed by spotId.
 * Implementations: MemoryCacheProvider (it1), LocalStorage (it2), IndexedDB (it3).
 * Future: prefetch() will be added in Iteration 4 when IndexedDB is in place.
 */
export interface ICacheProvider {
  /** Returns cached range cells for given spotId, or null if not cached. */
  get(key: string): Promise<RangeCell[] | null>;
  /** Stores range cells for given spotId. */
  set(key: string, value: RangeCell[]): Promise<void>;
  /** Clears all cached entries. */
  clear(): Promise<void>;
}

// ─── MemoryCacheProvider ─────────────────────────────────────────────────────

/**
 * In-memory implementation of ICacheProvider.
 * Wraps a Map<string, RangeCell[]> — fast, synchronous under the hood.
 * Lifecycle: tied to the JS module; cleared on page reload.
 */
export class MemoryCacheProvider implements ICacheProvider {
  private readonly store = new Map<string, RangeCell[]>();

  async get(key: string): Promise<RangeCell[] | null> {
    return this.store.get(key) ?? null;
  }

  async set(key: string, value: RangeCell[]): Promise<void> {
    this.store.set(key, value);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}
