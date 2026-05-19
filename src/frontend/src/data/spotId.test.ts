import { describe, expect, it } from "vitest";
import type { SpotParams } from "../types/spot";
import { buildSpotId, parseSpotId, validateSpotId } from "./spotId";

// ─── buildSpotId ─────────────────────────────────────────────────────────────

describe("buildSpotId", () => {
  it("builds open_push spot", () => {
    const p: SpotParams = {
      scenario: "open_push",
      heroPos: "BTN",
      villainPos: ["none"],
      players: "6max",
      stackBb: 20,
      icm: "nash",
    };
    expect(buildSpotId(p)).toBe("open_push_BTN_none_6max_20bb_nash");
  });

  it("builds bb_defence spot", () => {
    const p: SpotParams = {
      scenario: "bb_defence",
      heroPos: "BB",
      villainPos: ["BTN"],
      players: "6max",
      stackBb: 20,
      icm: "nash",
    };
    expect(buildSpotId(p)).toBe("bb_defence_BB_BTN_6max_20bb_nash");
  });

  it("builds bb_defence multiway 2 villains", () => {
    const p: SpotParams = {
      scenario: "bb_defence",
      heroPos: "BB",
      villainPos: ["CO", "BTN"],
      players: "6max",
      stackBb: 15,
      icm: "nash",
    };
    expect(buildSpotId(p)).toBe("bb_defence_BB_CO+BTN_6max_15bb_nash");
  });

  it("builds bb_defence multiway 3 villains", () => {
    const p: SpotParams = {
      scenario: "bb_defence",
      heroPos: "SB",
      villainPos: ["UTG", "MP", "CO"],
      players: "6max",
      stackBb: 20,
      icm: "nash",
    };
    expect(buildSpotId(p)).toBe("bb_defence_SB_UTG+MP+CO_6max_20bb_nash");
  });

  it("builds bb_defence with icm_bubble", () => {
    const p: SpotParams = {
      scenario: "bb_defence",
      heroPos: "CO",
      villainPos: ["UTG"],
      players: "6max",
      stackBb: 25,
      icm: "icm_bubble",
    };
    expect(buildSpotId(p)).toBe("bb_defence_CO_UTG_6max_25bb_icm_bubble");
  });

  it("builds vs_3bet spot", () => {
    const p: SpotParams = {
      scenario: "vs_3bet",
      heroPos: "BTN",
      villainPos: ["SB"],
      players: "9max",
      stackBb: 40,
      icm: "icm_ft",
    };
    expect(buildSpotId(p)).toBe("vs_3bet_BTN_SB_9max_40bb_icm_ft");
  });

  it("builds call_shove spot", () => {
    const p: SpotParams = {
      scenario: "call_shove",
      heroPos: "BB",
      villainPos: ["BTN"],
      players: "6max",
      stackBb: 15,
      icm: "icm_top3",
    };
    expect(buildSpotId(p)).toBe("call_shove_BB_BTN_6max_15bb_icm_top3");
  });
});

// ─── parseSpotId ─────────────────────────────────────────────────────────────

describe("parseSpotId", () => {
  it("parses simple open spot", () => {
    const result = parseSpotId("open_BTN_none_6max_20bb_nash");
    expect(result.scenario).toBe("open");
    expect(result.heroPos).toBe("BTN");
    expect(result.villainPos).toEqual(["none"]);
    expect(result.players).toBe("6max");
    expect(result.stackBb).toBe(20);
    expect(result.icm).toBe("nash");
  });

  it("parses squeeze with multiway villainPos", () => {
    const result = parseSpotId("squeeze_BB_CO+BTN_6max_15bb_nash");
    expect(result.villainPos).toEqual(["CO", "BTN"]);
  });

  it("parses 3-villain squeeze", () => {
    const result = parseSpotId("squeeze_SB_UTG+MP+CO_6max_20bb_nash");
    expect(result.villainPos).toEqual(["UTG", "MP", "CO"]);
  });

  it("parses icm_bubble variant", () => {
    const result = parseSpotId("vsopen_CO_UTG_6max_25bb_icm_bubble");
    expect(result.icm).toBe("icm_bubble");
  });

  it("parses stack correctly", () => {
    const result = parseSpotId("open_BTN_none_6max_100bb_nash");
    expect(result.stackBb).toBe(100);
  });

  it("throws on wrong segment count (5 segments)", () => {
    expect(() => parseSpotId("open_BTN_6max_20bb_nash")).toThrow();
  });

  it("throws on invalid stack segment", () => {
    expect(() => parseSpotId("open_BTN_none_6max_20_nash")).toThrow();
  });
});

// ─── validateSpotId ──────────────────────────────────────────────────────────

describe("validateSpotId", () => {
  it("valid simple open", () => {
    const r = validateSpotId("open_BTN_none_6max_20bb_nash");
    expect(r.valid).toBe(true);
    expect(r.errors).toHaveLength(0);
  });

  it("valid vsopen", () => {
    const r = validateSpotId("vsopen_CO_UTG_6max_25bb_nash");
    expect(r.valid).toBe(true);
  });

  it("valid squeeze multiway", () => {
    const r = validateSpotId("squeeze_BB_CO+BTN_6max_15bb_nash");
    expect(r.valid).toBe(true);
  });

  it("valid squeeze 3 villains multiway", () => {
    const r = validateSpotId("squeeze_SB_UTG+MP+CO_6max_20bb_nash");
    expect(r.valid).toBe(true);
  });

  it("valid 4bet icm_ft", () => {
    const r = validateSpotId("4bet_BTN_SB_9max_40bb_icm_ft");
    expect(r.valid).toBe(true);
  });

  it("invalid — all lowercase segments", () => {
    const r = validateSpotId("vsopen_co_utg_6max_25bb_nash");
    expect(r.valid).toBe(false);
    expect(r.errors.length).toBeGreaterThanOrEqual(2);
  });

  it("invalid — missing bb suffix in stack", () => {
    const r = validateSpotId("open_BTN_none_6max_20_nash");
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.includes("stack"))).toBe(true);
  });

  it("invalid — wrong segment count (7 segments)", () => {
    const r = validateSpotId("open_BTN_none_6max_20bb_unknown_icm");
    expect(r.valid).toBe(false);
  });

  it("invalid — unknown players format", () => {
    const r = validateSpotId("open_BTN_none_invalid_20bb_nash");
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.includes("players"))).toBe(true);
  });

  it("invalid — unknown villainPos", () => {
    const r = validateSpotId("open_BTN_INVALID_6max_20bb_nash");
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.includes("villainPos"))).toBe(true);
  });

  it("invalid — unknown ICM type", () => {
    const r = validateSpotId("open_BTN_none_6max_20bb_unknown_icm");
    // 7 segments → caught by segment count check
    expect(r.valid).toBe(false);
  });
});
