# Part 1 - UI Animation

My take on https://nft.fluffyhugs.io/ with my own concept and assets (the brief
allows that): one day at a fitness studio. The page is 5 full-screen scenes and the
scroll position works like a clock. One SVG character does whatever class is on at
that hour, and scrolling morphs him from one exercise to the next.

## Run

```bash
pnpm install
pnpm dev
```

## What to look at

- the splash screen waits for the real images and fonts, not a timer. The checkbox
  at the top right replays it.
- scroll: character morph, camera move, backdrop follows the daylight, the totals in
  the corner count up. One wheel flick = one page, but it's still a real scroll
  underneath so keyboard, scrollbar and screen readers keep working.
- hover states on everything clickable. No routing, the buttons go nowhere (per the
  brief).
- resize: layout swaps at 1024 and 640.
- prefers-reduced-motion gets a static version, no slider, no smooth scroll.

## How it works

The character is a small 2d rig (`lib/rig.ts`). A pose is about 14 joint angles, so
two poses can be lerped, and that is basically the whole trick. Each exercise is a
little loop on top of one pose (`lib/poses.ts`).

A single GSAP ticker writes SVG attributes and transforms directly. React renders
the page once and never re-renders during animation. Only transform and opacity are
animated.

Libraries: GSAP + ScrollTrigger for the scrub, Lenis for the smooth scroll (both
suggested in the brief), Tailwind v4 with the shared values as tokens in `@theme`,
lucide-react for icons. No UI kit.

## Notes

- I built 5 scenes instead of the required 3. Same stage either way, the extra two
  are mostly copy.
- Deployed on Vercel, root directory `part1-animation`.
