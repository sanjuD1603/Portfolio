/**
 * Shared surface for clickable cards: a hairline border on a translucent card colour that
 * lifts 2px on hover, with a cursor-following highlight (`.spotlight`, driven by
 * `PointerEffects`) and a brand-tinted border. Pair with `group` children
 * (e.g. `group-hover:text-primary`). Hover motion is a CSS transition (cheap, and works
 * without JS); GSAP handles entrances.
 */
export const cardSurface =
  "spotlight group relative rounded-2xl border border-border bg-card/80 transition-[background-color,border-color,translate,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-2/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0";
