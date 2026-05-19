// ─── CardDisplay — отображение покерной руки как реальные игральные карты ────

import { type DisplayCard, getSuitSymbol, parseHand } from "@/data/handUtils";

interface CardProps {
  card: DisplayCard;
}

function PlayingCard({ card }: CardProps) {
  const { symbol, isRed } = getSuitSymbol(card.suit);
  const textColor = isRed ? "text-red-600" : "text-[oklch(0.1_0_0)]";

  return (
    <div className="card-playing w-20 sm:w-24 md:w-28 select-none">
      {/* Top-left rank + suit */}
      <div
        className={`absolute top-1.5 left-2 flex flex-col items-center leading-none ${textColor}`}
      >
        <span className="text-base sm:text-lg font-bold leading-none">
          {card.rank}
        </span>
        <span className="text-sm sm:text-base leading-none">{symbol}</span>
      </div>

      {/* Center suit symbol */}
      <span
        className={`text-3xl sm:text-4xl font-normal ${textColor}`}
        aria-hidden="true"
      >
        {symbol}
      </span>

      {/* Bottom-right rank + suit (rotated) */}
      <div
        className={`absolute bottom-1.5 right-2 flex flex-col items-center leading-none rotate-180 ${textColor}`}
      >
        <span className="text-base sm:text-lg font-bold leading-none">
          {card.rank}
        </span>
        <span className="text-sm sm:text-base leading-none">{symbol}</span>
      </div>
    </div>
  );
}

function CardBack() {
  return (
    <div
      className="card-playing w-20 sm:w-24 md:w-28 select-none"
      style={{
        background:
          "radial-gradient(ellipse at 50% 50%, oklch(0.20 0.07 145) 0%, oklch(0.13 0.04 145) 100%)",
        borderColor: "oklch(0.30 0.06 145)",
      }}
    >
      {/* Diamond pattern */}
      <div
        className="absolute inset-2 rounded opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, oklch(0.55 0.15 145) 0px, oklch(0.55 0.15 145) 1px, transparent 1px, transparent 8px), repeating-linear-gradient(-45deg, oklch(0.55 0.15 145) 0px, oklch(0.55 0.15 145) 1px, transparent 1px, transparent 8px)",
        }}
      />
      <span className="text-2xl" aria-hidden="true">
        🂠
      </span>
    </div>
  );
}

interface CardDisplayProps {
  hand: string;
  faceDown?: boolean;
  /** Размер карт: normal (по умолчанию) | large */
  size?: "normal" | "large";
}

export function CardDisplay({ hand, faceDown = false }: CardDisplayProps) {
  const cards = parseHand(hand);

  return (
    <div
      className="flex gap-2 sm:gap-3 items-center justify-center"
      aria-label={`Рука: ${hand}`}
    >
      {faceDown
        ? [0, 1].map((i) => <CardBack key={i} />)
        : cards.map((card) => (
            <PlayingCard key={`${card.rank}${card.suit}`} card={card} />
          ))}
    </div>
  );
}
