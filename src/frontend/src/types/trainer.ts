// ─── Типы тренажёра ICPokerTrainer ──────────────────────────────────────────
// Re-exports from '../types/spot' plus trainer-specific types.
// ScenarioType is the canonical type from spot.ts.

export type { ScenarioType } from "../types/spot";

import type { ScenarioType } from "../types/spot";

/** Размеры стека */
export type StackSize = 10 | 15 | 20 | 25 | 30 | 40;

/** Действие игрока (подмножество ActionType) */
export type PlayerAction = "fold" | "push" | "call" | "3bet";

/** Состояние одной раздачи */
export interface DealState {
  hand: string; // например "AKs", "72o", "JJ"
  scenario: ScenarioType;
  position: string;
  stackBB: StackSize;
  board?: string;
}

/** Вердикт по раздаче */
export type HandVerdict = "correct" | "acceptable" | "mistake";

/** Результат одной раздачи */
export interface HandResult {
  hand: string;
  scenario: ScenarioType;
  spotId: string;
  playerAction: PlayerAction;
  correctFreq: number; // частота правильного действия
  verdict: HandVerdict;
}

/** Фаза тренажёра (state machine) */
export type TrainerPhase = "setup" | "dealing" | "feedback" | "summary";

/** Полное состояние тренажёра */
export interface TrainerState {
  phase: TrainerPhase;
  scenario: ScenarioType;
  stackBB: StackSize;
  handCount: number; // текущий номер раздачи (1–10)
  handsPlayed: string[]; // уже использованные руки
  currentDeal: DealState | null;
  lastAction: PlayerAction | null;
  lastResult: HandResult | null;
  results: HandResult[];
  board?: string; // для будущего постфлоп-тренера
}
