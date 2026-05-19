// ─── SummaryScreen — итоги тренировочной сессии ──────────────────────────────

import { useSaveSession } from "@/hooks/useQueries";
import type { HandResult, HandVerdict } from "@/types/trainer";
import { buildSessionData } from "@/utils/sessionMapper";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useEffect, useRef } from "react";

interface SummaryScreenProps {
  results: HandResult[];
  scenario: string;
  stackBB: number;
  onRestart: () => void;
}

const VERDICT_CONFIG: Record<
  HandVerdict,
  { label: string; color: string; icon: string }
> = {
  correct: { label: "Верно", color: "text-emerald-500", icon: "✓" },
  acceptable: { label: "Приемлемо", color: "text-amber-400", icon: "~" },
  mistake: { label: "Ошибка", color: "text-rose-500", icon: "✗" },
};

const SCENARIO_SHORT: Record<string, string> = {
  open_push: "BTN Push",
  call_shove: "BB Call",
  bb_defence: "BB Def",
  open_raise: "BTN Raise",
  vs_3bet: "vs 3bet",
  // legacy fallbacks
  push: "BTN Push",
  call: "BB Call",
  defence: "BB Def",
};

const ACTION_SHORT: Record<string, string> = {
  fold: "Fold",
  push: "Push",
  call: "Call",
};

function pct(f: number) {
  return `${Math.round(f * 100)}%`;
}

function getVerdictMessage(score: number): string {
  if (score >= 90) return "Превосходно! GTO-машина";
  if (score >= 75) return "Отличная работа! Продолжай в том же духе";
  if (score >= 60) return "Хороший результат, есть куда расти";
  if (score >= 40) return "Нужно поработать над диапазонами";
  return "Изучи Nash-таблицы ещё раз";
}

export function SummaryScreen({
  results,
  scenario,
  stackBB,
  onRestart,
}: SummaryScreenProps) {
  const { isAuthenticated } = useInternetIdentity();
  const saveSession = useSaveSession();
  const savedRef = useRef(false);

  const correct = results.filter((r) => r.verdict === "correct").length;
  const acceptable = results.filter((r) => r.verdict === "acceptable").length;
  const mistakes = results.filter((r) => r.verdict === "mistake").length;
  const scoreRaw = ((correct + acceptable * 0.5) / results.length) * 100;
  const score = Math.round(scoreRaw);

  // Auto-save once when authenticated — savedRef guards against re-runs
  useEffect(() => {
    if (!isAuthenticated || savedRef.current || results.length === 0) return;
    savedRef.current = true;
    saveSession.mutate(
      buildSessionData(results, {
        scenario,
        stackRange: `${stackBB}bb`,
      }),
    );
  }, [isAuthenticated, results, scenario, stackBB, saveSession]);

  return (
    <div
      className="min-h-screen table-felt flex flex-col items-center justify-start px-4 py-8 sm:py-12"
      data-ocid="summary.page"
    >
      {/* Заголовок */}
      <div className="text-center mb-6">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
          Сессия завершена
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {getVerdictMessage(score)}
        </p>
      </div>

      {/* Счёт */}
      <div
        className="w-full max-w-md mb-6 rounded-2xl p-5"
        style={{ background: "oklch(0.155 0.015 145)" }}
      >
        {/* Большой процент */}
        <div className="text-center mb-4">
          <span
            className="font-display text-5xl font-bold"
            style={{
              color:
                score >= 75
                  ? "oklch(0.72 0.22 145)"
                  : score >= 50
                    ? "oklch(0.75 0.18 55)"
                    : "oklch(0.65 0.24 15)",
            }}
          >
            {score}%
          </span>
          <p className="text-xs text-muted-foreground mt-1">общий результат</p>
        </div>

        {/* Три счётчика */}
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              ["correct", correct],
              ["acceptable", acceptable],
              ["mistake", mistakes],
            ] as [HandVerdict, number][]
          ).map(([v, count]) => {
            const cfg = VERDICT_CONFIG[v];
            return (
              <div
                key={v}
                className="flex flex-col items-center gap-1 py-3 rounded-xl"
                style={{ background: "oklch(0.18 0.01 145)" }}
                data-ocid={`summary.stat_${v}`}
              >
                <span className={`text-2xl font-bold ${cfg.color}`}>
                  {count}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Таблица раздач */}
      <div className="w-full max-w-md mb-6">
        <h3 className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
          Детали раздач
        </h3>
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid oklch(0.22 0.02 145)" }}
        >
          {/* Хедер */}
          <div
            className="grid grid-cols-5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-3 py-2"
            style={{ background: "oklch(0.17 0.01 145)" }}
          >
            <span>#</span>
            <span>Рука</span>
            <span>Сценарий</span>
            <span>Действие</span>
            <span className="text-right">Итог</span>
          </div>

          {/* Строки */}
          {results.map((r, i) => {
            const cfg = VERDICT_CONFIG[r.verdict];
            return (
              <div
                key={`${r.hand}-${i}`}
                className="grid grid-cols-5 text-xs px-3 py-2.5 items-center"
                style={{
                  background:
                    i % 2 === 0
                      ? "oklch(0.155 0.01 145)"
                      : "oklch(0.145 0.005 145)",
                }}
                data-ocid={`summary.result.item.${i + 1}`}
              >
                <span className="text-muted-foreground">{i + 1}</span>
                <span className="font-mono font-semibold text-foreground">
                  {r.hand}
                </span>
                <span className="text-muted-foreground">
                  {SCENARIO_SHORT[r.scenario] ?? r.scenario}
                </span>
                <span className="text-muted-foreground">
                  {ACTION_SHORT[r.playerAction] ?? r.playerAction}
                  <span className="text-[9px] ml-1 opacity-60">
                    {pct(r.correctFreq)}
                  </span>
                </span>
                <span className={`text-right font-bold ${cfg.color}`}>
                  {cfg.icon}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save indicator */}
      {isAuthenticated && (
        <div
          className="mt-2 mb-4 text-center text-xs"
          data-ocid="summary.save_indicator"
        >
          {saveSession.isPending && (
            <span className="text-muted-foreground/60">Сохранение…</span>
          )}
          {saveSession.isSuccess && (
            <span className="text-emerald-400">Сохранено ✓</span>
          )}
          {saveSession.isError && (
            <span className="text-rose-400">Ошибка сохранения</span>
          )}
        </div>
      )}

      {/* Кнопка рестарта */}
      <button
        type="button"
        onClick={onRestart}
        data-ocid="summary.restart_button"
        className="
          w-full max-w-xs py-4 rounded-xl font-bold text-lg
          text-accent-foreground chip-button
          transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
        "
        style={{ background: "oklch(0.55 0.18 55)" }}
      >
        Начать новую сессию
      </button>
    </div>
  );
}
