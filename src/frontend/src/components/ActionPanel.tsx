// ─── ActionPanel — динамические кнопки действий (Iteration 2) ────────────────
// Accepts ActionDef[] — fully declarative, no scenario-based lookup.

import type { ActionDef, ActionType, SizingDef } from "@/types/spot";
import { useCallback } from "react";

interface ActionPanelProps {
  actions: ActionDef[];
  onAction: (action: ActionType) => void;
  disabled?: boolean;
}

// ─── Label builder ────────────────────────────────────────────────────────────

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildActionLabel(def: ActionDef): string {
  if (def.label) return def.label;
  const s: SizingDef | undefined = def.sizing;
  if (s?.isAllIn) return "All-in";
  if (s?.bb != null) return `${capitalize(def.type)} ${s.bb}bb`;
  if (s?.pct != null) return `${capitalize(def.type)} ${s.pct}%`;
  return capitalize(def.type);
}

// ─── Hotkey assignment (by position in actions array) ────────────────────────
// Hotkeys are assigned by ActionType for the common actions, falling back to
// position index for custom types.

const TYPE_HOTKEY: Partial<Record<ActionType, string>> = {
  fold: "F",
  push: "P",
  call: "C",
  check: "X",
  raise: "R",
  "3bet": "B",
  "4bet": "4",
  limp: "L",
};

const POSITION_HOTKEYS = ["1", "2", "3", "4", "5"];

function getHotkey(def: ActionDef, index: number): string {
  return TYPE_HOTKEY[def.type] ?? POSITION_HOTKEYS[index] ?? "";
}

// ─── Default color styles per action type ─────────────────────────────────────

const TYPE_COLOR_STYLE: Partial<Record<ActionType, React.CSSProperties>> = {
  fold: {
    background: "oklch(0.22 0.01 145)",
    borderColor: "oklch(0.30 0.02 145)",
  },
  push: {
    background: "oklch(0.35 0.14 145)",
    borderColor: "oklch(0.50 0.18 145)",
  },
  call: {
    background: "oklch(0.35 0.16 265)",
    borderColor: "oklch(0.50 0.20 265)",
  },
  raise: {
    background: "oklch(0.35 0.14 55)",
    borderColor: "oklch(0.50 0.18 55)",
  },
  "3bet": {
    background: "oklch(0.32 0.14 310)",
    borderColor: "oklch(0.48 0.18 310)",
  },
  "4bet": {
    background: "oklch(0.29 0.16 310)",
    borderColor: "oklch(0.44 0.20 310)",
  },
  check: {
    background: "oklch(0.30 0.12 165)",
    borderColor: "oklch(0.45 0.15 165)",
  },
  limp: {
    background: "oklch(0.30 0.10 180)",
    borderColor: "oklch(0.45 0.13 180)",
  },
};

function getColorStyle(def: ActionDef): React.CSSProperties {
  if (def.color) {
    return { background: def.color, borderColor: def.color };
  }
  return (
    TYPE_COLOR_STYLE[def.type] ?? {
      background: "oklch(0.22 0.01 145)",
      borderColor: "oklch(0.30 0.02 145)",
    }
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ActionPanel({
  actions,
  onAction,
  disabled = false,
}: ActionPanelProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      const key = e.key.toLowerCase();
      // Match by hotkey character
      const match = actions.find(
        (def, idx) => getHotkey(def, idx).toLowerCase() === key,
      );
      if (match) {
        e.preventDefault();
        onAction(match.type);
      }
    },
    [disabled, actions, onAction],
  );

  return (
    <div
      className={`flex gap-3 sm:gap-4 justify-center outline-none ${
        disabled ? "pointer-events-none opacity-40" : ""
      }`}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      aria-label="Панель действий"
      data-ocid="action_panel"
    >
      {actions.map((def, idx) => {
        const hotkey = getHotkey(def, idx);
        const colorStyle = getColorStyle(def);
        const label = buildActionLabel(def);

        return (
          <button
            key={`${def.type}-${idx}`}
            type="button"
            onClick={() => onAction(def.type)}
            className="
              relative flex flex-col items-center justify-center
              min-w-[80px] sm:min-w-[96px] px-4 sm:px-6 py-3 sm:py-4
              rounded-xl border font-semibold text-sm sm:text-base
              text-foreground chip-button
              transition-all duration-150 focus-visible:ring-2 focus-visible:ring-accent
              focus-visible:outline-none hover:brightness-125
            "
            style={colorStyle}
            aria-label={label}
            data-ocid={`action.${def.type}_button`}
          >
            <span className="text-base sm:text-lg font-bold">{label}</span>
            {hotkey && (
              <span className="absolute top-1 right-1.5 text-[9px] opacity-40 font-mono">
                {hotkey}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
