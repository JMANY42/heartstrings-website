import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

import { createStringField } from '@/lib/pluckedStrings'

// The hero's backdrop: seven strings drawn straight across the screen, pulled
// together where the wordmark sits and splaying out to either edge, so the name
// looks like the point every line is running out of.
//
// Nothing here is a loop of decoration. The strings are the simulation in
// `pluckedStrings` — pluck one and it really rings and really settles — and
// they are plucked from two places. A slow two-beat pattern keeps the field
// alive on its own, at a resting pulse, so the section is never still and never
// busy; and dragging the cursor across a string plucks it, at the point it was
// crossed and as hard as it was crossed.
//
// It is drawn on a canvas rather than as animated SVG paths: every path is a
// fresh shape on every frame, which is the case SVG is worst at — each one
// would be a new attribute string, parsed, and re-laid out by the browser.

/** The strings, top to bottom, as fractions of the section's height.
 *
 *  They are not evenly spaced, and the pitches are not a chord. Even spacing
 *  and simple ratios both read as a printed pattern rather than as something
 *  moving; uneven gaps and pitches that never quite line up mean the field
 *  keeps drifting through arrangements it has not been in before. Lower
 *  strings are slower, heavier, and swing further, as a thicker string does. */
const STRINGS = [
  { rest: 0.14, frequency: 1.31, ring: 4.4, weight: 1.0, reach: 0.028 },
  { rest: 0.245, frequency: 1.09, ring: 5.0, weight: 1.15, reach: 0.034 },
  { rest: 0.365, frequency: 0.93, ring: 5.6, weight: 1.35, reach: 0.04 },
  { rest: 0.5, frequency: 0.77, ring: 6.4, weight: 1.7, reach: 0.05 },
  { rest: 0.635, frequency: 0.64, ring: 6.9, weight: 1.4, reach: 0.044 },
  { rest: 0.755, frequency: 0.55, ring: 7.4, weight: 1.2, reach: 0.037 },
  { rest: 0.86, frequency: 0.47, ring: 8.0, weight: 1.0, reach: 0.03 },
]

/** Ends of the ramp the strings take their colour from, top to bottom: the
 *  palette's pink opening into a plum deep enough to hold against the cream. */
const TOP_COLOUR = [214, 130, 162]
const BOTTOM_COLOUR = [138, 62, 92]

/** How far towards the wordmark the strings are drawn in, and how much of the
 *  width they take to do it. A narrow pull looks like a knot; this is wide
 *  enough that the whole field leans in. */
const GATHER = 0.46
const GATHER_WIDTH = 0.34

/** Points along a string. Enough that the fourth mode — two full waves across
 *  the screen — is a curve rather than a set of corners. */
const SAMPLES = 160

/** The resting pulse the field is plucked on: a beat, its answer, and a pause.
 *  Seconds, and the strength of each. */
const BEAT = [
  { at: 0, strength: 1 },
  { at: 0.31, strength: 0.62 },
]
const PULSE = 3.6

/** The shortest gap between two plucks of the same string by the cursor. A
 *  string crosses back under a slow-moving cursor several times a second while
 *  it rings, and without this each crossing would add to the last until the
 *  string was swinging off the screen. */
const PLUCK_GAP = 0.1

type Props = {
  /** The block the strings gather behind, and are faded out under so the text
   *  on top of them stays readable. */
  focusRef: RefObject<HTMLElement | null>
}

function colourAt(position: number) {
  const channels = TOP_COLOUR.map((top, index) =>
    Math.round(top + (BOTTOM_COLOUR[index] - top) * position),
  )

  return channels.join(', ')
}

/** How far the wordmark pulls the strings in at `x`: all the way at its centre,
 *  falling away to nothing towards the edges. */
function gatherAt(x: number) {
  const offset = (x - 0.5) / GATHER_WIDTH

  return Math.exp(-offset * offset)
}

export function StringField({ focusRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) {
      return
    }

    const field = createStringField(STRINGS)
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // The section's size in CSS pixels, and where the wordmark sits inside it.
    // Both are measured on resize rather than per frame: the layout only moves
    // when the box does, and `getBoundingClientRect` on every frame would force
    // a layout in the middle of the draw.
    let width = 0
    let height = 0
    let focus = { x: 0.5, y: 0.5, radiusX: 0.22, radiusY: 0.12 }

    /** Rises on every beat and falls away between them. Drives the bloom, and
     *  through it the sense that the whole field is breathing. */
    let glow = 0
    let clock = 0
    let cursor: { x: number; y: number } | null = null
    const plucked = STRINGS.map(() => -Infinity)
    let frame = 0
    let last = 0
    let running = false

    /** Which string the next beat lands on. Walking through them in steps that
     *  do not divide into seven means the pattern never reads as top-to-bottom
     *  and takes a long time to come back to where it started. */
    let voice = 3

    const measure = () => {
      const box = canvas.getBoundingClientRect()

      width = box.width
      height = box.height

      if (width === 0 || height === 0) {
        return
      }

      const ratio = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)

      const target = focusRef.current?.getBoundingClientRect()

      if (target) {
        focus = {
          x: (target.left + target.width / 2 - box.left) / width,
          y: (target.top + target.height / 2 - box.top) / height,
          // Generous either side of the text — the strings should thin out as
          // they approach it, not stop at its edge.
          radiusX: target.width / 2 / width + 0.045,
          radiusY: target.height / 2 / height + 0.02,
        }
      }
    }

    /** Where a string lies at `x` before it is plucked: its rest line, pulled
     *  towards the wordmark. In fractions of the height, as everything here is,
     *  so the field keeps its shape at any size. */
    const restAt = (index: number, x: number) => {
      const { rest } = STRINGS[index]

      return rest + (focus.y - rest) * GATHER * gatherAt(x)
    }

    const heightAt = (index: number, x: number) =>
      restAt(index, x) + field.displacement(index, x) * STRINGS[index].reach

    const draw = () => {
      context.clearRect(0, 0, width, height)

      // A soft bloom under the wordmark, breathing on the same pulse as the
      // plucks. It is what keeps the middle of the screen from reading as an
      // empty gap once the strings have been faded out of it.
      const bloom = context.createRadialGradient(
        focus.x * width,
        focus.y * height,
        0,
        focus.x * width,
        focus.y * height,
        Math.max(width, height) * (0.3 + 0.02 * glow),
      )

      bloom.addColorStop(0, `rgba(255, 214, 228, ${0.34 + 0.1 * glow})`)
      bloom.addColorStop(0.55, 'rgba(255, 222, 233, 0.12)')
      bloom.addColorStop(1, 'rgba(255, 226, 236, 0)')
      context.fillStyle = bloom
      context.fillRect(0, 0, width, height)

      context.lineCap = 'round'
      context.lineJoin = 'round'

      STRINGS.forEach((string, index) => {
        // A ringing string is brighter and a shade heavier than a resting one,
        // which is what makes a pluck read as a pluck and not as a wobble.
        const ringing = Math.min(field.energy(index), 1)
        const colour = colourAt(index / (STRINGS.length - 1))
        const alpha = 0.46 + 0.4 * ringing
        const stroke = context.createLinearGradient(0, 0, width, 0)

        // Faded at the pins. The strings run the full width of the screen, and
        // an ink line stopping dead at the edge would draw the eye to the edge.
        stroke.addColorStop(0, `rgba(${colour}, 0)`)
        stroke.addColorStop(0.16, `rgba(${colour}, ${alpha})`)
        stroke.addColorStop(0.84, `rgba(${colour}, ${alpha})`)
        stroke.addColorStop(1, `rgba(${colour}, 0)`)

        context.strokeStyle = stroke
        context.lineWidth = string.weight * (1 + 0.55 * ringing)
        context.shadowColor = `rgba(${colour}, ${0.45 * ringing})`
        context.shadowBlur = 18 * ringing

        context.beginPath()

        for (let sample = 0; sample <= SAMPLES; sample += 1) {
          const x = sample / SAMPLES

          context.lineTo(x * width, heightAt(index, x) * height)
        }

        context.stroke()
      })

      context.shadowBlur = 0

      // Fade the strings out where the wordmark sits, rather than laying a
      // patch of background over them: the page behind is a gradient, so a
      // patch would show as a lighter block. Erasing through a radial gradient
      // leaves them thinning into the text from every side. The ellipse is
      // drawn as a scaled circle, since a gradient is only ever round.
      const radius = focus.radiusX * width

      context.save()
      context.globalCompositeOperation = 'destination-out'
      context.translate(focus.x * width, focus.y * height)
      context.scale(1, (focus.radiusY * height) / radius)

      const hole = context.createRadialGradient(0, 0, 0, 0, 0, radius)

      // Not quite opaque in the middle: a trace of every string still crosses
      // behind the name, so it sits in the field rather than on top of it.
      hole.addColorStop(0, 'rgba(0, 0, 0, 0.88)')
      hole.addColorStop(0.55, 'rgba(0, 0, 0, 0.66)')
      hole.addColorStop(1, 'rgba(0, 0, 0, 0)')
      context.fillStyle = hole
      context.beginPath()
      context.arc(0, 0, radius, 0, Math.PI * 2)
      context.fill()
      context.restore()
    }

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)

      const elapsed = Math.min((now - last) / 1000, 0.25)

      last = now

      const before = clock

      clock += elapsed

      // The two beats of the pulse, and the pause after them. Each lands on a
      // different string, and a little way along it — never dead centre, where
      // a pluck excites only the broadest mode and looks like a bounce.
      BEAT.forEach(({ at, strength }, index) => {
        // A beat is due when this frame steps over it. The pulse repeats, so
        // both this cycle's and the next one's are tested — a frame that lands
        // near the end of a cycle steps over the seam into the one after it.
        const cycle = Math.floor(before / PULSE)
        const due = [cycle * PULSE + at, (cycle + 1) * PULSE + at]

        if (!due.some((time) => time > before && time <= clock)) {
          return
        }

        voice = (voice + (index === 0 ? 3 : 2)) % STRINGS.length

        const along = 0.24 + 0.52 * ((Math.sin(clock * 1.7 + voice) + 1) / 2)

        field.pluck(voice, along, strength)
        glow = Math.max(glow, strength)
      })

      glow *= Math.exp(-elapsed * 1.9)

      field.advance(elapsed)
      draw()
    }

    const start = () => {
      if (running || still) {
        return
      }

      running = true
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }

    const stop = () => {
      running = false
      cancelAnimationFrame(frame)
    }

    // A string is plucked by being crossed, not by being approached: the cursor
    // has to pass from one side of it to the other, and how fast it was crossed
    // sets how hard the string rings. Plucking on proximity instead goes off
    // the moment the pointer enters the section and never feels aimed.
    //
    // The listener is on the window rather than the canvas so that the wordmark
    // and the button, which sit over the canvas, are not holes in the field —
    // and so the canvas itself can stay out of the way of clicks entirely.
    const onPointerMove = (event: PointerEvent) => {
      if (!running || event.pointerType !== 'mouse') {
        return
      }

      const box = canvas.getBoundingClientRect()
      const at = {
        x: (event.clientX - box.left) / width,
        y: (event.clientY - box.top) / height,
      }

      const from = cursor

      cursor = at

      if (!from || at.x < 0 || at.x > 1 || at.y < 0 || at.y > 1) {
        return
      }

      STRINGS.forEach((_, index) => {
        const was = from.y - heightAt(index, from.x)
        const is = at.y - heightAt(index, at.x)

        if (was < 0 === is < 0 || clock - plucked[index] < PLUCK_GAP) {
          return
        }

        const speed = Math.hypot(at.x - from.x, at.y - from.y)
        const strength = Math.min(0.3 + speed * 9, 1.15)

        plucked[index] = clock
        field.pluck(index, at.x, strength)
        glow = Math.max(glow, strength * 0.6)
      })
    }

    measure()

    if (still) {
      // Held still: one frame, with the strings caught part-way through a
      // pluck so they read as strings rather than as ruled lines.
      STRINGS.forEach((_, index) => field.pluck(index, 0.34 + index * 0.07, 0.5))
      field.advance(0.4)
      draw()
    } else {
      start()
    }

    const observer = new ResizeObserver(() => {
      measure()

      if (still) {
        draw()
      }
    })

    observer.observe(canvas)

    // The wordmark is measured too, not just the canvas. Web fonts land after
    // the first paint and the name changes width when they do, without the
    // section around it changing size at all — so the hole the strings fade
    // into would otherwise stay the shape of the fallback face.
    if (focusRef.current) {
      observer.observe(focusRef.current)
    }

    // Nothing to run while the hero is off screen. requestAnimationFrame
    // already stops in a background tab, but not when the reader has simply
    // scrolled past.
    const visibility = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 },
    )

    visibility.observe(canvas)
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    return () => {
      stop()
      observer.disconnect()
      visibility.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
    }
  }, [focusRef])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  )
}
