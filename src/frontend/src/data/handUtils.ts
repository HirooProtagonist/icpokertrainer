import type { ActionType } from "../types/spot";
// ─── Утилиты для работы с покерными руками ──────────────────────────────────

/** Ранги в порядке убывания силы (индекс = строка/столбец в матрице) */
const RANKS = [
  "A",
  "K",
  "Q",
  "J",
  "T",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",
] as const;
export type Rank = (typeof RANKS)[number];

/** Масти для displayCard */
const SUITS = ["h", "d", "c", "s"] as const;
type Suit = (typeof SUITS)[number];

export interface DisplayCard {
  rank: string;
  suit: Suit;
}

// ─── getAllHands ──────────────────────────────────────────────────────────────

/**
 * Возвращает все 169 канонических рук.
 * Порядок: пары (AA→22) → suited (AKs→23s) → offsuit (AKo→23o)
 */
export function getAllHands(): string[] {
  const pairs: string[] = [];
  const suited: string[] = [];
  const offsuit: string[] = [];

  for (let i = 0; i < RANKS.length; i++) {
    // Пары по диагонали
    pairs.push(`${RANKS[i]}${RANKS[i]}`);

    for (let j = i + 1; j < RANKS.length; j++) {
      // suited: старший ранг первым
      suited.push(`${RANKS[i]}${RANKS[j]}s`);
      // offsuit: старший ранг первым
      offsuit.push(`${RANKS[i]}${RANKS[j]}o`);
    }
  }

  return [...pairs, ...suited, ...offsuit];
}

// ─── getHandCoords ────────────────────────────────────────────────────────────

/**
 * Возвращает координаты руки в матрице 13×13.
 * - Пары: row === col (диагональ)
 * - Suited: row < col (выше диагонали)
 * - Offsuit: row > col (ниже диагонали)
 */
export function getHandCoords(hand: string): { row: number; col: number } {
  if (hand.length < 2) return { row: 0, col: 0 };

  const rank1 = hand[0] as Rank;
  const rank2 = hand[1] as Rank;
  const type = hand[2]; // 's', 'o', или undefined (пара)

  const i = RANKS.indexOf(rank1);
  const j = RANKS.indexOf(rank2);

  if (i === -1 || j === -1) return { row: 0, col: 0 };

  if (!type) {
    // Пара — по диагонали
    return { row: i, col: i };
  }
  if (type === "s") {
    // Suited — выше диагонали (row = старший, col = младший)
    return { row: i, col: j };
  }
  // Offsuit — ниже диагонали (row = младший, col = старший)
  return { row: j, col: i };
}

// ─── parseHand ────────────────────────────────────────────────────────────────

/**
 * Парсит абстрактную руку в массив карт для отображения.
 * - AA → [{rank:"A",suit:"h"}, {rank:"A",suit:"s"}]
 * - AKs → [{rank:"A",suit:"h"}, {rank:"K",suit:"h"}]
 * - AKo → [{rank:"A",suit:"h"}, {rank:"K",suit:"d"}]
 */
export function parseHand(hand: string): DisplayCard[] {
  if (hand.length < 2) return [];

  const rank1 = hand[0];
  const rank2 = hand[1];
  const type = hand[2];

  if (!type) {
    // Пара — разные масти
    return [
      { rank: rank1, suit: "h" },
      { rank: rank2, suit: "s" },
    ];
  }
  if (type === "s") {
    // Suited — одна масть
    return [
      { rank: rank1, suit: "h" },
      { rank: rank2, suit: "h" },
    ];
  }
  // Offsuit — разные масти
  return [
    { rank: rank1, suit: "h" },
    { rank: rank2, suit: "d" },
  ];
}

// ─── getSuitSymbol ────────────────────────────────────────────────────────────

/** Возвращает Unicode-символ масти и признак цвета */
export function getSuitSymbol(suit: Suit): { symbol: string; isRed: boolean } {
  switch (suit) {
    case "h":
      return { symbol: "♥", isRed: true };
    case "d":
      return { symbol: "♦", isRed: true };
    case "c":
      return { symbol: "♣", isRed: false };
    case "s":
      return { symbol: "♠", isRed: false };
  }
}

/** Экспортируем RANKS для использования в компонентах */
export { RANKS };

// ─── HAND_ORDER ───────────────────────────────────────────────────────────────

/**
 * Каноничный порядок 169 рук для матрицы 13×13 (row-by-row).
 * Строка i: пара на диагонали, suited выше (j>i), offsuit ниже (j<i).
 * Используется везде для детерминированной визуализации и хранения.
 */
export const HAND_ORDER: string[] = (() => {
  const hands: string[] = [];
  for (let i = 0; i < RANKS.length; i++) {
    for (let j = 0; j < RANKS.length; j++) {
      if (i === j) {
        hands.push(RANKS[i] + RANKS[i]);
      } else if (j > i) {
        hands.push(`${RANKS[i]}${RANKS[j]}s`);
      } else {
        hands.push(`${RANKS[j]}${RANKS[i]}o`);
      }
    }
  }
  return hands;
})();

// ─── ACTION_COLORS ────────────────────────────────────────────────────────────

/**
 * Цветовое кодирование действий для RangeMatrix и UI.
 * Используется для смешения цветов ячеек пропорционально ActionFreq.
 */
export const ACTION_COLORS: Record<ActionType, string> = {
  push: "#e74c3c", // красный  — all-in агрессия
  raise: "#e67e22", // оранжевый — рейз
  "3bet": "#9b59b6", // фиолетовый
  "4bet": "#8e44ad", // тёмно-фиолетовый
  call: "#27ae60", // зелёный  — пассивный колл
  check: "#2ecc71", // светло-зелёный
  limp: "#1abc9c", // бирюзовый
  fold: "#2c3e50", // тёмный   — фолд
  donk: "#f39c12", // жёлтый   — постфлоп
  probe: "#d35400", // тёмно-оранжевый — постфлоп
};
