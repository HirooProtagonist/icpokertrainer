// ─── SpotId утилиты ICPokerTrainer ───────────────────────────────────────────
// Формат: {scenario}_{heroPos}_{villainPos}_{players}_{stack}bb_{icm}
// villainPos: 'none' для open, 'CO+BTN' для multiway squeeze

import type {
  FormatType,
  IcmType,
  PositionType,
  ScenarioType,
  SpotParams,
} from "../types/spot";

// ─── Реестры допустимых значений ─────────────────────────────────────────────

export const VALID_SCENARIOS = [
  "open_push",
  "call_shove",
  "bb_defence",
  "open_raise",
  "vs_3bet",
  "squeeze",
  "4bet",
  "5bet",
  // Legacy scenario values — kept for spotId validation of existing data only
  "open",
  "vsopen",
] as const;

export const VALID_POSITIONS = [
  "UTG",
  "MP",
  "HJ",
  "CO",
  "BTN",
  "SB",
  "BB",
  "none", // sentinel for open spots (no villain)
] as const;

export const VALID_FORMATS = ["6max", "9max"] as const;

export const VALID_ICM = ["nash", "icm_bubble", "icm_ft", "icm_top3"] as const;

// ─── buildSpotId ─────────────────────────────────────────────────────────────

/**
 * Собирает строку spotId из структурированных параметров.
 * Никогда не собирайте spotId конкатенацией строк вручную — используйте эту функцию.
 *
 * villainPos entries are sorted by table position order: UTG < MP < HJ < CO < BTN < SB < BB.
 * Use 'none' as the only entry for open spots with no explicit villain.
 *
 * @example
 * buildSpotId({ scenario: 'open_push', heroPos: 'BTN', villainPos: ['none'],
 *   players: '6max', stackBb: 15, icm: 'nash' })
 * // → 'open_push_BTN_none_6max_15bb_nash'
 *
 * @example
 * buildSpotId({ scenario: 'bb_defence', heroPos: 'BB', villainPos: ['CO', 'BTN'],
 *   players: '6max', stackBb: 15, icm: 'nash' })
 * // → 'bb_defence_BB_CO+BTN_6max_15bb_nash'
 */
export function buildSpotId(p: SpotParams): string {
  const villainSeg = p.villainPos.join("+");
  // Fixed 6 segments: scenario, heroPos, villainPos, players, stackBb, icm
  // ICM values containing '_' (icm_bubble, icm_ft, icm_top3) are always last
  return [
    p.scenario,
    p.heroPos,
    villainSeg,
    p.players,
    `${p.stackBb}bb`,
    p.icm,
  ].join("_");
}

// ─── parseSpotId ─────────────────────────────────────────────────────────────

/**
 * Парсит строку spotId обратно в SpotParams.
 * Бросает ошибку при неправильном формате — используйте validateSpotId для мягкой проверки.
 */
export function parseSpotId(id: string): SpotParams {
  // Scenarios may contain '_' (e.g. call_shove, open_push, bb_defence, vs_3bet).
  // Strategy: try to match the longest known scenario prefix first.
  const matched = (VALID_SCENARIOS as readonly string[]).find((s) =>
    id.startsWith(`${s}_`),
  );
  if (!matched) {
    throw new Error(`Invalid spotId: "${id}" — unrecognised scenario prefix`);
  }
  const rest = id.slice(matched.length + 1); // strip "scenario_"
  const restParts = rest.split("_");
  // rest: heroPos_villainSeg_players_stackSeg_icm...
  // restParts must have at least 5 elements
  if (restParts.length < 5) {
    throw new Error(
      `Invalid spotId: "${id}" — expected at least 6 segments, got ${restParts.length + 1}`,
    );
  }
  const [heroPos, villainSeg, players, stackSeg, ...icmParts] = restParts;
  const icm = icmParts.join("_");

  if (!icm) {
    throw new Error(`Invalid spotId: "${id}" — missing ICM segment`);
  }

  const stackMatch = stackSeg.match(/^(\d+)bb$/);
  if (!stackMatch) {
    throw new Error(
      `Invalid stack segment: "${stackSeg}" (expected format: "20bb")`,
    );
  }
  return {
    scenario: matched as ScenarioType,
    heroPos: heroPos as PositionType,
    villainPos: villainSeg.split("+") as PositionType[],
    players: players as FormatType,
    stackBb: Number.parseInt(stackMatch[1], 10),
    icm: icm as IcmType,
  };
}

// ─── validateSpotId ──────────────────────────────────────────────────────────

/**
 * Проверяет корректность строки spotId без выброса ошибки.
 * Возвращает { valid, errors } — список всех нарушений схемы.
 */
export function validateSpotId(id: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Match longest scenario prefix (scenarios may contain '_')
  const scenario = (VALID_SCENARIOS as readonly string[]).find((s) =>
    id.startsWith(`${s}_`),
  );
  if (!scenario) {
    return {
      valid: false,
      errors: [`Unrecognised scenario prefix in "${id}"`],
    };
  }

  const rest = id.slice(scenario.length + 1);
  const restParts = rest.split("_");
  // rest: heroPos_villainSeg_players_stackSeg_icm...
  if (restParts.length < 5) {
    return {
      valid: false,
      errors: [`Expected at least 6 segments, got ${restParts.length + 1}`],
    };
  }

  const [heroPos, villainSeg, players, stackSeg, ...icmParts] = restParts;
  const icm = icmParts.join("_");

  if (!(VALID_POSITIONS as readonly string[]).includes(heroPos)) {
    errors.push(`Unknown heroPos: "${heroPos}"`);
  }

  for (const vp of villainSeg.split("+")) {
    if (!(VALID_POSITIONS as readonly string[]).includes(vp)) {
      errors.push(`Unknown villainPos: "${vp}"`);
    }
  }

  if (!(VALID_FORMATS as readonly string[]).includes(players)) {
    errors.push(`Unknown players format: "${players}"`);
  }
  if (!/^\d+bb$/.test(stackSeg)) {
    errors.push(`Invalid stack segment: "${stackSeg}" (expected e.g. "20bb")`);
  }
  if (!(VALID_ICM as readonly string[]).includes(icm)) {
    errors.push(`Unknown ICM type: "${icm}"`);
  }

  return { valid: errors.length === 0, errors };
}
