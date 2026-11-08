import type { ProductOption, ProductVariant } from '@banovit/api-client';

/** option key -> selected value (null = nothing chosen yet). */
export type Selection = Record<string, string | null>;

function fits(v: ProductVariant, sel: Selection, skip?: string): boolean {
  return Object.entries(sel).every(([k, val]) => k === skip || val === null || v.attributes[k] == null || v.attributes[k] === val);
}

function cheapest(list: ProductVariant[]): ProductVariant | undefined {
  return [...list].sort((a, b) => (a.price?.amount ?? Infinity) - (b.price?.amount ?? Infinity))[0];
}

/** Fill unset/any keys of a selection from a concrete variant. */
function fromVariant(options: ProductOption[], v: ProductVariant, base: Selection = {}): Selection {
  const out: Selection = {};
  for (const o of options) out[o.key] = v.attributes[o.key] ?? base[o.key] ?? o.values[0]?.value ?? null;
  return out;
}

/**
 * Starting selection: WordPress-style ?attribute_pa_color=white params win
 * (old links and ads keep working), then the cheapest in-stock variant, so the
 * price shown on load is a real purchasable price.
 */
export function initialSelection(
  options: ProductOption[],
  variants: ProductVariant[],
  params: Record<string, string | string[] | undefined> = {},
): Selection {
  const fromUrl: Selection = {};
  for (const o of options) {
    const raw = params[`attribute_${o.key}`];
    const value = Array.isArray(raw) ? raw[0] : raw;
    const decoded = value ? safeDecode(value) : null;
    fromUrl[o.key] = o.values.find((x) => x.value === decoded || x.label === decoded)?.value ?? null;
  }
  const candidates = variants.filter((v) => fits(v, fromUrl));
  const pick = cheapest(candidates.filter((v) => v.in_stock)) ?? cheapest(candidates) ?? cheapest(variants);
  if (!pick) return fromUrl;
  return fromVariant(options, pick, fromUrl);
}

/** The variant matching a complete selection, if any. */
export function matchVariant(options: ProductOption[], variants: ProductVariant[], sel: Selection): ProductVariant | null {
  if (options.some((o) => !sel[o.key])) return null;
  const matches = variants.filter((v) => fits(v, sel));
  // A specific variant beats an "any" variant.
  return (
    matches.sort(
      (a, b) =>
        Object.values(b.attributes).filter((x) => x != null).length - Object.values(a.attributes).filter((x) => x != null).length,
    )[0] ?? null
  );
}

export type ValueState = 'available' | 'out_of_stock' | 'unavailable';

/** Whether choosing `value` for `key` (keeping the other choices) leads to a buyable variant. */
export function valueState(variants: ProductVariant[], sel: Selection, key: string, value: string): ValueState {
  const next = { ...sel, [key]: value };
  const compatible = variants.filter((v) => fits(v, next));
  if (compatible.some((v) => v.in_stock)) return 'available';
  if (compatible.length) return 'out_of_stock';
  return variants.some((v) => v.attributes[key] == null || v.attributes[key] === value) ? 'out_of_stock' : 'unavailable';
}

/**
 * Choose a value. If the other choices no longer form a variant, they jump to
 * the best variant that has this value (in stock first), instead of leaving
 * the shopper on a dead combination.
 */
export function choose(options: ProductOption[], variants: ProductVariant[], sel: Selection, key: string, value: string): Selection {
  const next = { ...sel, [key]: value };
  if (matchVariant(options, variants, next)) return next;
  const withValue = variants.filter((v) => v.attributes[key] == null || v.attributes[key] === value);
  // Prefer variants that keep as many of the other choices as possible.
  const score = (v: ProductVariant) => options.filter((o) => o.key !== key && next[o.key] && v.attributes[o.key] === next[o.key]).length;
  const best = [...withValue].sort((a, b) => Number(b.in_stock) - Number(a.in_stock) || score(b) - score(a) || (a.price?.amount ?? Infinity) - (b.price?.amount ?? Infinity))[0];
  return best ? { ...fromVariant(options, best, next), [key]: value } : next;
}

/** ?attribute_pa_color=white query for the current selection (shareable link, not canonical). */
export function selectionQuery(sel: Selection): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sel)) if (v) qs.set(`attribute_${k}`, v);
  const s = qs.toString();
  return s ? `?${s}` : '';
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}
