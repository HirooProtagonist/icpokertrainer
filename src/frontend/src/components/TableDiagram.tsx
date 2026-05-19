// ─── TableDiagram — схема покерного стола с позициями ────────────────────────

import type { ScenarioType } from "@/types/spot";
import type { StackSize } from "@/types/trainer";

interface TableDiagramProps {
  scenario: ScenarioType;
  stackBB: StackSize;
}

const SCENARIO_LABEL: Record<ScenarioType, string> = {
  open_push: "BTN Push/Fold",
  call_shove: "BB vs BTN Push",
  bb_defence: "BB Defence",
  open_raise: "BTN Open Raise",
  vs_3bet: "BTN vs 3-bet",
};

const SCENARIO_DESC: Record<ScenarioType, string> = {
  open_push: "Вы на BTN — пуш или фолд",
  call_shove: "BB — отвечаете на пуш BTN",
  bb_defence: "BB — защита от открытия BTN",
  open_raise: "Вы на BTN — открывающий рейз",
  vs_3bet: "Вы на BTN — ответ на 3-бет",
};

interface SeatProps {
  label: string;
  role: "hero" | "villain" | "empty";
  x: number;
  y: number;
  stackBB?: StackSize;
}

function Seat({ label, role, x, y, stackBB }: SeatProps) {
  const base =
    "absolute flex flex-col items-center gap-0.5 transform -translate-x-1/2 -translate-y-1/2";
  const chip =
    role === "hero"
      ? "w-10 h-10 rounded-full bg-accent text-accent-foreground font-bold text-xs flex items-center justify-center ring-2 ring-accent/60 shadow-lg"
      : role === "villain"
        ? "w-9 h-9 rounded-full bg-muted text-muted-foreground font-semibold text-xs flex items-center justify-center ring-1 ring-border"
        : "w-8 h-8 rounded-full bg-card/40 text-muted-foreground/40 text-[10px] flex items-center justify-center ring-1 ring-border/30";

  return (
    <div className={base} style={{ left: `${x}%`, top: `${y}%` }}>
      <div className={chip}>{label}</div>
      {role === "hero" && stackBB && (
        <span className="text-[10px] font-mono text-accent font-semibold whitespace-nowrap">
          {stackBB}bb ★
        </span>
      )}
      {role === "villain" && (
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
          villain
        </span>
      )}
    </div>
  );
}

export function TableDiagram({ scenario, stackBB }: TableDiagramProps) {
  // Позиции вокруг стола (в %) — 3-handed: BTN 80% right, SB top, BB left
  // BTN: right-center, BB: left-center, SB: top-center
  const seats: SeatProps[] = [
    {
      label: "BTN",
      role:
        scenario === "open_push" ||
        scenario === "open_raise" ||
        scenario === "vs_3bet"
          ? "hero"
          : "villain",
      x: 78,
      y: 52,
      stackBB:
        scenario === "open_push" ||
        scenario === "open_raise" ||
        scenario === "vs_3bet"
          ? stackBB
          : undefined,
    },
    {
      label: "SB",
      role: "empty",
      x: 50,
      y: 14,
    },
    {
      label: "BB",
      role:
        scenario === "call_shove" || scenario === "bb_defence"
          ? "hero"
          : "empty",
      x: 22,
      y: 52,
      stackBB:
        scenario === "call_shove" || scenario === "bb_defence"
          ? stackBB
          : undefined,
    },
  ];

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Стол */}
      <div className="relative w-52 h-28 sm:w-64 sm:h-36">
        {/* Овальный стол */}
        <div className="absolute inset-0 rounded-[50%] table-felt ring-2 ring-green-900">
          <div className="absolute inset-0 rounded-[50%] ring-2 ring-inset ring-white/5" />
        </div>

        {/* Фишки на столе — декоративные */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1 opacity-30">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="w-2 h-2 rounded-full bg-accent" />
        </div>

        {/* Позиции */}
        {seats.map((seat) => (
          <Seat key={seat.label} {...seat} />
        ))}
      </div>

      {/* Подпись сценария */}
      <div className="text-center">
        <p className="text-xs font-semibold text-accent tracking-wide uppercase">
          {SCENARIO_LABEL[scenario]}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {SCENARIO_DESC[scenario]}
        </p>
      </div>
    </div>
  );
}
