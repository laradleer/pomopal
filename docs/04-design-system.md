# PomoPal — Design System

A gamified, playful UI that combines **Brilliant** and **LikeLingo**.
The one rule: **calm canvas, loud rewards.**

## Where each idea comes from

- **Brilliant:** white and warm-grey background, outlined cards with no shadows, stat chips in the top bar, a mascot that gives hints in a speech bubble, clean charts.
- **LikeLingo:** bold rounded headings, chunky buttons with a darker bottom edge, uppercase button labels, reward stickers (coins, badges), one loud brand colour.
- **ToyCAD:** bento card layout on the home screen and a floating pill tab bar.

## Principles

1. **Calm canvas, loud rewards.** Screens are mostly white with lots of space. Colour and motion are saved for finishing a session, earning coins and leveling up.
2. **Pressable things look pressable.** Main buttons have a 4px darker bottom edge that sinks when you press them.
3. **The pet is the guide.** Hints and encouragement come from the pet in a speech bubble, not from system banners.
4. **One colour = one meaning.** Each mode and reward always uses the same colour.

## Colour meaning

| Meaning | Token | Used for |
| --- | --- | --- |
| Brand, focus mode | `tomato` | Start Focus button, focus timer ring, logo |
| Short break, success | `leaf` | Break ring, "Session complete", checkmarks |
| Long break, info | `sky` | Long-break ring, pet speech bubble |
| XP and level | `grape` | XP bar, LEVEL labels, level-up screen |
| Coins and streak | `sun` | Coin icon, streak flame, price tags |
| Error, quit | `berry` | Quit session, delete. Small and rare. |

## Colour tokens

| Token | Light | Dark | Usage |
| --- | --- | --- | --- |
| `canvas` | `#ffffff` | `#121110` | Page background |
| `canvas-warm` | `#f4f2ef` | `#191715` | Alternate sections, onboarding |
| `surface` | `#ffffff` | `#1e1c1a` | Cards, sheets |
| `surface-sunken` | `#f7f5f2` | `#171513` | Empty progress track, inputs |
| `border` | `#e7e3de` | `#34302c` | Card and chip outlines |
| `border-strong` | `#d4cec7` | `#4a4540` | Outline button edge |
| `ink` | `#16130f` | `#f5f1ec` | Main text |
| `ink-muted` | `#6b655e` | `#a8a097` | Secondary text |
| `ink-button` | `#2b2825` | `#f5f1ec` | Dark "Start" pill button |
| `ink-button-edge` | `#0d0b09` | `#bdb5ab` | Its bottom edge |
| `on-ink-button` | `#ffffff` | `#16130f` | Text on the dark button |
| `tomato` | `#c93a24` | `#ff7a5c` | Brand, focus |
| `tomato-edge` | `#8f2414` | `#c4472d` | Button edge |
| `tomato-tint` | `#fdebe7` | `#3a1f19` | Focus backgrounds |
| `leaf` | `#267d18` | `#5fd04a` | Break, success |
| `leaf-edge` | `#174f0e` | `#3e9a2c` | Button edge |
| `leaf-tint` | `#e8f6e3` | `#1b2e17` | Break backgrounds |
| `grape` | `#6d3ef0` | `#a98bff` | XP, levels |
| `grape-edge` | `#4a22b8` | `#7a5bd6` | Button edge |
| `grape-tint` | `#efe9ff` | `#261d42` | Level card |
| `sky` | `#1c6cc8` | `#5fa8ff` | Long break, info |
| `sky-tint` | `#e6f1fd` | `#16263d` | Pet speech bubble |
| `sun` | `#ffc83d` | `#ffc83d` | Coins, streak (text on it is always dark) |
| `sun-edge` | `#d99a00` | `#d99a00` | Coin rim |
| `sun-ink` | `#7a5a00` | `#ffd76b` | Coin amounts as text |
| `sun-tint` | `#fff4d6` | `#33290f` | Coin chip, price tags |
| `berry` | `#c2185b` | `#ff6b9a` | Errors, destructive actions |
| `on-brand` | `#ffffff` | `#16130f` | Text on tomato, leaf, grape, sky |
| `focus-ring` | `#1c6cc8` | `#5fa8ff` | Keyboard focus outline |

Every text colour passes a 4.5:1 contrast ratio in both themes.

## Typography

- **Rubik** — headings, the timer, button labels, celebrating numbers.
- **Nunito** — all body text.
- Load from Google Fonts: `Nunito:wght@500;600;700;800` and `Rubik:wght@600;700;800`.

| Style | Font | Size / line height | Weight | Use |
| --- | --- | --- | --- | --- |
| `display-xl` | Rubik | 44 / 48 | 800 | Hero, level-up screen |
| `timer` | Rubik | 72 / 72 | 700 | Countdown (tabular numbers) |
| `title` | Rubik | 28 / 34 | 800 | Screen titles, pet greeting |
| `heading` | Rubik | 20 / 26 | 700 | Card titles |
| `label` | Rubik | 14 / 16 | 700, UPPERCASE, 0.06em | Button labels, tags |
| `body-lg` | Nunito | 18 / 28 | 600 | Onboarding text |
| `body` | Nunito | 16 / 24 | 500 | Default text |
| `body-sm` | Nunito | 14 / 20 | 500 | Captions, helper text |
| `stat` | Nunito | 18 / 22 | 800 | Numbers in chips |

## Spacing, radius, shadow

| Spacing | Value | Use |
| --- | --- | --- |
| `space-1` | 4px | Icon-to-number gap |
| `space-2` | 8px | Gap between chips |
| `space-3` | 12px | Button padding, list gap |
| `space-4` | 16px | Phone side margin |
| `space-6` | 24px | Card padding, bento gap |
| `space-8` | 32px | Between sections |
| `space-12` | 48px | Around the pet and greeting |

| Radius | Value | Use |
| --- | --- | --- |
| `radius-sm` | 10px | Inputs, tags |
| `radius-md` | 16px | Buttons, shop tiles |
| `radius-lg` | 24px | Cards |
| `radius-xl` | 32px | Bottom sheets, pet stage |
| `radius-pill` | 999px | Chips, progress bars, tab bar |

- **Shadow:** only for floating things (tab bar, toasts, speech bubble): `0 8px 24px rgba(22,19,15,0.10)`. Cards never get a shadow.
- **Borders:** 1.5px. **Button edge:** 4px, sinks to 0 when pressed.

## Components

| Component | Description |
| --- | --- |
| **Button** | Chunky with a darker bottom edge. Primary (tomato), leaf, grape, outline, and a dark ink pill for calm actions. One primary per screen. |
| **StatChip** | Pills in the top bar: streak → level → coins. Pops when the value changes. |
| **Card** | Outlined bento tile, 24px corners. Tinted versions for focus, break and level. Never nested. |
| **ProgressBar** | 12px pill. Grape for XP, leaf for goals, tomato for session. Always with a text label. |
| **ModeTabs** | Focus · Short break · Long break. Disabled while a session runs. |
| **TimerRing** | 14px ring. Tomato, leaf or sky by mode. Big Rubik numbers in the middle. |
| **PetBubble** | Sky-tint speech bubble with a tail pointing to the pet. One or two short sentences. |
| **ShopItem** | Tile with item art. States: for sale (price tag), owned (green outline), locked ("Unlocks at Lv 10"). |
| **TabBar** | Floating pill at the bottom: Timer · Tasks · Pet · Shop · Stats. |
| **RewardToast** | "+10 coins · +25 XP" with a coin sticker. Pops in, stays 3 seconds. |

## Layout

- **Mobile-first.** 16px side margins. Max 480px wide on phones, 2-column bento up to 960px on desktop.
- **Top bar:** logo on the left; streak, level and coin chips on the right.
- **Home:** pet and greeting at the top, timer card, today's tasks.
- **Bottom:** floating tab bar. Add bottom padding so content isn't hidden behind it.

## Motion

- Button press: 80ms sink.
- Reward pop: 360ms with a small overshoot.
- XP bar fill: 400ms ease-out.
- After a session, coins fly to the coin chip and the pet does a happy animation.
- Respect `prefers-reduced-motion`: no pops or flying, values just update.

## Icons and illustrations

- **Icons:** Lucide (rounded, 2px stroke), 20–24px.
- **Pets:** a cat and a dog in the same flat, rounded cartoon style (or matching 3D models).
- **Accessories:** separate layers on a head or neck anchor, so every item fits both pets.
- **Reward stickers:** coins, trophy, flame, badges with a darker rim, like LikeLingo.

## Voice

Short, warm and a little playful — the pet is talking.

- "Nice! +10 coins."
- "Ready for another round?"
- "Oops, Mochi got sleepy. Want to try again?"

Never make the user feel guilty for quitting.

## Tailwind starter

```ts
// tailwind.config.ts — colours read CSS variables so dark mode works
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--canvas)', surface: 'var(--surface)', border: 'var(--border)',
        ink: { DEFAULT: 'var(--ink)', muted: 'var(--ink-muted)' },
        tomato: { DEFAULT: 'var(--tomato)', edge: 'var(--tomato-edge)', tint: 'var(--tomato-tint)' },
        leaf: { DEFAULT: 'var(--leaf)', edge: 'var(--leaf-edge)', tint: 'var(--leaf-tint)' },
        grape: { DEFAULT: 'var(--grape)', edge: 'var(--grape-edge)', tint: 'var(--grape-tint)' },
        sky: { DEFAULT: 'var(--sky)', tint: 'var(--sky-tint)' },
        sun: { DEFAULT: 'var(--sun)', edge: 'var(--sun-edge)', ink: 'var(--sun-ink)', tint: 'var(--sun-tint)' },
        berry: 'var(--berry)', 'on-brand': 'var(--on-brand)',
      },
      fontFamily: { display: ['Rubik', 'system-ui', 'sans-serif'], body: ['Nunito', 'system-ui', 'sans-serif'] },
      borderRadius: { sm: '10px', md: '16px', lg: '24px', xl: '32px' },
      boxShadow: { float: '0 8px 24px rgba(22,19,15,0.10)' },
    },
  },
}
```
