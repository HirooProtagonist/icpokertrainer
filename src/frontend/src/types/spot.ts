// ─── Типы спотов и действий ICPokerTrainer (Iteration 2) ───────────────────

/** Все возможные действия игрока — сейчас и в будущем */
export type ActionType =
  | "fold"
  | "call"
  | "check"
  | "limp"
  | "push" // all-in push (короткие стеки)
  | "raise" // открывающий рейз
  | "3bet"
  | "4bet"
  | "donk" // постфлоп — заложено, не используется в v1
  | "probe"; // постфлоп — заложено, не используется в v1

/** Sizing для рейза/бета (опционален) */
export interface SizingDef {
  bb?: number; // абсолютный размер в BB
  pct?: number; // процент пота (для постфлопа)
  isAllIn?: boolean; // явный маркер all-in
}

/** Одно действие с частотой — элемент массива в RangeCell */
export interface ActionFreq {
  action: ActionType;
  freq: number; // 0.0 – 1.0; сумма по массиву = 1.0
  sizingBb?: number; // размер в BB (денормализован для удобства)
}

/** Определение действия для ActionPanel — что рендерить */
export interface ActionDef {
  type: ActionType;
  label: string; // "Fold", "Raise 2.5bb", "All-in"
  sizing?: SizingDef;
  color?: string; // опциональный кастомный цвет кнопки
}

/** Ячейка диапазона — одна рука в матрице */
export interface RangeCell {
  hand: string; // "AKs", "72o", "JJ"
  actions: ActionFreq[]; // сумма freq = 1.0
  ev?: number; // EV руки в споте; undefined пока нет точных данных
}

/** Вердикт по раздаче */
export type Verdict = "correct" | "acceptable" | "mistake";

// ─── Параметры спота ─────────────────────────────────────────────────────────

export type ScenarioType =
  | "open_push"
  | "call_shove"
  | "bb_defence"
  | "open_raise"
  | "vs_3bet";

export type PositionType = "UTG" | "MP" | "HJ" | "CO" | "BTN" | "SB" | "BB";

export type FormatType = "6max" | "9max";

export type IcmType = "nash" | "icm_bubble" | "icm_ft" | "icm_top3";

export interface SpotParams {
  scenario: ScenarioType;
  heroPos: PositionType;
  villainPos: (PositionType | "none")[]; // ['none'] for open, ['CO','BTN'] for multiway
  players: FormatType;
  stackBb: number;
  icm: IcmType;
}

// ─── IcmContext ──────────────────────────────────────────────────────────────

/**
 * Context for ICM-aware spot lookups.
 * Optional on ISpotProvider.getRange — StaticSpotProvider ignores it.
 * IcmSpotProvider (future) will use it for dynamic ICM calculations.
 */
export interface IcmContext {
  stacks: number[]; // стеки всех игроков за столом в BB
  payouts: number[]; // структура выплат [50, 30, 20] или в фишках
  playersRemaining: number; // игроков осталось в турнире
  heroIndex?: number; // индекс героя в stacks (по умолчанию 0)
  stage?: "bubble" | "near_bubble" | "final_table" | "heads_up" | "custom";
  payoutType?: "percentage" | "chips";
}

// ─── evaluateAnswer ───────────────────────────────────────────────────────────

/**
 * Оценивает ответ игрока по сравнению с эталонной ячейкой диапазона.
 * - correct:    игрок выбрал действие с наибольшей частотой
 * - acceptable: выбранное действие имеет freq >= 0.2 (смешанная стратегия)
 * - mistake:    действие не является частью GTO-стратегии
 */
export function evaluateAnswer(
  playerAction: ActionType,
  cell: RangeCell,
): Verdict {
  if (cell.actions.length === 0) {
    return playerAction === "fold" ? "correct" : "mistake";
  }

  const primary = cell.actions.reduce((a, b) => (a.freq >= b.freq ? a : b));

  if (playerAction === primary.action) return "correct";

  const playerFreq =
    cell.actions.find((a) => a.action === playerAction)?.freq ?? 0;

  if (playerFreq >= 0.2) return "acceptable";

  return "mistake";
}
