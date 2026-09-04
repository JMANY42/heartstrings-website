// Packs N circles around a title block in the middle, for the testimonial word
// cloud. The caller passes the aspect ratio of the box it has to sit in — the
// screen, in practice — and gets back the shape the packing settled into, plus
// positions and diameters as percentages of it. The caller scales that shape to
// fit the box, so the cloud can never run past an edge.
//
// The circles start on a phyllotaxis spiral — the sunflower-seed arrangement,
// which spaces points evenly without ever lining them up into rows — and are
// then relaxed apart until nothing touches. Relaxation is what makes the count
// dynamic: there is no table of slots to run out of. Add enough quotes and the
// circles simply become small.
//
// Size falls off with distance from the title. Because a circle's size depends
// on where it ended up and where it ends up depends on its size, the two are
// solved together: size by distance, relax, re-size, repeat.
//
// Circles are sized for the box they are going into: a wide box is packed as a
// wide ellipse, which is flatter, and a flatter cluster scales up further
// against a limited height. That is set by how far the spiral is stretched
// sideways before packing. There is no closed form for the shape that comes out
// of relaxation, so the stretch is found by bisection, coarsely at first and
// then packed once properly.
//
// Nothing is ever spread afterwards to make the shape exact. Circles stay where
// the packing left them, tight against their neighbours, and the caller takes
// up the difference by centring the cluster in the box.

export type CloudCircle = {
  /** Centre of the circle, as a percentage of the cloud's width and height. */
  left: number
  top: number
  /** Diameter, as a percentage of the cloud's width. */
  size: number
}

export type CloudLayout = {
  /** The shape the packing settled into: its width ÷ its height. The caller
   *  sizes the cloud to the largest box of this shape that fits, and centres
   *  it. */
  aspect: number
  /** Width of the title block, as a percentage of the cloud's width. It sits at
   *  the centre of the box, which is why the box is kept symmetric. */
  titleWidth: number
  circles: CloudCircle[]
}

// Working units: the largest circle has diameter 1, and the title block is a
// little over one and a half circles wide.
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
const SEED_ANGLE = 0.9 // rotates the whole spiral off the horizontal
const TITLE_HALF_W = 0.82
const TITLE_HALF_H = 0.3
const GAP = 0.05
const SPREAD = 1.18
const FALLOFF = 0.3 // the outermost circle is 70% of the innermost
const SHRINK = 0.998 // a light pull back to the centre, to keep it compact

const COARSE = { passes: 2, steps: 80 } // while searching for the stretch
const FINE = { passes: 6, steps: 240 } // once, for the layout that is used
const SEARCH_STEPS = 9
// The coarse search is packed too roughly to land on the shape asked for, and
// falling short of it costs circle size — a cluster taller than intended is
// scaled down to fit the height. So the properly packed result is nudged back
// toward the target a couple of times before it is accepted.
const CORRECTIONS = 2
const TOLERANCE = 0.03
const CORRECTION_DAMPING = 0.8
const MIN_STRETCH = 0.12
const MAX_STRETCH = 9
const MIN_ASPECT = 0.15
const MAX_ASPECT = 8

type Packing = {
  xs: number[]
  ys: number[]
  diameters: number[]
}

// Half the width and height of the smallest box centred on the title that holds
// everything. Keeping it symmetric is what puts the title in the middle of the
// screen with every circle, top and bottom, inside the box.
const extents = ({ xs, ys, diameters }: Packing) => {
  let halfW = TITLE_HALF_W
  let halfH = TITLE_HALF_H

  for (let i = 0; i < xs.length; i += 1) {
    const reach = diameters[i] / 2

    halfW = Math.max(halfW, Math.abs(xs[i]) + reach)
    halfH = Math.max(halfH, Math.abs(ys[i]) + reach)
  }

  return { halfW, halfH }
}

const ratio = (packing: Packing) => {
  const { halfW, halfH } = extents(packing)

  return halfW / halfH
}

const pack = (
  count: number,
  stretch: number,
  passes: number,
  steps: number,
): Packing => {
  const xs = new Array<number>(count)
  const ys = new Array<number>(count)
  const diameters = new Array<number>(count).fill(1)

  for (let i = 0; i < count; i += 1) {
    const angle = i * GOLDEN_ANGLE + SEED_ANGLE
    const radius = 1 + SPREAD * Math.sqrt((i + 0.6) / count)

    xs[i] = Math.cos(angle) * radius * stretch
    ys[i] = Math.sin(angle) * radius
  }

  for (let pass = 0; pass < passes; pass += 1) {
    const distances = xs.map((x, i) => Math.hypot(x, ys[i]))
    const near = Math.min(...distances)
    const span = Math.max(...distances) - near || 1

    for (let i = 0; i < count; i += 1) {
      diameters[i] = 1 - FALLOFF * ((distances[i] - near) / span)
    }

    for (let step = 0; step < steps; step += 1) {
      // Clear the title block, leaving by whichever edge is closer.
      for (let i = 0; i < count; i += 1) {
        const reach = diameters[i] / 2 + GAP
        const overlapX = TITLE_HALF_W + reach - Math.abs(xs[i])
        const overlapY = TITLE_HALF_H + reach - Math.abs(ys[i])

        if (overlapX > 0 && overlapY > 0) {
          if (overlapX < overlapY) {
            xs[i] += xs[i] < 0 ? -overlapX : overlapX
          } else {
            ys[i] += ys[i] < 0 ? -overlapY : overlapY
          }
        }
      }

      // Push overlapping circles apart, half the overlap each.
      for (let a = 0; a < count; a += 1) {
        for (let b = a + 1; b < count; b += 1) {
          const dx = xs[b] - xs[a]
          const dy = ys[b] - ys[a]
          const apart = Math.hypot(dx, dy) || 1e-6
          const wanted = (diameters[a] + diameters[b]) / 2 + GAP

          if (apart < wanted) {
            const push = (wanted - apart) / 2
            const ux = (dx / apart) * push
            const uy = (dy / apart) * push

            xs[a] -= ux
            ys[a] -= uy
            xs[b] += ux
            ys[b] += uy
          }
        }
      }

      for (let i = 0; i < count; i += 1) {
        xs[i] *= SHRINK
        ys[i] *= SHRINK
      }
    }
  }

  return { xs, ys, diameters }
}

export function layoutCircleCloud(
  count: number,
  targetAspect: number,
): CloudLayout {
  if (count <= 0) {
    return { aspect: 1, titleWidth: 100, circles: [] }
  }

  const target = Math.min(Math.max(targetAspect, MIN_ASPECT), MAX_ASPECT)

  // Bisect the stretch geometrically: it is a multiplier, so the halfway point
  // between 0.5 and 8 is 2, not 4.25.
  let low = MIN_STRETCH
  let high = MAX_STRETCH

  for (let step = 0; step < SEARCH_STEPS; step += 1) {
    const stretch = Math.sqrt(low * high)
    if (ratio(pack(count, stretch, COARSE.passes, COARSE.steps)) < target) {
      low = stretch
    } else {
      high = stretch
    }
  }

  let stretch = Math.sqrt(low * high)
  let packing = pack(count, stretch, FINE.passes, FINE.steps)
  let aspect = ratio(packing)

  for (let step = 0; step < CORRECTIONS; step += 1) {
    if (Math.abs(aspect - target) / target <= TOLERANCE) {
      break
    }

    stretch *= (target / aspect) ** CORRECTION_DAMPING

    const candidate = pack(count, stretch, FINE.passes, FINE.steps)
    const candidateAspect = ratio(candidate)

    if (Math.abs(candidateAspect - target) >= Math.abs(aspect - target)) {
      break
    }

    packing = candidate
    aspect = candidateAspect
  }

  const { halfW, halfH } = extents(packing)
  const width = halfW * 2
  const height = halfH * 2

  return {
    aspect: width / height,
    titleWidth: ((TITLE_HALF_W * 2) / width) * 100,
    circles: packing.xs.map((x, i) => ({
      left: ((x + halfW) / width) * 100,
      top: ((packing.ys[i] + halfH) / height) * 100,
      size: (packing.diameters[i] / width) * 100,
    })),
  }
}

// How large the text can be set and still fill its circle. A circle of
// diameter d holds a square of side d/√2, so the type has to be sized against
// the text's area rather than its width: roughly `chars × 0.5em × 1.3em` for
// the sans face, which makes the largest workable size proportional to
// d ÷ √chars. The constants are the two faces' average glyph widths, folded in.
//
// The answer is a percentage of the circle's own width, so it is written in
// `cqw` and the circle sizes its own text.
const FILL = { display: 0.78, sans: 0.68 } as const

export const fitTextToCircle = (
  characters: number,
  face: keyof typeof FILL,
) => (FILL[face] * 100) / Math.sqrt(Math.max(characters, 1))
