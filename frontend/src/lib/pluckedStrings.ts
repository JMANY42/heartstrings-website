// The physics behind the hero's string field: a handful of strings pinned at
// both ends, each one ringing after it is plucked and settling back to rest.
//
// A string is held as a few standing waves rather than a row of points. Pin a
// string at both ends and the only shapes it can hold are sin(kπx) — the whole
// string bowing one way, then splitting in two, in three, and so on — so any
// shape it ever takes is a sum of those, and each one rings at its own pitch
// and fades on its own. Four of them is enough to read as a string; past that
// the modes are too fine to see at this scale and only cost time. Carrying the
// shape this way means the state is eight numbers per string instead of a
// hundred, nothing has to be held stable against its neighbours, and a pluck is
// an addition rather than a re-solve.
//
// Each mode is a damped oscillator, and it is stepped by its exact solution
// rather than by a numerical integrator. Euler's method on an oscillator is
// only stable while the step is short against the period, and the fast modes
// here run close enough to the frame rate that a dropped frame or a background
// tab would otherwise blow them up. The closed form has no such limit — it is
// the true answer at any step — and because the step is fixed the sine and
// cosine it needs are worked out once, when the field is built, instead of
// every frame.
//
// What is drawn, though, is not that sum of shapes. Adding the modes together
// gives the string's exact instantaneous outline, kinks and all, and drawn at
// this scale that reads as a wobble rather than as a string. What is drawn
// instead is a Gaussian pulse — `PULSE` — running the length of the string,
// turning over at each pin and coming back, which is what a disturbance on a
// real string does and what the modes are a decomposition of.
//
// So the two halves of this file answer different questions. The pulse decides
// where the string is bent and which way: it travels, so every part of the
// string takes its turn, and it inverts on reflection, so a point on the string
// is carried up, then down, then up. The modes decide only how much is left —
// a decay, read as an amplitude rather than a position, since the rise and fall
// is the pulse's job now and a string cannot swing twice over.

/** A string's voice: what it sounds like, expressed visually. */
export type StringVoice = {
  /** Pitch of the fundamental, in cycles per second. Slow enough to watch. */
  frequency: number
  /** Roughly how long a pluck takes to die away, in seconds. */
  ring: number
}

/** How many standing waves each string carries. */
const MODES = 4

/** Fixed simulation step. Short against the fastest mode, and independent of
 *  the frame rate so the motion is the same on any display. */
const STEP = 1 / 120

/** Where a pluck is allowed to land. Right at the pin the mode amplitudes
 *  divide by nearly nothing, so a pluck there would be enormous. */
const PLUCK_MARGIN = 0.06

/** How much of a string's existing swing survives being plucked again.
 *
 *  Plucks add to whatever is already there, and nothing stops a reader dragging
 *  the cursor back and forth across one string. Left to add freely a string
 *  hammered at the shortest gap the cursor allows settles at nineteen times a
 *  single pluck — comfortably off the screen. It is not what a hand does either:
 *  to pluck a ringing string you first put a finger on it, which stops most of
 *  what was there before it starts anything new. Holding most of it back is both
 *  the true behaviour and what bounds the swing. */
const GRIP = 0.3

/** Length of the pulse, in string lengths — the `a` of the shape below. At a
 *  tenth of the string the disturbance is compact: it is worth a third of its
 *  height half a pulse either side of its peak, and nothing at all by the
 *  middle of the string. */
const PULSE = 0.1

/** Where the pulse starts: two pulse lengths from the near pin. */
const PULSE_AT = 2 * PULSE

/** The pulse itself, before it is put on a string:
 *
 *      exp( -z² / a² )
 *
 *  a Gaussian of length `a`, worth one at its centre. */
function bump(distance: number) {
  return Math.exp(-(distance * distance) / (PULSE * PULSE))
}

/** The pulse after `travel` string-lengths of running, at `position` along the
 *  string. This is the shape asked for — a Gaussian of length `a`, starting at
 *  `2a` — set moving and made to obey the pins.
 *
 *  It obeys them by the method of images. A pulse on a string held at both ends
 *  behaves exactly like a pulse on an endless string that also carries a mirror
 *  copy of itself: upside down, and reflected about the pin. The two cancel at
 *  the pin, which is what holding it there means, and as the real pulse runs off
 *  the end its mirror runs on — so the reflection is not a special case to be
 *  handled but something that simply happens, inverted, the way it does on a
 *  real string. Mirroring the mirrors gives a copy every two string lengths, and
 *  since the pulse is spent within half a length only the nearest few can
 *  contribute anything.
 *
 *  So the pulse crosses to the far pin, turns over, comes back, turns over
 *  again, and is exactly nothing at both ends the whole time — where the fixed
 *  version of this shape was a fiftieth adrift at the near pin. `travel` runs
 *  forward without bound; two lengths is one round trip. */
export function pulseAt(position: number, travel: number) {
  const wrapped = travel % 2
  let total = 0

  for (let image = -1; image <= 1; image += 1) {
    const shift = wrapped + 2 * image

    total += bump(position - shift) - bump(-position - shift)
  }

  return total
}

/** How much swing is left in a string, without regard to where in the swing it
 *  happens to be.
 *
 *  A mode's `position` passes through zero twice a cycle, so reading it would
 *  have the string at rest every time it went by. This reads the oscillator's
 *  amplitude instead — position and velocity taken together — which only ever
 *  falls, at the mode's own damping rate. Which matters more than it once did:
 *  the pulse now takes its rise and fall from travelling and turning over at
 *  the pins, so what it is scaled by has to be a decay and nothing else, or the
 *  string would swing twice over.
 *
 *  Summed across the modes, so a pluck that put a lot into the fast ones starts
 *  brighter and settles quickly — the shiver on a sharp pluck. */
function swingOf(modes: Mode[]) {
  return modes.reduce(
    (total, mode) =>
      total +
      Math.hypot(
        mode.position,
        // Not velocity alone. A damped oscillator's position is
        // A·e^(-λt)·cos(ω_d·t + φ), and it is this combination — the same one
        // the exact step above turns on — that recovers A·e^(-λt) exactly.
        // Velocity on its own leaves a wobble the size of λ/ω_d, which is
        // small but is a swing that grows of its own accord.
        (mode.velocity + mode.damping * mode.position) / mode.damped,
      ),
    0,
  )
}

/** A pluck's decay per mode. Higher modes bend the string more sharply, lose
 *  energy faster, and so fade first — which is what turns the bright kink of a
 *  fresh pluck into the smooth swell it settles into. */
const MODE_DAMPING = [1, 1.7, 2.6, 3.6]

type Mode = {
  /** Amplitude, and its rate of change. */
  position: number
  velocity: number
  /** The exact step, precomputed: e^(-λ·STEP), cos(ω_d·STEP), sin(ω_d·STEP). */
  fade: number
  cos: number
  sin: number
  /** λ, ω_d and ω², kept for the step's cross terms. */
  damping: number
  damped: number
  stiffness: number
}

function createMode(voice: StringVoice, harmonic: number): Mode {
  const frequency = voice.frequency * harmonic
  const angular = 2 * Math.PI * frequency
  // e^(-λ·ring) ≈ 0.04 is where a pluck reads as finished, so λ ≈ 3.2 / ring.
  const damping = (3.2 / voice.ring) * MODE_DAMPING[harmonic - 1]
  // An overdamped mode has no ω_d to speak of; hold it just under critical so
  // the step below stays real. Nothing in the hero gets near this, but a
  // shorter ring than the tuning here would.
  const damped = Math.sqrt(Math.max(angular * angular - damping * damping, 1e-6))

  return {
    position: 0,
    velocity: 0,
    fade: Math.exp(-damping * STEP),
    cos: Math.cos(damped * STEP),
    sin: Math.sin(damped * STEP),
    damping,
    damped,
    stiffness: angular * angular,
  }
}

export type StringField = {
  /** Pull a string aside at `position` (0–1 across its length) and let go.
   *  `strength` is the height of the pull, in the units the swing comes back
   *  in.
   *
   *  Where it is caught decides neither the shape nor where it is — the pulse
   *  owns both, and where it is depends only on how long it has been running.
   *  What the position decides is the decay. A pluck near a pin is a sharper
   *  corner, so more of it goes into the modes above the fundamental, which are
   *  fast and die first: the string starts with more in it and loses most of
   *  that quickly. Caught in the middle it puts nearly everything into the
   *  fundamental and fades evenly instead. */
  pluck(index: number, position: number, strength: number): void
  /** Run the strings forward by `seconds`. Time that does not divide evenly
   *  into a step is carried over to the next call, so the strings advance at
   *  the same rate however often this is called. */
  advance(seconds: number): void
  /** Where the string sits at `position` (0–1), relative to its rest line: how
   *  much swing the string has left, placed and shaped by the running pulse. */
  displacement(index: number, position: number): number
  /** How much a string is still ringing: 0 at rest, of the order of one just
   *  after a full pluck, and only ever falling in between. Used to brighten a
   *  string while it is moving, and to scale the pulse. */
  energy(index: number): number
}

export function createStringField(voices: StringVoice[]): StringField {
  const strings = voices.map((voice) => ({
    modes: Array.from({ length: MODES }, (_, index) => createMode(voice, index + 1)),
    /** How far this string's pulse has run, in string lengths. It starts where
     *  the shape says it does and never resets — a pluck feeds the pulse that
     *  is already running rather than moving it, so nothing ever jumps. */
    travel: PULSE_AT,
    /** Lengths per second. A wave on a string makes the round trip — down and
     *  back, two lengths — once per period of its fundamental, so the speed is
     *  twice the pitch. The bottom string's pulse crosses in the time the top
     *  string's crosses four times, which is exactly how far apart those two
     *  notes are. */
    speed: 2 * voice.frequency,
  }))

  let carried = 0

  return {
    pluck(index, position, strength) {
      const string = strings[index]

      if (!string) {
        return
      }

      // The Fourier coefficients of a string held in a triangle: pulled aside
      // at `at` by `strength`, straight to each pin. Summing the modes below
      // reproduces exactly that corner, which is why a pluck near the middle
      // gives a broad swell and one near a pin gives a narrow, brighter kink.
      const at = Math.min(Math.max(position, PLUCK_MARGIN), 1 - PLUCK_MARGIN)
      const scale = (2 * strength) / (Math.PI * Math.PI * at * (1 - at))

      string.modes.forEach((mode, order) => {
        const harmonic = order + 1

        // The finger lands before it lets go.
        mode.position *= GRIP
        mode.velocity *= GRIP
        mode.position +=
          (scale * Math.sin(harmonic * Math.PI * at)) / (harmonic * harmonic)
      })
    },

    advance(seconds) {
      // A tab that was in the background hands back an enormous first frame.
      // Simulating all of it would be a long stall to arrive at strings that
      // are at rest anyway, so time past a few frames is simply dropped.
      carried = Math.min(carried + seconds, 0.25)

      while (carried >= STEP) {
        carried -= STEP

        for (const string of strings) {
          string.travel += string.speed * STEP

          for (const mode of string.modes) {
            const { position, velocity, damping, damped, cos, sin, fade } = mode

            mode.position =
              fade * (position * cos + ((velocity + damping * position) / damped) * sin)
            mode.velocity =
              fade *
              (velocity * cos -
                ((mode.stiffness * position + damping * velocity) / damped) * sin)
          }
        }
      }
    },

    displacement(index, position) {
      const string = strings[index]

      if (!string) {
        return 0
      }

      return swingOf(string.modes) * pulseAt(position, string.travel)
    },

    energy(index) {
      const string = strings[index]

      return string ? swingOf(string.modes) : 0
    },
  }
}
