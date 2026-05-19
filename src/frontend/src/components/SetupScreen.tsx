// ─── SetupScreen — начальный экран выбора сценария и стека ───────────────────

import { useProfile } from "@/hooks/useQueries";
import type { ScenarioType, StackSize } from "@/types/trainer";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useState } from "react";

interface SetupScreenProps {
  onStart: (scenario: ScenarioType, stackBB: StackSize) => void;
}

interface ScenarioOption {
  id: ScenarioType;
  title: string;
  desc: string;
  icon: string;
}

const SCENARIOS: ScenarioOption[] = [
  {
    id: "open_push",
    title: "BTN Push/Fold",
    desc: "Вы на BTN с коротким стеком. Пушить или фолдить?",
    icon: "♠",
  },
  {
    id: "call_shove",
    title: "BB Call Push",
    desc: "BTN пушит all-in. Колл или фолд с BB?",
    icon: "♥",
  },
  {
    id: "bb_defence",
    title: "BB Defence",
    desc: "BTN открывает рейз. Фолд, колл или 3-бет?",
    icon: "♦",
  },
];

const STACKS: StackSize[] = [10, 15, 20, 25];

// ─── Scenario stats helper ───────────────────────────────────────────────────────────────────

interface ScenarioStats {
  attempts: number;
  mistakes: number;
  accuracy: number;
}

function calcScenarioStats(
  spotStats: Array<[string, { attempts: bigint; mistakes: bigint }]>,
  scenario: ScenarioType,
): ScenarioStats | null {
  const SCENARIO_SPOT_PREFIX: Record<ScenarioType, string> = {
    open_push: "open_",
    call_shove: "call_shove_",
    bb_defence: "vsopen_",
    open_raise: "open_",
    vs_3bet: "open_",
  };
  const relevant = spotStats.filter(([id]) =>
    id.startsWith(SCENARIO_SPOT_PREFIX[scenario]),
  );
  if (relevant.length === 0) return null;
  const totAttempts = relevant.reduce((s, [, v]) => s + Number(v.attempts), 0);
  const totMistakes = relevant.reduce((s, [, v]) => s + Number(v.mistakes), 0);
  if (totAttempts === 0) return null;
  const accuracy = Math.round(
    ((totAttempts - totMistakes) / totAttempts) * 100,
  );
  return { attempts: totAttempts, mistakes: totMistakes, accuracy };
}

function StatsBlock({ scenario }: { scenario: ScenarioType }) {
  const { isAuthenticated } = useInternetIdentity();
  const { data: profile, isLoading } = useProfile();

  if (!isAuthenticated) {
    return (
      <div
        className="w-full max-w-2xl mb-4 px-4 py-2.5 rounded-lg text-center text-xs text-muted-foreground/60"
        style={{ background: "oklch(0.155 0.01 145)" }}
        data-ocid="setup.stats.login_prompt"
      >
        Войдите, чтобы отслеживать прогресс
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="w-full max-w-2xl mb-4 px-4 py-2.5 rounded-lg text-center text-xs text-muted-foreground/40"
        style={{ background: "oklch(0.155 0.01 145)" }}
        data-ocid="setup.stats.loading_state"
      >
        Загрузка статистики…
      </div>
    );
  }

  const stats = profile?.spotStats
    ? calcScenarioStats(profile.spotStats, scenario)
    : null;

  return (
    <div
      className="w-full max-w-2xl mb-4 px-4 py-3 rounded-lg"
      style={{ background: "oklch(0.155 0.01 145)" }}
      data-ocid="setup.stats.panel"
    >
      {stats === null ? (
        <p className="text-xs text-muted-foreground/60 text-center">
          Нет сессий — начните тренировку, чтобы отслеживать прогресс
        </p>
      ) : (
        <div className="flex items-center justify-around gap-4">
          <div className="text-center">
            <span
              className="block font-bold text-lg"
              style={{
                color:
                  stats.accuracy >= 75
                    ? "oklch(0.72 0.22 145)"
                    : stats.accuracy >= 50
                      ? "oklch(0.75 0.18 55)"
                      : "oklch(0.65 0.24 15)",
              }}
            >
              {stats.accuracy}%
            </span>
            <span className="text-[10px] text-muted-foreground">Точность</span>
          </div>
          <div className="text-center">
            <span className="block font-bold text-lg text-foreground">
              {stats.attempts}
            </span>
            <span className="text-[10px] text-muted-foreground">Раздач</span>
          </div>
          <div className="text-center">
            <span className="block font-bold text-lg text-rose-500">
              {stats.mistakes}
            </span>
            <span className="text-[10px] text-muted-foreground">Ошибок</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function SetupScreen({ onStart }: SetupScreenProps) {
  const [scenario, setScenario] = useState<ScenarioType>("open_push");
  const [stack, setStack] = useState<StackSize>(20);

  const selected = SCENARIOS.find((s) => s.id === scenario)!;

  return (
    <div
      className="min-h-screen table-felt flex flex-col items-center justify-center px-4 py-8"
      data-ocid="setup.page"
    >
      {/* Логотип / заголовок */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-3xl" aria-hidden="true">
            ♠
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            ICPokerTrainer
          </h1>
          <span className="text-3xl" aria-hidden="true">
            ♠
          </span>
        </div>
        <p className="text-muted-foreground text-sm sm:text-base">
          GTO-тренажёр префлопа для турнирных игроков
        </p>
      </div>

      {/* Карточки сценариев */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-2xl mb-6">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setScenario(s.id)}
            data-ocid={`setup.scenario_${s.id}`}
            className={`
              relative flex flex-col items-start gap-1.5 p-4 rounded-xl
              border text-left transition-all duration-150 chip-button
              ${
                scenario === s.id
                  ? "border-accent ring-1 ring-accent text-foreground"
                  : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
              }
            `}
            style={{
              background:
                scenario === s.id
                  ? "oklch(0.18 0.04 145)"
                  : "oklch(0.14 0.01 145)",
            }}
          >
            <span
              className={`text-2xl leading-none ${
                scenario === s.id ? "text-accent" : "text-muted-foreground"
              }`}
            >
              {s.icon}
            </span>
            <span className="font-semibold text-sm leading-tight">
              {s.title}
            </span>
            <span className="text-[11px] opacity-70 leading-tight">
              {s.desc}
            </span>
            {scenario === s.id && (
              <span className="absolute top-2 right-2 text-accent text-xs font-bold">
                ✓
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Описание выбранного сценария */}
      <div
        className="w-full max-w-2xl mb-6 px-4 py-3 rounded-lg text-sm text-muted-foreground text-center"
        style={{ background: "oklch(0.155 0.01 145)" }}
      >
        <span className="text-accent font-semibold">{selected.title}</span> —{" "}
        {selected.desc}
      </div>

      {/* Stats block */}
      <StatsBlock scenario={scenario} />

      {/* Выбор стека */}
      <div className="w-full max-w-2xl mb-8">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3 text-center">
          Размер стека
        </p>
        <div className="flex gap-2 sm:gap-3 justify-center">
          {STACKS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStack(s)}
              data-ocid={`setup.stack_${s}`}
              className={`
                flex-1 max-w-[140px] py-2.5 rounded-lg border text-sm font-semibold
                transition-all duration-150 chip-button
                ${
                  stack === s
                    ? "border-accent text-accent"
                    : "border-border text-muted-foreground hover:text-foreground"
                }
              `}
              style={{
                background:
                  stack === s ? "oklch(0.18 0.04 145)" : "oklch(0.14 0.01 145)",
              }}
            >
              <span className="font-mono text-base">{s}bb</span>
              <br />
              <span className="text-[10px] opacity-60 font-normal">
                {s === 10
                  ? "хайпер"
                  : s === 15
                    ? "турбо"
                    : s === 20
                      ? "стандарт"
                      : "глубже"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Кнопка старта */}
      <button
        type="button"
        onClick={() => onStart(scenario, stack)}
        data-ocid="setup.start_button"
        className="
          w-full max-w-xs py-4 rounded-xl font-bold text-lg
          text-accent-foreground chip-button
          transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
        "
        style={{ background: "oklch(0.55 0.18 55)" }}
      >
        Начать сессию
        <span className="ml-2 opacity-70 text-sm font-normal">(10 раздач)</span>
      </button>

      {/* Подсказка хоткеев */}
      <p className="mt-6 text-[11px] text-muted-foreground/60 text-center">
        Управление: <kbd className="font-mono">F</kbd> фолд ·{" "}
        <kbd className="font-mono">P</kbd> пуш ·{" "}
        <kbd className="font-mono">C</kbd> колл
      </p>
    </div>
  );
}
