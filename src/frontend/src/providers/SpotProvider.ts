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

// ── open_BTN_none_6max_15bb_nash (~55% hands) ─────────────────────────────────
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
  p("K5s"),
  // Suited queens
  p("QJs"),
  p("QTs"),
  p("Q9s"),
  p("Q8s"),
  // Suited connectors
  p("JTs"),
  p("J9s"),
  p("T9s"),
  p("T8s"),
  p("98s"),
  p("87s"),
  p("76s"),
  p("65s"),
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
  // Offsuit kings
  p("KQo"),
  p("KJo"),
  p("KTo"),
  // Offsuit others
  p("QJo"),
  p("QTo"),
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

// ── open_BTN_none_6max_10bb_nash (SB push vs BB, ~58% hands) ─────────────────
const PUSH_BTN_10BB: RangeCell[] = [
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
  // Suited aces (all)
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
  // Suited kings (all)
  p("KQs"),
  p("KJs"),
  p("KTs"),
  p("K9s"),
  p("K8s"),
  p("K7s"),
  p("K6s"),
  p("K5s"),
  p("K4s"),
  p("K3s"),
  p("K2s"),
  // Suited queens (Q7s+)
  p("QJs"),
  p("QTs"),
  p("Q9s"),
  p("Q8s"),
  p("Q7s"),
  // Suited broadway / connectors
  p("JTs"),
  p("J9s"),
  p("J8s"),
  p("T9s"),
  p("T8s"),
  p("98s"),
  p("97s"),
  p("87s"),
  p("76s"),
  // Offsuit aces (all)
  p("AKo"),
  p("AQo"),
  p("AJo"),
  p("ATo"),
  p("A9o"),
  p("A8o"),
  p("A7o"),
  p("A6o"),
  p("A5o"),
  p("A4o"),
  p("A3o"),
  p("A2o"),
  // Offsuit kings (all)
  p("KQo"),
  p("KJo"),
  p("KTo"),
  p("K9o"),
  p("K8o"),
  p("K7o"),
  p("K6o"),
  p("K5o"),
  p("K4o"),
  p("K3o"),
  p("K2o"),
  // Offsuit queens (Q2o+)
  p("QJo"),
  p("QTo"),
  p("Q9o"),
  p("Q8o"),
  p("Q7o"),
  p("Q6o"),
  p("Q5o"),
  p("Q4o"),
  p("Q3o"),
  p("Q2o"),
  // Offsuit jacks (J3o+)
  p("JTo"),
  p("J9o"),
  p("J8o"),
  p("J7o"),
  p("J6o"),
  p("J5o"),
  p("J4o"),
  p("J3o"),
  // Offsuit tens (T3o+)
  p("T9o"),
  p("T8o"),
  p("T7o"),
  p("T6o"),
  p("T5o"),
  p("T4o"),
  p("T3o"),
  // Offsuit nines (95o+)
  p("98o"),
  p("97o"),
  p("96o"),
  p("95o"),
  // Offsuit eights (all)
  p("87o"),
  p("86o"),
  p("85o"),
  p("84o"),
  p("83o"),
  p("82o"),
  // Offsuit sevens (all)
  p("76o"),
  p("75o"),
  p("74o"),
  p("73o"),
  p("72o"),
  // Offsuit sixes (all)
  p("65o"),
  p("64o"),
  p("63o"),
  p("62o"),
  // Offsuit fives (52o+)
  p("54o"),
  p("53o"),
  p("52o"),
  // Offsuit fours (42o+)
  p("43o"),
  p("42o"),
];

// ── call_shove_BB_BTN_6max_10bb_nash (BB call vs SB push, ~37% call) ────────────
// Source: Simple Nash ChipEV, BB=100, Stack=1000 each
// Played[i]/100 = call_freq, fold_freq = 1 - call_freq
const CALL_BB_10BB: RangeCell[] = [
  // Row 0: AA, AKs, AQs, AJs, ATs, A9s, A8s, A7s, A6s, A5s, A4s, A3s, A2s
  {
    hand: "AA",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 39.63,
  },
  {
    hand: "AKs",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 19.89,
  },
  {
    hand: "AQs",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 17.71,
  },
  {
    hand: "AJs",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 16.18,
  },
  {
    hand: "ATs",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 14.87,
  },
  {
    hand: "A9s",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 12.36,
  },
  {
    hand: "A8s",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 10.98,
  },
  {
    hand: "A7s",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 9.34,
  },
  {
    hand: "A6s",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 7.58,
  },
  {
    hand: "A5s",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 7.35,
  },
  {
    hand: "A4s",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 6.39,
  },
  {
    hand: "A3s",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 5.56,
  },
  {
    hand: "A2s",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 4.83,
  },
  // Row 1: AKo, KK, KQs, KJs, KTs, K9s, K8s, K7s, K6s, K5s, K4s, K3s, K2s
  {
    hand: "AKo",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 21.64,
  },
  {
    hand: "KK",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 34.73,
  },
  {
    hand: "KQs",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 12.12,
  },
  {
    hand: "KJs",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 10.63,
  },
  {
    hand: "KTs",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 9.34,
  },
  {
    hand: "K9s",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 6.8,
  },
  {
    hand: "K8s",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 4.45,
  },
  {
    hand: "K7s",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 3.02,
  },
  {
    hand: "K6s",
    actions: [
      { action: "call", freq: 0.963 },
      { action: "fold", freq: 0.037 },
    ],
    ev: 1.53,
  },
  {
    hand: "K5s",
    actions: [
      { action: "call", freq: 0.005 },
      { action: "fold", freq: 0.995 },
    ],
    ev: 0.37,
  },
  {
    hand: "K4s",
    actions: [
      { action: "call", freq: 0.004 },
      { action: "fold", freq: 0.996 },
    ],
    ev: -0.6,
  },
  {
    hand: "K3s",
    actions: [
      { action: "call", freq: 0.004 },
      { action: "fold", freq: 0.996 },
    ],
    ev: -1.42,
  },
  {
    hand: "K2s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -2.13,
  },
  // Row 2: AQo, KQo, QQ, QJs, QTs, Q9s, Q8s, Q7s, Q6s, Q5s, Q4s, Q3s, Q2s
  {
    hand: "AQo",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 19.6,
  },
  {
    hand: "KQo",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 14.32,
  },
  {
    hand: "QQ",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 30.42,
  },
  {
    hand: "QJs",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 5.73,
  },
  {
    hand: "QTs",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 4.55,
  },
  {
    hand: "Q9s",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 2.07,
  },
  {
    hand: "Q8s",
    actions: [
      { action: "call", freq: 0.037 },
      { action: "fold", freq: 0.963 },
    ],
    ev: -0.14,
  },
  {
    hand: "Q7s",
    actions: [
      { action: "call", freq: 0.003 },
      { action: "fold", freq: 0.997 },
    ],
    ev: -2.42,
  },
  {
    hand: "Q6s",
    actions: [
      { action: "call", freq: 0.003 },
      { action: "fold", freq: 0.997 },
    ],
    ev: -3.17,
  },
  {
    hand: "Q5s",
    actions: [
      { action: "call", freq: 0.003 },
      { action: "fold", freq: 0.997 },
    ],
    ev: -3.96,
  },
  {
    hand: "Q4s",
    actions: [
      { action: "call", freq: 0.002 },
      { action: "fold", freq: 0.998 },
    ],
    ev: -4.76,
  },
  {
    hand: "Q3s",
    actions: [
      { action: "call", freq: 0.002 },
      { action: "fold", freq: 0.998 },
    ],
    ev: -5.54,
  },
  {
    hand: "Q2s",
    actions: [
      { action: "call", freq: 0.002 },
      { action: "fold", freq: 0.998 },
    ],
    ev: -6.23,
  },
  // Row 3: AJo, KJo, QJo, JJ, JTs, J9s, J8s, J7s, J6s, J5s, J4s, J3s, J2s
  {
    hand: "AJo",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 18.17,
  },
  {
    hand: "KJo",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 12.93,
  },
  {
    hand: "QJo",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 8.31,
  },
  {
    hand: "JJ",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 27.43,
  },
  {
    hand: "JTs",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 2.39,
  },
  {
    hand: "J9s",
    actions: [
      { action: "call", freq: 0.005 },
      { action: "fold", freq: 0.995 },
    ],
    ev: -0.12,
  },
  {
    hand: "J8s",
    actions: [
      { action: "call", freq: 0.003 },
      { action: "fold", freq: 0.997 },
    ],
    ev: -2.29,
  },
  {
    hand: "J7s",
    actions: [
      { action: "call", freq: 0.003 },
      { action: "fold", freq: 0.997 },
    ],
    ev: -4.25,
  },
  {
    hand: "J6s",
    actions: [
      { action: "call", freq: 0.002 },
      { action: "fold", freq: 0.998 },
    ],
    ev: -5.87,
  },
  {
    hand: "J5s",
    actions: [
      { action: "call", freq: 0.002 },
      { action: "fold", freq: 0.998 },
    ],
    ev: -6.33,
  },
  {
    hand: "J4s",
    actions: [
      { action: "call", freq: 0.002 },
      { action: "fold", freq: 0.998 },
    ],
    ev: -7.11,
  },
  {
    hand: "J3s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -7.87,
  },
  {
    hand: "J2s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -8.53,
  },
  // Row 4: ATo, KTo, QTo, JTo, TT, T9s, T8s, T7s, T6s, T5s, T4s, T3s, T2s
  {
    hand: "ATo",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 16.95,
  },
  {
    hand: "KTo",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 11.73,
  },
  {
    hand: "QTo",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 7.2,
  },
  {
    hand: "JTo",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 5.14,
  },
  {
    hand: "TT",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 24.74,
  },
  {
    hand: "T9s",
    actions: [
      { action: "call", freq: 0.004 },
      { action: "fold", freq: 0.996 },
    ],
    ev: -1.21,
  },
  {
    hand: "T8s",
    actions: [
      { action: "call", freq: 0.003 },
      { action: "fold", freq: 0.997 },
    ],
    ev: -3.38,
  },
  {
    hand: "T7s",
    actions: [
      { action: "call", freq: 0.002 },
      { action: "fold", freq: 0.998 },
    ],
    ev: -5.16,
  },
  {
    hand: "T6s",
    actions: [
      { action: "call", freq: 0.002 },
      { action: "fold", freq: 0.998 },
    ],
    ev: -6.73,
  },
  {
    hand: "T5s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -8.42,
  },
  {
    hand: "T4s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -8.92,
  },
  {
    hand: "T3s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -9.63,
  },
  {
    hand: "T2s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -10.24,
  },
  // Row 5: A9o, K9o, Q9o, J9o, T9o, 99, 98s, 97s, 96s, 95s, 94s, 93s, 92s
  {
    hand: "A9o",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 14.61,
  },
  {
    hand: "K9o",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 9.36,
  },
  {
    hand: "Q9o",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 4.88,
  },
  {
    hand: "J9o",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 2.79,
  },
  {
    hand: "T9o",
    actions: [
      { action: "call", freq: 0.993 },
      { action: "fold", freq: 0.007 },
    ],
    ev: 1.73,
  },
  {
    hand: "99",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 21.34,
  },
  {
    hand: "98s",
    actions: [
      { action: "call", freq: 0.002 },
      { action: "fold", freq: 0.998 },
    ],
    ev: -4.23,
  },
  {
    hand: "97s",
    actions: [
      { action: "call", freq: 0.002 },
      { action: "fold", freq: 0.998 },
    ],
    ev: -5.95,
  },
  {
    hand: "96s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -7.5,
  },
  {
    hand: "95s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -9.15,
  },
  {
    hand: "94s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -10.9,
  },
  {
    hand: "93s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -11.3,
  },
  {
    hand: "92s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -11.91,
  },
  // Row 6: A8o, K8o, Q8o, J8o, T8o, 98o, 88, 87s, 86s, 85s, 84s, 83s, 82s
  {
    hand: "A8o",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 13.33,
  },
  {
    hand: "K8o",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 7.16,
  },
  {
    hand: "Q8o",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 2.82,
  },
  {
    hand: "J8o",
    actions: [
      { action: "call", freq: 0.959 },
      { action: "fold", freq: 0.041 },
    ],
    ev: 0.76,
  },
  {
    hand: "T8o",
    actions: [
      { action: "call", freq: 0.005 },
      { action: "fold", freq: 0.995 },
    ],
    ev: -0.31,
  },
  {
    hand: "98o",
    actions: [
      { action: "call", freq: 0.005 },
      { action: "fold", freq: 0.995 },
    ],
    ev: -1.12,
  },
  {
    hand: "88",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 17.98,
  },
  {
    hand: "87s",
    actions: [
      { action: "call", freq: 0.002 },
      { action: "fold", freq: 0.998 },
    ],
    ev: -6.46,
  },
  {
    hand: "86s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -7.79,
  },
  {
    hand: "85s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -9.43,
  },
  {
    hand: "84s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -11.17,
  },
  {
    hand: "83s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -12.87,
  },
  {
    hand: "82s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -13.2,
  },
  // Row 7: A7o, K7o, Q7o, J7o, T7o, 97o, 87o, 77, 76s, 75s, 74s, 73s, 72s
  {
    hand: "A7o",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 11.79,
  },
  {
    hand: "K7o",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 5.83,
  },
  {
    hand: "Q7o",
    actions: [
      { action: "call", freq: 0.965 },
      { action: "fold", freq: 0.035 },
    ],
    ev: 0.69,
  },
  {
    hand: "J7o",
    actions: [
      { action: "call", freq: 0.004 },
      { action: "fold", freq: 0.996 },
    ],
    ev: -1.06,
  },
  {
    hand: "T7o",
    actions: [
      { action: "call", freq: 0.004 },
      { action: "fold", freq: 0.996 },
    ],
    ev: -1.96,
  },
  {
    hand: "97o",
    actions: [
      { action: "call", freq: 0.003 },
      { action: "fold", freq: 0.997 },
    ],
    ev: -2.73,
  },
  {
    hand: "87o",
    actions: [
      { action: "call", freq: 0.003 },
      { action: "fold", freq: 0.997 },
    ],
    ev: -3.23,
  },
  {
    hand: "77",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 14.6,
  },
  {
    hand: "76s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -7.78,
  },
  {
    hand: "75s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -9.4,
  },
  {
    hand: "74s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -11.13,
  },
  {
    hand: "73s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -12.77,
  },
  {
    hand: "72s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -14.44,
  },
  // Row 8: A6o, K6o, Q6o, J6o, T6o, 96o, 86o, 76o, 66, 65s, 64s, 63s, 62s
  {
    hand: "A6o",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 10.15,
  },
  {
    hand: "K6o",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 4.44,
  },
  {
    hand: "Q6o",
    actions: [
      { action: "call", freq: 0.005 },
      { action: "fold", freq: 0.995 },
    ],
    ev: 0.0,
  },
  {
    hand: "J6o",
    actions: [
      { action: "call", freq: 0.003 },
      { action: "fold", freq: 0.997 },
    ],
    ev: -2.57,
  },
  {
    hand: "T6o",
    actions: [
      { action: "call", freq: 0.002 },
      { action: "fold", freq: 0.998 },
    ],
    ev: -3.42,
  },
  {
    hand: "96o",
    actions: [
      { action: "call", freq: 0.002 },
      { action: "fold", freq: 0.998 },
    ],
    ev: -4.15,
  },
  {
    hand: "86o",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -4.44,
  },
  {
    hand: "76o",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -4.47,
  },
  {
    hand: "66",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 11.87,
  },
  {
    hand: "65s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -8.83,
  },
  {
    hand: "64s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -10.5,
  },
  {
    hand: "63s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -12.09,
  },
  {
    hand: "62s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -13.79,
  },
  // Row 9: A5o, K5o, Q5o, J5o, T5o, 95o, 85o, 75o, 65o, 55, 54s, 53s, 52s
  {
    hand: "A5o",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 9.92,
  },
  {
    hand: "K5o",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 3.35,
  },
  {
    hand: "Q5o",
    actions: [
      { action: "call", freq: 0.004 },
      { action: "fold", freq: 0.996 },
    ],
    ev: -0.74,
  },
  {
    hand: "J5o",
    actions: [
      { action: "call", freq: 0.003 },
      { action: "fold", freq: 0.997 },
    ],
    ev: -3.01,
  },
  {
    hand: "T5o",
    actions: [
      { action: "call", freq: 0.002 },
      { action: "fold", freq: 0.998 },
    ],
    ev: -5.01,
  },
  {
    hand: "95o",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -5.71,
  },
  {
    hand: "85o",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -5.99,
  },
  {
    hand: "75o",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -5.98,
  },
  {
    hand: "65o",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -5.45,
  },
  {
    hand: "55",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 9.52,
  },
  {
    hand: "54s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -9.68,
  },
  {
    hand: "53s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -11.2,
  },
  {
    hand: "52s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -12.86,
  },
  // Row 10: A4o, K4o, Q4o, J4o, T4o, 94o, 84o, 74o, 64o, 54o, 44, 43s, 42s
  {
    hand: "A4o",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 9.04,
  },
  {
    hand: "K4o",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 2.45,
  },
  {
    hand: "Q4o",
    actions: [
      { action: "call", freq: 0.004 },
      { action: "fold", freq: 0.996 },
    ],
    ev: -1.48,
  },
  {
    hand: "J4o",
    actions: [
      { action: "call", freq: 0.003 },
      { action: "fold", freq: 0.997 },
    ],
    ev: -3.73,
  },
  {
    hand: "T4o",
    actions: [
      { action: "call", freq: 0.002 },
      { action: "fold", freq: 0.998 },
    ],
    ev: -5.47,
  },
  {
    hand: "94o",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -7.36,
  },
  {
    hand: "84o",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -7.62,
  },
  {
    hand: "74o",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -7.59,
  },
  {
    hand: "64o",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -7.01,
  },
  {
    hand: "54o",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -6.26,
  },
  {
    hand: "44",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 7.06,
  },
  {
    hand: "43s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -11.96,
  },
  {
    hand: "42s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -13.52,
  },
  // Row 11: A3o, K3o, Q3o, J3o, T3o, 93o, 83o, 73o, 63o, 53o, 43o, 33, 32s
  {
    hand: "A3o",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 8.29,
  },
  {
    hand: "K3o",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 1.7,
  },
  {
    hand: "Q3o",
    actions: [
      { action: "call", freq: 0.003 },
      { action: "fold", freq: 0.997 },
    ],
    ev: -2.19,
  },
  {
    hand: "J3o",
    actions: [
      { action: "call", freq: 0.002 },
      { action: "fold", freq: 0.998 },
    ],
    ev: -4.42,
  },
  {
    hand: "T3o",
    actions: [
      { action: "call", freq: 0.002 },
      { action: "fold", freq: 0.998 },
    ],
    ev: -6.13,
  },
  {
    hand: "93o",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -7.72,
  },
  {
    hand: "83o",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -9.22,
  },
  {
    hand: "73o",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -9.15,
  },
  {
    hand: "63o",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -8.53,
  },
  {
    hand: "53o",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -7.69,
  },
  {
    hand: "43o",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -8.41,
  },
  {
    hand: "33",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 4.81,
  },
  {
    hand: "32s",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -14.11,
  },
  // Row 12: A2o, K2o, Q2o, J2o, T2o, 92o, 82o, 72o, 62o, 52o, 42o, 32o, 22
  {
    hand: "A2o",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 7.62,
  },
  {
    hand: "K2o",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 1.05,
  },
  {
    hand: "Q2o",
    actions: [
      { action: "call", freq: 0.003 },
      { action: "fold", freq: 0.997 },
    ],
    ev: -2.82,
  },
  {
    hand: "J2o",
    actions: [
      { action: "call", freq: 0.002 },
      { action: "fold", freq: 0.998 },
    ],
    ev: -5.03,
  },
  {
    hand: "T2o",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -6.69,
  },
  {
    hand: "92o",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -8.28,
  },
  {
    hand: "82o",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -9.51,
  },
  {
    hand: "72o",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -10.7,
  },
  {
    hand: "62o",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -10.1,
  },
  {
    hand: "52o",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -9.25,
  },
  {
    hand: "42o",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -9.88,
  },
  {
    hand: "32o",
    actions: [
      { action: "call", freq: 0.001 },
      { action: "fold", freq: 0.999 },
    ],
    ev: -10.46,
  },
  {
    hand: "22",
    actions: [
      { action: "call", freq: 1.0 },
      { action: "fold", freq: 0.0 },
    ],
    ev: 2.8,
  },
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
  // open (push/fold from BTN/SB)
  open_BTN_none_6max_10bb_nash: PUSH_BTN_10BB,
  open_BTN_none_6max_15bb_nash: PUSH_BTN_15BB,
  open_BTN_none_6max_20bb_nash: PUSH_BTN_20BB,
  open_BTN_none_6max_25bb_nash: PUSH_BTN_25BB,
  // call_shove (BB calls BTN/SB push)
  call_shove_BB_BTN_6max_10bb_nash: CALL_BB_10BB,
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
