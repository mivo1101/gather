/**
 * Flickr-style justified rows.
 *
 * Every row is stretched to fill the container exactly, so rows never leave a
 * ragged gap at the end. Cards keep their true aspect ratio; the row height is
 * what flexes, which means a row of landscape cards sits short and wide while a
 * row of portrait cards sits tall and narrow.
 *
 * Aspect ratios come from the template shape, so no image has to load first and
 * the layout never reflows after paint.
 */

export interface JustifiedRow {
  /** Row height in px. Card width is `height * aspect`. */
  height: number;
  /** Indexes into the aspect array, in order. */
  items: number[];
  /** True for a final row that was left at target height instead of stretched. */
  partial: boolean;
}

interface JustifiedOptions {
  /** Available content width in px. */
  width: number;
  /** Horizontal and vertical gap between cards in px. */
  gap: number;
  /** Preferred row height. Rows land near this, above or below. */
  targetHeight: number;
}

/** How much taller than target a final row may stretch to fill the width. */
const LAST_ROW_STRETCH_LIMIT = 1.35;

/** Height that makes `sumAspect` cards with `count - 1` gaps fill `width`. */
function rowHeight(width: number, gap: number, count: number, sumAspect: number) {
  return (width - (count - 1) * gap) / sumAspect;
}

export function buildJustifiedRows(
  aspects: number[],
  { width, gap, targetHeight }: JustifiedOptions,
): JustifiedRow[] {
  if (width <= 0 || aspects.length === 0) return [];

  const rows: JustifiedRow[] = [];
  let items: number[] = [];
  let sumAspect = 0;

  for (let index = 0; index < aspects.length; index += 1) {
    const aspect = aspects[index];
    const heightBefore = items.length
      ? rowHeight(width, gap, items.length, sumAspect)
      : Infinity;

    items.push(index);
    sumAspect += aspect;
    const heightAfter = rowHeight(width, gap, items.length, sumAspect);

    if (heightAfter > targetHeight) continue;

    // Adding this card overshot the target. Keep whichever row lands closer to
    // it, so one very wide card can't drag a row down to a thin strip.
    const closerWithout =
      items.length > 1 &&
      heightBefore - targetHeight < targetHeight - heightAfter;

    if (closerWithout) {
      const carried = items.pop() as number;
      rows.push({ height: heightBefore, items, partial: false });
      items = [carried];
      sumAspect = aspect;
    } else {
      rows.push({ height: heightAfter, items, partial: false });
      items = [];
      sumAspect = 0;
    }
  }

  // Leftovers stretch too, as long as that keeps them close to the rows above.
  // A lone portrait card would otherwise balloon to several times their height,
  // so past that limit the last row stays at target height and aligns left.
  if (items.length) {
    const natural = rowHeight(width, gap, items.length, sumAspect);
    const stretches = natural <= targetHeight * LAST_ROW_STRETCH_LIMIT;
    rows.push({
      height: stretches ? natural : targetHeight,
      items,
      partial: !stretches,
    });
  }

  return rows;
}

/** Row height the grid aims for at a given container width. */
export function targetRowHeight(width: number): number {
  if (width < 520) return 250;
  if (width < 900) return 265;
  return 290;
}
