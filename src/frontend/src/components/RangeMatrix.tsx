// ─── RangeMatrix — матрица диапазона 13×13 ────────────────────────────────────

import { ACTION_COLORS, HAND_ORDER, RANKS } from "@/data/handUtils";
import type { ActionFreq, RangeCell } from "@/types/spot";
import { useCallback, useMemo, useState } from "react";

interface RangeMatrixProps {
  cells: RangeCell[];
  highlightedHand?: string;
  compact?: boolean;
  onHoverHand?: (hand: string | null) => void;
}

interface TooltipState {
  hand: string;
  actions: ActionFreq[];
  x: number;
  y: number;
}

const FOLD_COLOR = ACTION_COLORS.fold;

function buildCellMap(cells: RangeCell[]): Map<string, RangeCell> {
  const map = new Map<string, RangeCell>();
  for (const cell of cells) map.set(cell.hand, cell);
  return map;
}

/**
 * Builds a CSS background value from a cell's actions array.
 * - Single action (freq=1.0): returns solid color string.
 * - Mixed: returns a linear-gradient with hard color stops proportional to freq.
 */
function getCellGradient(cell: RangeCell): string {
  const actions = [...cell.actions].sort((a, b) => b.freq - a.freq);
  if (actions.length === 0) return FOLD_COLOR;
  if (actions.length === 1) {
    return ACTION_COLORS[actions[0].action] ?? FOLD_COLOR;
  }

  const explicitTotal = actions.reduce((s, a) => s + a.freq, 0);
  const implicitFold = Math.max(0, 1 - explicitTotal);
  const allActions: ActionFreq[] =
    implicitFold > 0.001
      ? [...actions, { action: "fold", freq: implicitFold }]
      : actions;

  const stops: string[] = [];
  let cursor = 0;
  for (const a of allActions) {
    const color = ACTION_COLORS[a.action] ?? FOLD_COLOR;
    const pctStart = Math.round(cursor * 100);
    const pctEnd = Math.round((cursor + a.freq) * 100);
    stops.push(`${color} ${pctStart}%`);
    stops.push(`${color} ${pctEnd}%`);
    cursor += a.freq;
  }

  return `linear-gradient(135deg, ${stops.join(", ")})`;
}

function pct(f: number): string {
  return `${Math.round(f * 100)}%`;
}

/** Human-readable Russian label for an action */
function actionLabel(action: string): string {
  const labels: Record<string, string> = {
    push: "Пуш",
    call: "Колл",
    fold: "Фолд",
    raise: "Рейз",
    "3bet": "3-бет",
    "4bet": "4-бет",
    check: "Чек",
    limp: "Лимп",
    donk: "Донк",
    probe: "Проб",
  };
  return labels[action] ?? action;
}

/** Build legend entries from the actual actions in use */
function buildLegendEntries(
  cells: RangeCell[],
): Array<{ action: string; color: string; label: string }> {
  const seen = new Set<string>();
  for (const cell of cells) {
    for (const a of cell.actions) seen.add(a.action);
  }
  seen.add("fold");
  return Array.from(seen).map((action) => ({
    action,
    color: ACTION_COLORS[action as keyof typeof ACTION_COLORS] ?? FOLD_COLOR,
    label: actionLabel(action),
  }));
}

export function RangeMatrix({
  cells,
  highlightedHand,
  compact = false,
  onHoverHand,
}: RangeMatrixProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const cellMap = useMemo(() => buildCellMap(cells), [cells]);
  const legendEntries = useMemo(
    () => (compact ? [] : buildLegendEntries(cells)),
    [cells, compact],
  );

  const handleMouseEnter = useCallback(
    (hand: string, e: React.MouseEvent<HTMLDivElement>) => {
      const cell = cellMap.get(hand);
      const root = (e.currentTarget as HTMLElement).closest(
        ".range-matrix-root",
      );
      const rootRect = root?.getBoundingClientRect();
      const cellRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const actions = cell?.actions ?? [{ action: "fold" as const, freq: 1.0 }];
      setTooltip({
        hand,
        actions,
        x: rootRect ? cellRect.left - rootRect.left + cellRect.width / 2 : 0,
        y: rootRect ? cellRect.top - rootRect.top : 0,
      });
      onHoverHand?.(hand);
    },
    [cellMap, onHoverHand],
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
    onHoverHand?.(null);
  }, [onHoverHand]);

  const handleTouchStart = useCallback(
    (hand: string, e: React.TouchEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (tooltip?.hand === hand) {
        setTooltip(null);
        onHoverHand?.(null);
        return;
      }
      const cell = cellMap.get(hand);
      const root = (e.currentTarget as HTMLElement).closest(
        ".range-matrix-root",
      );
      const rootRect = root?.getBoundingClientRect();
      const cellRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const actions = cell?.actions ?? [{ action: "fold" as const, freq: 1.0 }];
      setTooltip({
        hand,
        actions,
        x: rootRect ? cellRect.left - rootRect.left + cellRect.width / 2 : 0,
        y: rootRect ? cellRect.top - rootRect.top : 0,
      });
      onHoverHand?.(hand);
    },
    [tooltip, cellMap, onHoverHand],
  );

  // Keep RANKS import used — suppress unused-import by referencing it
  void RANKS;

  return (
    <div className="range-matrix-root relative w-full select-none">
      {/* Легенда — динамическая по фактическим действиям */}
      {!compact && legendEntries.length > 0 && (
        <div className="flex gap-3 flex-wrap mb-2 text-[10px] text-muted-foreground">
          {legendEntries.map(({ action, color, label }) => (
            <span key={action} className="flex items-center gap-1">
              <span
                className="inline-block w-2.5 h-2.5 rounded-sm"
                style={{ background: color }}
              />
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Сетка 13×13 — порядок по HAND_ORDER */}
      <div
        className="grid gap-px rounded overflow-hidden"
        style={{
          gridTemplateColumns: "repeat(13, 1fr)",
          background: "oklch(0.15 0.01 145)",
        }}
      >
        {HAND_ORDER.map((hand) => {
          const cell = cellMap.get(hand);
          const isHighlighted = hand === highlightedHand;
          const gradient = cell ? getCellGradient(cell) : FOLD_COLOR;

          return (
            <div
              key={hand}
              className={`range-cell ${
                isHighlighted
                  ? "z-10 scale-110 ring-2 ring-white ring-inset"
                  : ""
              }`}
              style={{ background: gradient }}
              onMouseEnter={(e) => handleMouseEnter(hand, e)}
              onMouseLeave={handleMouseLeave}
              onTouchStart={(e) => handleTouchStart(hand, e)}
              title={hand}
            >
              {!compact && (
                <span
                  className="text-white font-medium pointer-events-none block w-full text-center"
                  style={{ fontSize: "clamp(5px, 1vw, 10px)" }}
                >
                  {hand}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Тултип */}
      {tooltip && (
        <div
          className="absolute z-20 rounded-lg px-3 py-2 text-xs text-foreground shadow-xl pointer-events-none min-w-[120px]"
          style={{
            left: tooltip.x,
            top: Math.max(0, tooltip.y - 88),
            transform: "translateX(-50%)",
            background: "oklch(0.17 0.01 140)",
            border: "1px solid oklch(0.28 0.04 140)",
          }}
        >
          <div className="font-bold text-sm mb-1 text-foreground">
            {tooltip.hand}
          </div>
          {tooltip.actions.map((a) => (
            <div key={a.action} className="flex justify-between gap-3">
              <span
                style={{
                  color:
                    ACTION_COLORS[a.action as keyof typeof ACTION_COLORS] ??
                    FOLD_COLOR,
                }}
              >
                {actionLabel(a.action)}
              </span>
              <span>{pct(a.freq)}</span>
            </div>
          ))}
          {/* Implicit fold row when not explicitly listed */}
          {(() => {
            const total = tooltip.actions.reduce((s, a) => s + a.freq, 0);
            const implicitFold = Math.max(0, 1 - total);
            const hasFold = tooltip.actions.some((a) => a.action === "fold");
            if (!hasFold && implicitFold > 0.001) {
              return (
                <div className="flex justify-between gap-3">
                  <span style={{ color: FOLD_COLOR }}>Фолд</span>
                  <span>{pct(implicitFold)}</span>
                </div>
              );
            }
            return null;
          })()}
          <div
            className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-0 h-0"
            style={{
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid oklch(0.28 0.04 140)",
            }}
          />
        </div>
      )}
    </div>
  );
}
