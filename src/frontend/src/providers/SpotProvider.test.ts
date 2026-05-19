// ─── SpotProvider Contract & Integration Tests ───────────────────────────────
// Level A: Contract tests for SPOT_DATA integrity
// Level B: Integration tests — buildSpotId → getRange → evaluateAnswer

import { describe, expect, it } from "vitest";
import { validateSpotId } from "../data/spotId";
import { type ActionType, type RangeCell, evaluateAnswer } from "../types/spot";
import { spotProvider } from "./SpotProvider";

import type { HandResult } from "../types/trainer";
import { buildSessionData } from "../utils/sessionMapper";
// ─── Level A — Contract Tests ─────────────────────────────────────────────────

describe("Level A — Contract: getRange returns non-empty array for every SPOT_DATA key", () => {
  it("resolves all known spotIds to non-empty RangeCell arrays", async () => {
    const ids = await spotProvider.listSpotIds();
    expect(ids.length).toBeGreaterThan(0);

    for (const id of ids) {
      const cells = await spotProvider.getRange(id);
      expect(cells, `spotId "${id}" returned empty range`).not.toHaveLength(0);
    }
  });
});

describe("Level A — Contract: all action frequencies sum to 1.0 ±0.001", () => {
  it("validates freq sum for every RangeCell in every spot", async () => {
    const ids = await spotProvider.listSpotIds();

    for (const id of ids) {
      const cells = await spotProvider.getRange(id);
      for (const cell of cells) {
        const sum = cell.actions.reduce((acc, af) => acc + af.freq, 0);
        expect(
          Math.abs(sum - 1.0),
          `Hand "${cell.hand}" in spot "${id}" has freq sum ${sum.toFixed(4)} (expected 1.0 ±0.001)`,
        ).toBeLessThanOrEqual(0.001);
      }
    }
  });
});

describe("Level A — Contract: all SPOT_DATA keys pass validateSpotId", () => {
  it("validates every key against the spotId schema", async () => {
    const ids = await spotProvider.listSpotIds();
    expect(ids.length).toBeGreaterThan(0);

    for (const id of ids) {
      const result = validateSpotId(id);
      expect(
        result.valid,
        `spotId "${id}" failed validation: ${result.errors.join(", ")}`,
      ).toBe(true);
    }
  });
});

// ─── Level B — Integration Tests ─────────────────────────────────────────────

describe("Level B — Integration: open_push BTN 20bb", () => {
  const spotId = "open_BTN_none_6max_20bb_nash";

  it("AA: evaluateAnswer('push') returns 'correct'", async () => {
    const cells = await spotProvider.getRange(spotId);
    const cell = cells.find((c) => c.hand === "AA");
    expect(cell, `AA not found in ${spotId}`).toBeDefined();
    expect(evaluateAnswer("push", cell!)).toBe("correct");
  });

  it("72o: evaluateAnswer('fold') returns 'correct'", async () => {
    const cells = await spotProvider.getRange(spotId);
    // 72o is NOT in the push range — range only contains push hands;
    // a hand absent from the range maps to no cell, so we create a fold-only cell
    // to represent the implicit fold. But the real test is that evaluateAnswer
    // treats a completely absent hand as a fold (mistake for push, correct for fold).
    // Since SPOT_DATA only stores hands IN the playing range, we test the
    // "fold is correct when hand is not in range" invariant directly.
    const cell = cells.find((c) => c.hand === "72o");
    expect(cell).toBeUndefined(); // 72o is a fold — not stored in push range

    // Simulate the fold-hand cell (as Trainer does for hands not in range)
    const foldCell: RangeCell = {
      hand: "72o",
      actions: [{ action: "fold", freq: 1.0 }],
    };
    expect(evaluateAnswer("fold", foldCell)).toBe("correct");
    expect(evaluateAnswer("push", foldCell)).toBe("mistake");
  });
});

describe("Level B — Integration: call_shove BB vs BTN 20bb", () => {
  const spotId = "call_shove_BB_BTN_6max_20bb_nash";

  it("AA: evaluateAnswer('call') returns 'correct'", async () => {
    const cells = await spotProvider.getRange(spotId);
    const cell = cells.find((c) => c.hand === "AA");
    expect(cell, `AA not found in ${spotId}`).toBeDefined();
    expect(evaluateAnswer("call", cell!)).toBe("correct");
  });

  it("72o: fold is correct (not in call range)", async () => {
    const cells = await spotProvider.getRange(spotId);
    const cell = cells.find((c) => c.hand === "72o");
    expect(cell).toBeUndefined(); // 72o is a fold — not stored in call range

    const foldCell: RangeCell = {
      hand: "72o",
      actions: [{ action: "fold", freq: 1.0 }],
    };
    expect(evaluateAnswer("fold", foldCell)).toBe("correct");
  });
});

describe("Level B — Integration: vsopen BB vs BTN 20bb", () => {
  const spotId = "vsopen_BB_BTN_6max_20bb_nash";

  it("AA: evaluateAnswer('3bet') returns 'correct'", async () => {
    const cells = await spotProvider.getRange(spotId);
    const cell = cells.find((c) => c.hand === "AA");
    expect(cell, `AA not found in ${spotId}`).toBeDefined();
    expect(evaluateAnswer("3bet", cell!)).toBe("correct");
  });

  it("72o: fold is correct (not in defence range)", async () => {
    const cells = await spotProvider.getRange(spotId);
    const cell = cells.find((c) => c.hand === "72o");
    expect(cell).toBeUndefined(); // 72o is a fold — not stored in defence range

    const foldCell: RangeCell = {
      hand: "72o",
      actions: [{ action: "fold", freq: 1.0 }],
    };
    expect(evaluateAnswer("fold", foldCell)).toBe("correct");
  });
});

// ─── Level B — Integration: mixed strategy evaluateAnswer ────────────────────

describe("Level B — Integration: mixed strategy — evaluateAnswer returns 'acceptable'", () => {
  it("a hand with push(0.6)+fold(0.4): both actions are 'acceptable'", () => {
    // Simulates a borderline hand where solver recommends push 60% / fold 40%.
    // Both actions should be acceptable (freq >= 0.2), push is 'correct' (dominant).
    const mixedCell: RangeCell = {
      hand: "A2o",
      actions: [
        { action: "push", freq: 0.6 },
        { action: "fold", freq: 0.4 },
      ],
    };
    // push is the primary action (highest freq) → correct
    expect(evaluateAnswer("push", mixedCell)).toBe("correct");
    // fold has freq 0.4 >= 0.2 → acceptable
    expect(evaluateAnswer("fold", mixedCell)).toBe("acceptable");
  });

  it("a hand with call(0.7)+fold(0.3): call is 'correct', fold is 'acceptable'", () => {
    const mixedCell: RangeCell = {
      hand: "K9o",
      actions: [
        { action: "call", freq: 0.7 },
        { action: "fold", freq: 0.3 },
      ],
    };
    expect(evaluateAnswer("call", mixedCell)).toBe("correct");
    expect(evaluateAnswer("fold", mixedCell)).toBe("acceptable");
  });

  it("a hand with three actions (3bet/call/fold): 3bet is 'correct', call is 'acceptable', fold is 'mistake'", () => {
    // freq < 0.2 for fold → mistake even in a mixed strategy spot
    const tripleCell: RangeCell = {
      hand: "AJs",
      actions: [
        { action: "3bet", freq: 0.55 },
        { action: "call", freq: 0.35 },
        { action: "fold", freq: 0.1 },
      ],
    };
    expect(evaluateAnswer("3bet", tripleCell)).toBe("correct");
    expect(evaluateAnswer("call", tripleCell)).toBe("acceptable");
    expect(evaluateAnswer("fold", tripleCell)).toBe("mistake"); // freq 0.10 < 0.20
  });

  it("action not present in cell at all → 'mistake'", () => {
    const pureCell: RangeCell = {
      hand: "AA",
      actions: [{ action: "push", freq: 1.0 }],
    };
    expect(evaluateAnswer("fold" as ActionType, pureCell)).toBe("mistake");
  });
});
// ─── Grey cell contract tests ─────────────────────────────────────────────────

describe("Grey cell — evaluateAnswer on empty-actions cell", () => {
  const greyCell: RangeCell = { hand: "72o", actions: [] };

  it("fold on grey cell → 'correct'", () => {
    expect(evaluateAnswer("fold", greyCell)).toBe("correct");
  });

  it("push on grey cell → 'mistake'", () => {
    expect(evaluateAnswer("push", greyCell)).toBe("mistake");
  });

  it("call on grey cell → 'mistake'", () => {
    expect(evaluateAnswer("call", greyCell)).toBe("mistake");
  });

  it("a real hand in range folded → 'mistake' (not a grey cell)", async () => {
    // Verify the opposite: a hand that IS in the range should NOT give 'correct' for fold
    const cells = await spotProvider.getRange("open_BTN_none_6max_20bb_nash");
    const aaCell = cells.find((c) => c.hand === "AA");
    expect(aaCell).toBeDefined();
    // AA has push(1.0) — fold is not in range, so evaluateAnswer returns 'mistake'
    expect(evaluateAnswer("fold", aaCell!)).toBe("mistake");
  });
});

// ─── SessionData round-trip test ──────────────────────────────────────────────

describe("buildSessionData — round-trip", () => {
  const mockResults: HandResult[] = [
    {
      hand: "AA",
      scenario: "open_push",
      spotId: "open_BTN_none_6max_20bb_nash",
      playerAction: "push",
      correctFreq: 1.0,
      verdict: "correct",
    },
    {
      hand: "KK",
      scenario: "open_push",
      spotId: "open_BTN_none_6max_20bb_nash",
      playerAction: "push",
      correctFreq: 1.0,
      verdict: "correct",
    },
    {
      hand: "A2o",
      scenario: "open_push",
      spotId: "open_BTN_none_6max_20bb_nash",
      playerAction: "fold",
      correctFreq: 0.6,
      verdict: "acceptable",
    },
    {
      hand: "72o",
      scenario: "open_push",
      spotId: "open_BTN_none_6max_20bb_nash",
      playerAction: "push",
      correctFreq: 0.0,
      verdict: "mistake",
    },
  ];

  const completedAt = 1_700_000_000_000; // fixed ms timestamp for determinism

  it("handsPlayed matches results.length", () => {
    const session = buildSessionData(mockResults, {
      scenario: "open_15bb",
      stackRange: "10-20bb",
      mode: "nash",
      completedAt,
    });
    expect(session.handsPlayed).toBe(BigInt(mockResults.length));
  });

  it("correctCount, acceptableCount, mistakeCount match expected", () => {
    const session = buildSessionData(mockResults, {
      scenario: "open_15bb",
      stackRange: "10-20bb",
      mode: "nash",
      completedAt,
    });
    expect(session.correctCount).toBe(2n);
    expect(session.acceptableCount).toBe(1n);
    expect(session.mistakeCount).toBe(1n);
  });

  it("spotResults is an array of [spotId, verdict] tuples", () => {
    const session = buildSessionData(mockResults, {
      scenario: "open_15bb",
      stackRange: "10-20bb",
      mode: "nash",
      completedAt,
    });
    expect(Array.isArray(session.spotResults)).toBe(true);
    expect(session.spotResults).toHaveLength(mockResults.length);
    for (const [spotId, verdict] of session.spotResults) {
      expect(typeof spotId).toBe("string");
      expect(["correct", "acceptable", "mistake"]).toContain(verdict);
    }
  });

  it("mode is 'nash'", () => {
    const session = buildSessionData(mockResults, {
      scenario: "open_15bb",
      stackRange: "10-20bb",
      mode: "nash",
      completedAt,
    });
    expect(session.mode).toBe("nash");
  });

  it("icmContext is undefined (null in Candid terms)", () => {
    const session = buildSessionData(mockResults, {
      scenario: "open_15bb",
      stackRange: "10-20bb",
      mode: "nash",
      completedAt,
    });
    expect(session.icmContext).toBeUndefined();
  });

  it("completedAt bigint equals BigInt(Math.floor(completedAt)) * 1_000_000n", () => {
    const session = buildSessionData(mockResults, {
      scenario: "open_15bb",
      stackRange: "10-20bb",
      mode: "nash",
      completedAt,
    });
    const expected = BigInt(Math.floor(completedAt)) * 1_000_000n;
    expect(session.completedAt).toBe(expected);
  });
});
