import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

import { createStringField } from '@/lib/pluckedStrings'
import type { StringField as Field } from '@/lib/pluckedStrings'
import { dealPlucks } from '@/lib/pluckOrder'
import { createStringAudio } from '@/lib/stringAudio'
import type { StringAudio } from '@/lib/stringAudio'

// The hero's backdrop: six strings drawn straight across the screen, pulled
// together where the wordmark sits and splaying out to either edge, so the name
// looks like the point every line is running out of.
//
// It is a guitar. The strings are tuned E A D G B E from the bottom up, they
// thicken as they descend the way a real set does, and each one both moves and
// sounds at its own pitch — the same six notes, in the same order, whether you
// are looking at it or listening to it.
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

/** The set, top to bottom: standard tuning read the way a player says it, from
 *  the thin E down to the thick one.
 *
 *  `rest` is where the string lies, as a fraction of the section's height, and
 *  they are evenly spaced as a guitar's are. `pitch` is the note in Hz, and it
 *  does double duty — it is what the string sounds, and, divided down, the rate
 *  at which it is drawn moving. `ring` is how long a pluck stays visible and
 *  `sustain` how long it stays audible; the two differ because the eye gives up
 *  on a swing long after the ear has stopped hearing the note. `weight` and
 *  `reach` are the gauge: lower strings are drawn thicker and swing further,
 *  because thicker strings are and do. */
const STRINGS = [
  { note: 'E4', pitch: 329.63, rest: 0.14, ring: 4.6, sustain: 1.6, weight: 0.9, reach: 0.026 },
  { note: 'B3', pitch: 246.94, rest: 0.284, ring: 5.2, sustain: 1.8, weight: 1.1, reach: 0.031 },
  { note: 'G3', pitch: 196.0, rest: 0.428, ring: 5.8, sustain: 2.0, weight: 1.35, reach: 0.036 },
  { note: 'D3', pitch: 146.83, rest: 0.572, ring: 6.5, sustain: 2.2, weight: 1.7, reach: 0.041 },
  { note: 'A2', pitch: 110.0, rest: 0.716, ring: 7.2, sustain: 2.45, weight: 2.1, reach: 0.046 },
  { note: 'E2', pitch: 82.41, rest: 0.86, ring: 8.0, sustain: 2.7, weight: 2.6, reach: 0.052 },
]

/** What the pitches are divided by to get the rate the strings are drawn
 *  swinging at. A guitar's lowest string moves eighty-two times a second, which
 *  at any size on a screen is a blur; slowed by this it swings a little under
 *  once a second, and the high E four times as often, exactly as they really
 *  stand to one another. The field is in tune with itself, just far below
 *  hearing. */
const VISIBLE_SLOWDOWN = 196

/** Ends of the ramp the strings take their colour from, top to bottom: the
 *  palette's pink opening into a plum deep enough to hold against the cream.
 *
 *  The pink end is deeper than it looks like it should be. The top strings are
 *  the thin ones, so they are already the faintest thing on the screen by their
 *  gauge alone; giving them the palest colour as well left them invisible. */
const TOP_COLOUR = [198, 112, 146]
const BOTTOM_COLOUR = [138, 62, 92]

/** How far towards the wordmark the strings are drawn in, and how much of the
 *  width they take to do it. A narrow pull looks like a knot; this is wide
 *  enough that the whole field leans in. */
const GATHER = 0.46
const GATHER_WIDTH = 0.34

/** Points along a string. Enough that the fourth mode — two full waves across
 *  the screen — is a curve rather than a set of corners. */
const SAMPLES = 160

/** The resting pulse the field plays itself on: a beat, its answer, and a
 *  pause. `level` is how loud it is once the strings have been given a voice —
 *  well under a plucked one, because this goes on for as long as the hero is on
 *  screen. */
const BEAT = [
  { at: 0, strength: 1, level: 0.34 },
  { at: 0.31, strength: 0.62, level: 0.22 },
]
const PULSE = 3.6

/** How long after the reader's last pluck the strings start playing themselves
 *  again. Long enough that a pause in the middle of strumming is not stepped
 *  on, short enough that a hero left alone comes back to life. */
const IDLE = 3.2

/** The shortest gap between two plucks of the same string by the cursor. A
 *  string crosses back under a slow-moving cursor several times a second while
 *  it rings, and without this each crossing would add to the last until the
 *  string was swinging off the screen. */
const PLUCK_GAP = 0.1

/** How loud a string the cursor has caught is. */
const CURSOR_LEVEL = 0.85

/** The strum played when the strings are given their voice: bottom string
 *  first, upwards, this many seconds apart. It is both an answer to the click
 *  and the plainest way to say what has just been switched on. */
const STRUM_GAP = 0.075

type Props = {
  /** The block the strings gather behind, and are faded out under so the text
   *  on top of them stays readable. */
  focusRef: RefObject<HTMLElement | null>
  /** Whether the strings may be heard as well as seen. */
  sound: boolean
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

export function StringField({ focusRef, sound }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // The strings themselves outlive both effects below: the drawing loop reads
  // them every frame, and the strum that greets a reader who turns the sound on
  // plucks them from outside it.
  const fieldRef = useRef<Field | null>(null)

  if (fieldRef.current == null) {
    fieldRef.current = createStringField(
      STRINGS.map(({ pitch, ring }) => ({
        frequency: pitch / VISIBLE_SLOWDOWN,
        ring,
      })),
    )
  }

  const audioRef = useRef<StringAudio | null>(null)

  // Wall-clock time until which the field should keep out of the way, for the
  // benefit of anything outside the drawing loop that is playing the strings
  // itself. The loop keeps its own clock, which only advances while it is
  // running, so this is in `performance.now()` terms and converted on arrival.
  const hushRef = useRef(0)

  // Built and thrown away with the reader's answer rather than kept around
  // muted. An AudioContext is a real device: leaving one open holds the audio
  // hardware awake, and on a phone that shows up as a battery cost for a page
  // that is not making a sound.
  useEffect(() => {
    if (!sound) {
      return
    }

    // Reached from a click, which is the only moment a browser will let an
    // AudioContext start.
    const audio = createStringAudio(STRINGS)

    audioRef.current = audio

    // The strum is the instrument being played, so the pulse holds off through
    // it and for the usual idle afterwards — otherwise a resting beat lands in
    // the middle of the strum about one time in four.
    hushRef.current =
      performance.now() + (STRINGS.length * STRUM_GAP + IDLE) * 1000

    const field = fieldRef.current
    const strum = STRINGS.map((_, offset) =>
      window.setTimeout(
        () => {
          const index = STRINGS.length - 1 - offset

          field?.pluck(index, 0.3, 0.62)
          audio?.pluck(index, 0.72)
        },
        offset * STRUM_GAP * 1000,
      ),
    )

    return () => {
      strum.forEach(window.clearTimeout)
      audio?.close()
      audioRef.current = null
    }
  }, [sound])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    const field = fieldRef.current

    if (!canvas || !context || !field) {
      return
    }

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

    /** The twelve being dealt out, and how far through it we are. */
    let bag = dealPlucks(STRINGS.length, BEAT.length)
    let dealt = 0

    /** Beats are numbered straight through — beat n is the (n % 2)th of pulse
     *  floor(n / 2) — so the pairs the bag is dealt in cannot drift out of step
     *  with the pulse they are played on. `origin` is when beat zero fell, and
     *  moving it moves everything still to come. */
    let origin = 0.6
    let next = 0

    /** When the strings may start playing themselves again: pushed out ahead of
     *  the clock every time the reader plucks one. */
    let quiet = 0
    let frame = 0
    let last = 0
    let running = false

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

    /** When a numbered beat falls: which pulse it belongs to, plus where it sits
     *  inside that pulse. */
    const beatAt = (index: number) =>
      origin +
      Math.floor(index / BEAT.length) * PULSE +
      BEAT[index % BEAT.length].at

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

      clock += elapsed

      // Anything outside the loop that is playing the strings — the opening
      // strum — asks for quiet on the wall clock, which only means something
      // here once it is put in the loop's own terms.
      if (hushRef.current > now) {
        quiet = Math.max(quiet, clock + (hushRef.current - now) / 1000)
      }

      // Hold the strings off while the reader is playing them. Rather than
      // dropping the beats that fall inside that window, the whole schedule is
      // slid forward by however much it overlaps — so nothing is lost, the pair
      // that was interrupted resumes as a pair, and the twelve still deals out
      // every string exactly twice. The first beat back lands `IDLE` after the
      // reader's last pluck, wherever in the bag it had got to.
      if (beatAt(next) < quiet) {
        origin += quiet - beatAt(next)
      }

      // Every beat this frame has stepped over, in order. More than one only
      // ever comes up after a stall, and playing them in order is what keeps
      // the pairs aligned with the bag.
      while (clock >= beatAt(next)) {
        const { strength, level } = BEAT[next % BEAT.length]

        if (dealt >= bag.length) {
          bag = dealPlucks(STRINGS.length, BEAT.length)
          dealt = 0
        }

        const string = bag[dealt]
        // Never dead centre, where a pluck excites only the broadest mode and
        // looks like a bounce rather than a string.
        const along = 0.24 + Math.random() * 0.52

        dealt += 1
        next += 1
        field.pluck(string, along, strength)
        audioRef.current?.pluck(string, level)
        glow = Math.max(glow, strength)
      }

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
        // The instrument is being played, so it stops playing itself.
        quiet = clock + IDLE
        field.pluck(index, at.x, strength)
        audioRef.current?.pluck(index, strength * CURSOR_LEVEL)
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
