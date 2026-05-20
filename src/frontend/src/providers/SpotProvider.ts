// ─── SpotProvider — абстрактный слой данных GTO-диапазонов ──────────────────
// Iteration 2: новый формат RangeCell с actions: ActionFreq[], ISpotProvider
// с Promise для будущей canister-совместимости.

import { buildSpotId as buildSpotIdNew, parseSpotId } from "../data/spotId";
import type {
  ActionFreq,
  FormatType,
  IcmContext,
  IcmType,
  RangeCell,
  ScenarioType,
} from "../types/spot";

// ─── SpotFilter ───────────────────────────────────────────────────────────────

export interface SpotFilter {
  scenario?: ScenarioType;
  players?: FormatType;
  stackBb?: number;
  icm?: IcmType;
}

// ─── ISpotProvider ───────────────────────────────────────────────────────────
// Async interface — allows seamless swap to canister implementation later.

export interface ISpotProvider {
  getRange(spotId: string, context?: IcmContext): Promise<RangeCell[]>;
  listSpotIds(filter?: SpotFilter): Promise<string[]>;
}

// ─── Cell helpers (new format) ────────────────────────────────────────────────

/** Pure push (all-in push, freq=1.0) */
function p(hand: string): RangeCell {
  return { hand, actions: [{ action: "push", freq: 1.0 }] };
}

/** Pure call (freq=1.0) */
function c(hand: string): RangeCell {
  return { hand, actions: [{ action: "call", freq: 1.0 }] };
}

/** 3-bet only (freq=1.0) — used in BB defence spots */
function b(hand: string): RangeCell {
  return { hand, actions: [{ action: "3bet", freq: 1.0 }] };
}

/** Call only in defence — pure call (freq=1.0) */
function dc(hand: string): RangeCell {
  return { hand, actions: [{ action: "call", freq: 1.0 }] };
}

// ─── Nash Push Data ───────────────────────────────────────────────────────────
// Scenario: 'open' (short-stack push/fold from BTN)
// spotId: open_BTN_none_6max_{stack}bb_nash

// ── open_BTN_none_6max_15bb_nash (~29.4% hands) ──────────────────────────────
const PUSH_BTN_15BB: RangeCell[] = [
  // Pairs
  p("AA"),
  p("KK"),
  p("QQ"),
  p("JJ"),
  p("TT"),
  p("99"),
  p("88"),
  p("77"),
  p("66"),
  p("55"),
  p("44"),
  p("33"),
  p("22"),
  // Suited aces
  p("AKs"),
  p("AQs"),
  p("AJs"),
  p("ATs"),
  p("A9s"),
  p("A8s"),
  p("A7s"),
  p("A6s"),
  p("A5s"),
  p("A4s"),
  p("A3s"),
  p("A2s"),
  // Suited kings
  p("KQs"),
  p("KJs"),
  p("KTs"),
  p("K9s"),
  p("K8s"),
  p("K7s"),
  p("K6s"),
  // Suited queens
  p("QJs"),
  p("QTs"),
  p("Q9s"),
  // Suited jacks
  p("JTs"),
  p("J9s"),
  // Suited tens
  p("T9s"),
  p("T8s"),
  // Suited nines
  p("98s"),
  p("97s"),
  // Suited eights
  p("87s"),
  // Suited sevens
  p("76s"),
  // Suited sixes
  p("65s"),
  // Suited fives
  p("54s"),
  // Offsuit aces
  p("AKo"),
  p("AQo"),
  p("AJo"),
  p("ATo"),
  p("A9o"),
  p("A8o"),
  p("A7o"),
  p("A6o"),
  p("A5o"),
  // Offsuit kings
  p("KQo"),
  p("KJo"),
  p("KTo"),
  // Offsuit queens
  p("QJo"),
  p("QTo"),
  // Offsuit jacks
  p("JTo"),
];

// ── open_BTN_none_6max_20bb_nash (~40% hands) ─────────────────────────────────
const PUSH_BTN_20BB: RangeCell[] = [
  // Pairs
  p("AA"),
  p("KK"),
  p("QQ"),
  p("JJ"),
  p("TT"),
  p("99"),
  p("88"),
  p("77"),
  p("66"),
  // Suited aces
  p("AKs"),
  p("AQs"),
  p("AJs"),
  p("ATs"),
  p("A9s"),
  p("A8s"),
  p("A7s"),
  // Suited kings
  p("KQs"),
  p("KJs"),
  p("KTs"),
  p("K9s"),
  p("K8s"),
  // Suited queens
  p("QJs"),
  p("QTs"),
  p("Q9s"),
  // Suited connectors
  p("JTs"),
  p("T9s"),
  p("98s"),
  p("87s"),
  p("76s"),
  // Offsuit aces
  p("AKo"),
  p("AQo"),
  p("AJo"),
  p("ATo"),
  p("A9o"),
  // Offsuit kings
  p("KQo"),
  p("KJo"),
  p("KTo"),
  // Offsuit others
  p("QJo"),
];

// ── open_BTN_none_6max_25bb_nash (~30% hands) ─────────────────────────────────
const PUSH_BTN_25BB: RangeCell[] = [
  // Pairs
  p("AA"),
  p("KK"),
  p("QQ"),
  p("JJ"),
  p("TT"),
  p("99"),
  p("88"),
  p("77"),
  // Suited aces
  p("AKs"),
  p("AQs"),
  p("AJs"),
  p("ATs"),
  p("A9s"),
  p("A8s"),
  // Suited kings
  p("KQs"),
  p("KJs"),
  p("KTs"),
  p("K9s"),
  // Suited queens
  p("QJs"),
  p("QTs"),
  // Suited connectors
  p("JTs"),
  // Offsuit aces
  p("AKo"),
  p("AQo"),
  p("AJo"),
  p("ATo"),
  // Offsuit kings
  p("KQo"),
  p("KJo"),
];

// ─── Nash Call Data ───────────────────────────────────────────────────────────
// Scenario: 'call_shove' (BB calls a BTN all-in push)
// spotId: call_shove_BB_BTN_6max_{stack}bb_nash

// ── call_shove_BB_BTN_6max_15bb_nash (~40% call) ──────────────────────────────
const CALL_BB_15BB: RangeCell[] = [
  // Pairs
  c("AA"),
  c("KK"),
  c("QQ"),
  c("JJ"),
  c("TT"),
  c("99"),
  c("88"),
  c("77"),
  c("66"),
  c("55"),
  c("44"),
  // Suited aces
  c("AKs"),
  c("AQs"),
  c("AJs"),
  c("ATs"),
  c("A9s"),
  c("A8s"),
  c("A7s"),
  c("A6s"),
  c("A5s"),
  c("A4s"),
  c("A3s"),
  c("A2s"),
  // Suited kings
  c("KQs"),
  c("KJs"),
  c("KTs"),
  c("K9s"),
  // Offsuit aces
  c("AKo"),
  c("AQo"),
  c("AJo"),
  c("ATo"),
  c("A9o"),
  // Offsuit kings
  c("KQo"),
  c("KJo"),
  c("KTo"),
  // Offsuit others
  c("QJo"),
];

// ── call_shove_BB_BTN_6max_20bb_nash (~25% call) ──────────────────────────────
const CALL_BB_20BB: RangeCell[] = [
  // Pairs
  c("AA"),
  c("KK"),
  c("QQ"),
  c("JJ"),
  c("TT"),
  c("99"),
  c("88"),
  // Suited aces
  c("AKs"),
  c("AQs"),
  c("AJs"),
  c("ATs"),
  c("A9s"),
  // Suited kings
  c("KQs"),
  c("KJs"),
  c("KTs"),
  // Suited queens
  c("QJs"),
  // Offsuit aces
  c("AKo"),
  c("AQo"),
  c("AJo"),
  // Offsuit kings
  c("KQo"),
];

// ── call_shove_BB_BTN_6max_25bb_nash (~15% call) ──────────────────────────────
const CALL_BB_25BB: RangeCell[] = [
  // Pairs
  c("AA"),
  c("KK"),
  c("QQ"),
  c("JJ"),
  c("TT"),
  // Suited aces
  c("AKs"),
  c("AQs"),
  c("AJs"),
  c("ATs"),
  // Suited kings
  c("KQs"),
  // Offsuit aces
  c("AKo"),
  c("AQo"),
];

// ─── BB Defence (vsopen) Data ────────────────────────────────────────────────
// Scenario: 'vsopen' (BB defends vs BTN open raise)
// spotId: vsopen_BB_BTN_6max_{stack}bb_nash
// Old betFreq = 3-bet freq, callFreq = call freq → now mapped to '3bet' and 'call'

// ── vsopen_BB_BTN_6max_15bb_nash ─────────────────────────────────────────────
const DEFENCE_BB_15BB: RangeCell[] = [
  // 3-bet hands
  b("AA"),
  b("KK"),
  b("QQ"),
  b("JJ"),
  b("AKs"),
  b("AQs"),
  b("A5s"),
  b("A4s"),
  b("AKo"),
  b("AQo"),
  // Call hands
  dc("TT"),
  dc("99"),
  dc("88"),
  dc("77"),
  dc("66"),
  dc("55"),
  dc("44"),
  dc("33"),
  dc("22"),
  dc("AJs"),
  dc("ATs"),
  dc("A9s"),
  dc("A8s"),
  dc("A7s"),
  dc("A6s"),
  dc("A3s"),
  dc("A2s"),
  dc("KQs"),
  dc("KJs"),
  dc("KTs"),
  dc("K9s"),
  dc("K8s"),
  dc("QJs"),
  dc("QTs"),
  dc("Q9s"),
  dc("Q8s"),
  dc("JTs"),
  dc("J9s"),
  dc("J8s"),
  dc("T9s"),
  dc("T8s"),
  dc("98s"),
  dc("87s"),
  dc("76s"),
  dc("65s"),
  dc("54s"),
  dc("AJo"),
  dc("ATo"),
  dc("A9o"),
  dc("A8o"),
  dc("A7o"),
  dc("KQo"),
  dc("KJo"),
  dc("KTo"),
  dc("K9o"),
  dc("QJo"),
  dc("QTo"),
  dc("Q9o"),
  dc("JTo"),
];

// ── vsopen_BB_BTN_6max_20bb_nash ──────────────────────────────────────────────
const DEFENCE_BB_20BB: RangeCell[] = [
  // 3-bet hands
  b("AA"),
  b("KK"),
  b("QQ"),
  b("AKs"),
  b("A5s"),
  b("A4s"),
  b("AKo"),
  // Call hands
  dc("JJ"),
  dc("TT"),
  dc("99"),
  dc("88"),
  dc("77"),
  dc("66"),
  dc("55"),
  dc("44"),
  dc("AQs"),
  dc("AJs"),
  dc("ATs"),
  dc("A9s"),
  dc("A8s"),
  dc("A7s"),
  dc("A6s"),
  dc("A3s"),
  dc("A2s"),
  dc("KQs"),
  dc("KJs"),
  dc("KTs"),
  dc("K9s"),
  dc("QJs"),
  dc("QTs"),
  dc("Q9s"),
  dc("JTs"),
  dc("J9s"),
  dc("T9s"),
  dc("98s"),
  dc("87s"),
  dc("76s"),
  dc("65s"),
  dc("AQo"),
  dc("AJo"),
  dc("ATo"),
  dc("A9o"),
  dc("A8o"),
  dc("KQo"),
  dc("KJo"),
  dc("KTo"),
  dc("QJo"),
  dc("QTo"),
  dc("JTo"),
];

// ── vsopen_BB_BTN_6max_25bb_nash ──────────────────────────────────────────────
const DEFENCE_BB_25BB: RangeCell[] = [
  // 3-bet hands (narrower range)
  b("AA"),
  b("KK"),
  b("AKs"),
  b("A5s"),
  b("A4s"),
  // Call hands
  dc("QQ"),
  dc("JJ"),
  dc("TT"),
  dc("99"),
  dc("88"),
  dc("77"),
  dc("66"),
  dc("55"),
  dc("44"),
  dc("AQs"),
  dc("AJs"),
  dc("ATs"),
  dc("A9s"),
  dc("A8s"),
  dc("A7s"),
  dc("A3s"),
  dc("A2s"),
  dc("KQs"),
  dc("KJs"),
  dc("KTs"),
  dc("QJs"),
  dc("QTs"),
  dc("JTs"),
  dc("T9s"),
  dc("98s"),
  dc("87s"),
  dc("76s"),
  dc("AQo"),
  dc("AJo"),
  dc("ATo"),
  dc("A9o"),
  dc("KQo"),
  dc("KJo"),
  dc("QJo"),
];

// ─── Spot Registry ───────────────────────────────────────────────────────────
// Keys use the new spotId format: {scenario}_{heroPos}_{villainPos}_{players}_{stack}bb_{icm}

type SpotRegistry = Record<string, RangeCell[]>;

const SPOT_DATA: SpotRegistry = {
  // open (push/fold from BTN)
  open_BTN_none_6max_15bb_nash: PUSH_BTN_15BB,
  open_BTN_none_6max_20bb_nash: PUSH_BTN_20BB,
  open_BTN_none_6max_25bb_nash: PUSH_BTN_25BB,
  // call_shove (BB calls BTN push)
  call_shove_BB_BTN_6max_15bb_nash: CALL_BB_15BB,
  call_shove_BB_BTN_6max_20bb_nash: CALL_BB_20BB,
  call_shove_BB_BTN_6max_25bb_nash: CALL_BB_25BB,
  // vsopen (BB defence vs BTN open)
  vsopen_BB_BTN_6max_15bb_nash: DEFENCE_BB_15BB,
  vsopen_BB_BTN_6max_20bb_nash: DEFENCE_BB_20BB,
  vsopen_BB_BTN_6max_25bb_nash: DEFENCE_BB_25BB,
};

// ─── StaticSpotProvider ───────────────────────────────────────────────────────

export class StaticSpotProvider implements ISpotProvider {
  private readonly registry: SpotRegistry = { ...SPOT_DATA };

  async getRange(spotId: string, _context?: IcmContext): Promise<RangeCell[]> {
    return this.registry[spotId] ?? [];
  }

  async listSpotIds(filter?: SpotFilter): Promise<string[]> {
    const ids = Object.keys(this.registry);
    if (!filter) return ids;
    return ids.filter((id) => {
      try {
        const parsed = parseSpotId(id);
        if (filter.scenario && parsed.scenario !== filter.scenario)
          return false;
        if (filter.players && parsed.players !== filter.players) return false;
        if (filter.stackBb && parsed.stackBb !== filter.stackBb) return false;
        if (filter.icm && parsed.icm !== filter.icm) return false;
        return true;
      } catch {
        return false;
      }
    });
  }
}

/** Singleton provider — use this in components and hooks */
export const spotProvider: ISpotProvider = new StaticSpotProvider();

// Re-export new buildSpotId for consumers that import from SpotProvider
export { buildSpotIdNew };
