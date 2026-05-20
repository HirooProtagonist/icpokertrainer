// ─── Trainer — корневой компонент с state machine тренажёра ─────────────────

import { ActionPanel } from "@/components/ActionPanel";
import { CardDisplay } from "@/components/CardDisplay";
import { RangeMatrix } from "@/components/RangeMatrix";
import { SetupScreen } from "@/components/SetupScreen";
import { SummaryScreen } from "@/components/SummaryScreen";
import { TableDiagram } from "@/components/TableDiagram";
import { getAllHands } from "@/data/handUtils";
import { buildSpotId as buildSpotIdFromData } from "@/data/spotId";
import { spotProvider } from "@/providers/SpotProvider";
import type { ActionDef, ActionType, RangeCell, Verdict } from "@/types/spot";
import { evaluateAnswer } from "@/types/spot";
import type { ScenarioType } from "@/types/spot";
import type {
  DealState,
  HandResult,
  PlayerAction,
  StackSize,
  TrainerState,
} from "@/types/trainer";
import { useCallback, useEffect, useState } from "react";

// ─── Константы ────────────────────────────────────────────────────────────

const SESSION_SIZE = 10;

const SCENARIO_POSITION: Record<ScenarioType, string> = {
  open_push: "BTN",
  call_shove: "BB",
  bb_defence: "BB",
  open_raise: "BTN",
  vs_3bet: "BTN",
};

// ─── ActionDef[] по сценарию ─────────────────────────────────────────────

const SCENARIO_ACTION_DEFS: Record<ScenarioType, ActionDef[]> = {
  open_push: [
    { type: "fold", label: "Fold" },
    { type: "push", label: "All-in", sizing: { isAllIn: true } },
  ],
  call_shove: [
    { type: "fold", label: "Fold" },
    { type: "call", label: "Call" },
  ],
  bb_defence: [
    { type: "fold", label: "Fold" },
    { type: "call", label: "Call" },
    { type: "3bet", label: "3-bet" },
  ],
  open_raise: [
    { type: "fold", label: "Fold" },
    { type: "raise", label: "Raise 2.5bb", sizing: { bb: 2.5 } },
  ],
  vs_3bet: [
    { type: "fold", label: "Fold" },
    { type: "call", label: "Call" },
    { type: "4bet", label: "4-bet" },
  ],
};

// ─── Initial state ───────────────────────────────────────────────────────────────

const INITIAL_STATE: TrainerState = {
  phase: "setup",
  scenario: "open_push",
  stackBB: 20,
  handCount: 0,
  handsPlayed: [],
  currentDeal: null,
  lastAction: null,
  lastResult: null,
  results: [],
  board: undefined,
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

// Maps ScenarioType to SPOT_DATA segment values used in buildSpotId
const SCENARIO_PARAMS: Record<
  ScenarioType,
  { scenario: string; heroPos: string; villainPos: string[] }
> = {
  open_push: { scenario: "open", heroPos: "BTN", villainPos: ["none"] },
  call_shove: { scenario: "call_shove", heroPos: "BB", villainPos: ["BTN"] },
  bb_defence: { scenario: "vsopen", heroPos: "BB", villainPos: ["BTN"] },
  open_raise: { scenario: "open", heroPos: "BTN", villainPos: ["none"] },
  vs_3bet: { scenario: "open", heroPos: "BTN", villainPos: ["none"] },
};

// Build spotId from ScenarioType + stackBB — single source of truth
function buildNewSpotId(scenario: ScenarioType, stackBB: StackSize): string {
  const p = SCENARIO_PARAMS[scenario];
  return buildSpotIdFromData({
    scenario: p.scenario as import("@/types/spot").ScenarioType,
    heroPos: p.heroPos as import("@/types/spot").PositionType,
    villainPos: p.villainPos as import("@/types/spot").PositionType[],
    players: "6max" as import("@/types/spot").FormatType,
    stackBb: stackBB,
    icm: "nash" as import("@/types/spot").IcmType,
  });
}

function dealHand(
  scenario: ScenarioType,
  stackBB: StackSize,
  handsPlayed: string[],
): DealState {
  const allHands = getAllHands();
  const available = allHands.filter((h) => !handsPlayed.includes(h));
  const hand = available[Math.floor(Math.random() * available.length)];
  const position = SCENARIO_POSITION[scenario];
  return { hand, scenario, position, stackBB };
}

// ─── calcResult ────────────────────────────────────────────────────────────────────

async function loadCellsForSpot(
  spotId: string,
): Promise<Map<string, RangeCell>> {
  const cells = await spotProvider.getRange(spotId);
  const map = new Map<string, RangeCell>();
  for (const cell of cells) map.set(cell.hand, cell);
  return map;
}

// Module-level cache: spotId → hand → RangeCell
const spotCellCache = new Map<string, Map<string, RangeCell>>();

// Preload all known spots at module init so calcResult hits cache synchronously
const KNOWN_SPOT_IDS = [
  "open_BTN_none_6max_15bb_nash",
  "open_BTN_none_6max_20bb_nash",
  "open_BTN_none_6max_25bb_nash",
  "call_shove_BB_BTN_6max_15bb_nash",
  "call_shove_BB_BTN_6max_20bb_nash",
  "call_shove_BB_BTN_6max_25bb_nash",
  "vsopen_BB_BTN_6max_15bb_nash",
  "vsopen_BB_BTN_6max_20bb_nash",
  "vsopen_BB_BTN_6max_25bb_nash",
];
for (const sid of KNOWN_SPOT_IDS) {
  loadCellsForSpot(sid).then((m) => spotCellCache.set(sid, m));
}

function calcResult(deal: DealState, action: PlayerAction): HandResult {
  const spotId = buildNewSpotId(deal.scenario, deal.stackBB);
  const cached = spotCellCache.get(spotId);
  const cell = cached?.get(deal.hand) ?? null;

  let verdict: Verdict;
  let correctFreq: number;

  if (cell) {
    verdict = evaluateAnswer(action as ActionType, cell);
    correctFreq = cell.actions.find((a) => a.action === action)?.freq ?? 0;
  } else {
    // Hand not in range — fold is always correct
    verdict = action === "fold" ? "correct" : "mistake";
    correctFreq = 0;
  }

  return {
    hand: deal.hand,
    scenario: deal.scenario,
    spotId,
    playerAction: action,
    correctFreq,
    verdict,
  };
}

// ─── Verdict Badge ──────────────────────────────────────────────────────────────────

const VERDICT_STYLE = {
  correct: {
    label: "Правильно!",
    style: { color: "oklch(0.72 0.22 145)" },
    icon: "✓",
  },
  acceptable: {
    label: "Приемлемо",
    style: { color: "oklch(0.75 0.18 55)" },
    icon: "~",
  },
  mistake: {
    label: "Ошибка!",
    style: { color: "oklch(0.65 0.24 15)" },
    icon: "✗",
  },
} as const;

const ACTION_LABEL: Record<string, string> = {
  fold: "Фолд",
  push: "Пуш",
  call: "Колл",
  "3bet": "3-бет",
  "4bet": "4-бет",
  raise: "Рейз",
};

// ─── Component ─────────────────────────────────────────────────────────────────────

export function Trainer() {
  const [state, setState] = useState<TrainerState>(INITIAL_STATE);
  const [viewStack, setViewStack] = useState<StackSize>(20);
  // New-format cells for the current view spot (used by RangeMatrix)
  const [viewCells, setViewCells] = useState<RangeCell[]>([]);

  // Sync viewStack with selected stackBB
  useEffect(() => {
    setViewStack(state.stackBB);
  }, [state.stackBB]);

  // Load cells for the currently viewed spot (scenario + viewStack)
  useEffect(() => {
    if (state.phase === "setup" || state.phase === "summary") return;
    const spotId = buildNewSpotId(state.scenario, viewStack);
    spotProvider.getRange(spotId).then(setViewCells);
  }, [state.scenario, state.phase, viewStack]);

  // ── onStart ─────────────────────────────────────────────────────────────────
  const handleStart = useCallback(
    (scenario: ScenarioType, stackBB: StackSize) => {
      const deal = dealHand(scenario, stackBB, []);
      setState({
        ...INITIAL_STATE,
        phase: "dealing",
        scenario,
        stackBB,
        handCount: 1,
        handsPlayed: [deal.hand],
        currentDeal: deal,
      });
      setViewStack(stackBB);
    },
    [],
  );

  // ── onAction ────────────────────────────────────────────────────────────────
  const handleAction = useCallback(
    (actionType: ActionType) => {
      if (!state.currentDeal) return;
      const action = actionType as PlayerAction;
      const result = calcResult(state.currentDeal, action);
      setState((prev) => ({
        ...prev,
        phase: "feedback",
        lastAction: action,
        lastResult: result,
        results: [...prev.results, result],
      }));
    },
    [state.currentDeal],
  );

  // ── onNext ────────────────────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    setState((prev) => {
      if (prev.handCount >= SESSION_SIZE) {
        return { ...prev, phase: "summary" };
      }
      const deal = dealHand(prev.scenario, prev.stackBB, prev.handsPlayed);
      return {
        ...prev,
        phase: "dealing",
        handCount: prev.handCount + 1,
        handsPlayed: [...prev.handsPlayed, deal.hand],
        currentDeal: deal,
        lastAction: null,
        lastResult: null,
      };
    });
  }, []);

  // ── onRestart ──────────────────────────────────────────────────────────────────
  const handleRestart = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  // ── Setup phase ─────────────────────────────────────────────────────────────────
  if (state.phase === "setup") {
    return <SetupScreen onStart={handleStart} />;
  }

  // ── Summary phase ─────────────────────────────────────────────────────────────
  if (state.phase === "summary") {
    return (
      <SummaryScreen
        results={state.results}
        scenario={state.scenario}
        stackBB={state.stackBB}
        onRestart={handleRestart}
      />
    );
  }

  // ── Dealing / Feedback phases ──────────────────────────────────────────────
  const { currentDeal, phase } = state;
  if (!currentDeal) return null;

  const isDealing = phase === "dealing";
  const result = state.lastResult;
  const verdictCfg = result
    ? VERDICT_STYLE[result.verdict as keyof typeof VERDICT_STYLE]
    : null;
  const currentActionDefs = SCENARIO_ACTION_DEFS[state.scenario];

  return (
    <div
      className="min-h-screen table-felt flex flex-col"
      data-ocid="trainer.page"
    >
      {/* ── Хедер: счётчик + сценарий ────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid oklch(0.20 0.04 145)" }}
      >
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-sm text-foreground">
            ICPokerTrainer
          </span>
        </div>
        <div
          className="px-3 py-1 rounded-full text-xs font-semibold text-accent font-mono"
          style={{ background: "oklch(0.18 0.04 145)" }}
          data-ocid="trainer.hand_counter"
        >
          Рука {state.handCount}/{SESSION_SIZE}
        </div>
      </header>

      {/* ── Основной контент ───────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center px-4 py-4 gap-4 max-w-2xl mx-auto w-full">
        {/* Стол + вердикт */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <TableDiagram
            scenario={state.scenario}
            stackBB={currentDeal.stackBB}
          />

          {/* Вердикт (только в feedback) */}
          {!isDealing && verdictCfg && result && (
            <div
              className="flex flex-col items-center gap-1 px-5 py-4 rounded-2xl"
              style={{ background: "oklch(0.17 0.01 145)" }}
              data-ocid="trainer.verdict"
            >
              <span className="text-3xl font-bold" style={verdictCfg.style}>
                {verdictCfg.icon}
              </span>
              <span
                className="font-semibold text-base"
                style={verdictCfg.style}
              >
                {verdictCfg.label}
              </span>
              <div className="text-xs text-muted-foreground mt-1 text-center">
                <div>
                  Ваш ход:{" "}
                  <span className="text-foreground font-semibold">
                    {ACTION_LABEL[result.playerAction] ?? result.playerAction}
                  </span>
                </div>
                <div>
                  GTO:{" "}
                  <span className="text-foreground font-semibold">
                    {Math.round(result.correctFreq * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Карты */}
        <div data-ocid="trainer.cards">
          <CardDisplay hand={currentDeal.hand} faceDown={false} />
        </div>

        {/* ── Блок фидбека ───────────────────────────────────────────────────── */}
        {!isDealing && (
          <div
            className="w-full flex flex-col gap-3"
            data-ocid="trainer.feedback"
          >
            {/* Переключатель стека */}
            <div className="flex items-center gap-2 justify-center">
              <span className="text-xs text-muted-foreground">
                Посмотреть диапазон при:
              </span>
              <div className="flex gap-1">
                {([15, 20, 25] as StackSize[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setViewStack(s)}
                    data-ocid={`trainer.view_stack_${s}`}
                    className={`
                      px-2 py-1 rounded text-xs font-mono font-semibold transition-all duration-100
                      ${
                        viewStack === s
                          ? "text-accent"
                          : "text-muted-foreground hover:text-foreground"
                      }
                    `}
                    style={{
                      background:
                        viewStack === s
                          ? "oklch(0.20 0.04 145)"
                          : "transparent",
                      border:
                        viewStack === s
                          ? "1px solid oklch(0.72 0.16 55)"
                          : "1px solid oklch(0.22 0.02 145)",
                    }}
                  >
                    {s}bb
                  </button>
                ))}
              </div>
            </div>

            {/* Матрица диапазона — новый формат RangeCell */}
            <div data-ocid="trainer.range_matrix">
              <RangeMatrix
                cells={viewCells}
                highlightedHand={currentDeal.hand}
              />
            </div>
          </div>
        )}

        {/* ── Панель действий / кнопка «Далее» ────────────────────────────── */}
        <div className="w-full flex justify-center mt-auto pt-2">
          {isDealing ? (
            <ActionPanel
              actions={currentActionDefs}
              onAction={handleAction}
              disabled={false}
            />
          ) : (
            <button
              type="button"
              onClick={handleNext}
              data-ocid="trainer.next_button"
              className="
                min-w-[200px] py-3 px-8 rounded-xl font-bold text-base
                text-accent-foreground chip-button
                transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
              "
              style={{ background: "oklch(0.55 0.18 55)" }}
            >
              {state.handCount >= SESSION_SIZE
                ? "Посмотреть итоги"
                : "Следующая рука"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
