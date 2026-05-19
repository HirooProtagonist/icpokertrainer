// ─── ICacheProvider — MemoryCacheProvider unit tests ─────────────────────────

import { describe, expect, it } from "vitest";
import type { RangeCell } from "../types/spot";
import { MemoryCacheProvider } from "./ICacheProvider";

const sampleCells: RangeCell[] = [
  { hand: "AA", actions: [{ action: "push", freq: 1.0 }] },
  { hand: "KK", actions: [{ action: "push", freq: 1.0 }] },
];

const altCells: RangeCell[] = [
  { hand: "QQ", actions: [{ action: "call", freq: 1.0 }] },
];

describe("MemoryCacheProvider — get", () => {
  it("returns null for a missing key", async () => {
    const cache = new MemoryCacheProvider();
    expect(await cache.get("nonexistent_spot")).toBeNull();
  });
});

describe("MemoryCacheProvider — set then get", () => {
  it("returns the stored array after set()", async () => {
    const cache = new MemoryCacheProvider();
    await cache.set("open_BTN_none_6max_15bb_nash", sampleCells);
    const result = await cache.get("open_BTN_none_6max_15bb_nash");
    expect(result).toEqual(sampleCells);
  });

  it("overwrites previous value when set() is called with the same key", async () => {
    const cache = new MemoryCacheProvider();
    await cache.set("open_BTN_none_6max_15bb_nash", sampleCells);
    await cache.set("open_BTN_none_6max_15bb_nash", altCells);
    const result = await cache.get("open_BTN_none_6max_15bb_nash");
    expect(result).toEqual(altCells);
    expect(result).not.toEqual(sampleCells);
  });
});

describe("MemoryCacheProvider — clear", () => {
  it("empties all entries — get returns null for any previously set key", async () => {
    const cache = new MemoryCacheProvider();
    await cache.set("open_BTN_none_6max_15bb_nash", sampleCells);
    await cache.set("call_shove_BB_BTN_6max_20bb_nash", altCells);

    await cache.clear();

    expect(await cache.get("open_BTN_none_6max_15bb_nash")).toBeNull();
    expect(await cache.get("call_shove_BB_BTN_6max_20bb_nash")).toBeNull();
  });
});
