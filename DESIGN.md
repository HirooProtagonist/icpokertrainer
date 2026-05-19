# Design Brief

## Direction

ICPokerTrainer — a dark, refined GTO training platform that mirrors the aesthetic of a professional poker table with deep felt backgrounds, classic playing cards, and minimal, elegant UI.

## Tone

Luxury gaming meets education: professional, sophisticated, no-nonsense. Every element serves learning without distraction.

## Differentiation

Classic playing cards (white bg, red/black suits) paired with a deep poker-table palette and amber accents create an unmistakably poker aesthetic that educates rather than gamifies.

## Color Palette

| Token      | OKLCH       | Role                              |
|------------|-------------|-----------------------------------|
| background | 0.11 0 0    | Deep poker-table felt (dark mode) |
| foreground | 0.94 0 0    | High-contrast text on dark felt   |
| card       | 0.14 0.01   | Playing card surface (slight depth) |
| primary    | 0.62 0.19 265 | Blue (call action)              |
| secondary  | 0.72 0.14 55  | Amber/gold (accents, highlights)  |
| accent     | 0.72 0.16 55  | Gold for active states            |
| destructive| 0.62 0.26 15  | Red (fold action)                 |
| muted      | 0.22 0.01    | Deep borders & dividers           |

## Typography

- Display: Space Grotesk — headings, score displays, action labels (modern, geometric, gaming-forward)
- Body: Satoshi — descriptive text, help copy, subtle UI labels (refined, readable, elegant)
- Mono: JetBrains Mono — equity percentages, technical data in tooltips
- Scale: hero `text-4xl font-bold`, h2 `text-2xl font-semibold`, label `text-sm font-semibold uppercase tracking-widest`, body `text-base`

## Elevation & Depth

Soft shadows and layered backgrounds create depth without gloss. Buttons mimic poker chips (subtle lift on hover, subtle press on click). Cards float with gentle shadow. Felt texture from background gradient.

## Structural Zones

| Zone    | Background           | Border        | Notes                                   |
|---------|----------------------|---------------|-----------------------------------------|
| Header  | felt gradient        | subtle line   | App title, session info                 |
| Content | felt with card zones | felt-colored  | Main trainer area (centered, breathing) |
| Footer  | felt gradient        | felt-colored  | History, stats, feedback area           |

## Spacing & Rhythm

Large breathing room around focal content (playing card, range matrix). 1rem gaps between major sections. Tight micro-spacing (0.25rem) inside cells and components.

## Component Patterns

- Buttons: Rounded-xl (poker chip feel), soft shadows, amber/gold on hover, scale-95 on active
- Cards: White bg, subtle shadow, clean borders. Playing cards use display font for rank/suit.
- Range matrix: 13×13 grid, green/blue/red cells, tooltip on hover with hand + frequencies
- Badges: Uppercase, monospace, small font, dark bg with light text

## Motion

- Entrance: Fade in + subtle scale-up over 300ms (cards, matrix, feedback)
- Hover: Button lift (shadow-md → shadow-lg), scale-110 on range cells, 150ms duration
- Decorative: None (no animations for animations' sake; all motion is functional)

## Constraints

- No neon or bright primary colors; all accents are warm (amber/gold) or cool (deep blue)
- Cards are always white background with black text + red/black suit symbols
- Buttons are soft-cornered chips, never rectangular or flat
- Dark mode only; no light theme
- Fonts from bundled skill only (Space Grotesk, Satoshi, JetBrains Mono)

## Signature Detail

Playing cards rendered as white rectangles with realistic rank/suit typography create instant poker recognition while maintaining minimalist UI discipline. This single choice anchors the entire visual identity.
