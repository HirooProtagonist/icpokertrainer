// ─── sessionMapper — transforms HandResult[] → SessionData for canister ────
//
// Single place responsible for all data transformation before saveSession.
// Keeps SummaryScreen and useSaveSession clean and free of serialisation logic.

import type { SessionData } from "@/backend";
import type { HandResult } from "@/types/trainer";

// ─── buildSessionData ────────────────────────────────────────────────────────

export function buildSessionData(
  handResults: HandResult[],
  params: {
    scenario: string;
    stackRange: string;
    mode?: string;
    completedAt?: number;
  },
): SessionData {
  // Filter out any degenerate results before counting
  const valid = handResults.filter(
    (r) =>
      r.hand !== "" && r.spotId !== "" && r.spotId != null && r.verdict != null,
  );

  const correctCount = BigInt(
    valid.filter((r) => r.verdict === "correct").length,
  );
  const acceptableCount = BigInt(
    valid.filter((r) => r.verdict === "acceptable").length,
  );
  const mistakeCount = BigInt(
    valid.filter((r) => r.verdict === "mistake").length,
  );

  // HandResult.spotId is already in new format — use directly
  const spotResults: Array<[string, string]> = valid.map((r) => [
    r.spotId,
    r.verdict,
  ]);

  // Use provided completedAt (ms) or fall back to now; convert ms → ns
  const tsMs = params.completedAt ?? Date.now();

  const payload: SessionData = {
    completedAt: BigInt(Math.floor(tsMs)) * 1_000_000n, // ms → ns (Time.Time)
    scenario: params.scenario,
    stackRange: params.stackRange,
    handsPlayed: BigInt(valid.length),
    correctCount,
    acceptableCount,
    mistakeCount,
    spotResults,
    // Caller may specify mode (default: 'nash')
    mode: params.mode ?? "nash",
    // Optional IcmContext — undefined for Nash sessions
    icmContext: undefined,
  };
  return payload;
}
