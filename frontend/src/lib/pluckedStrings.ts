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
   *  `strength` is the height of the pull, in the same units the shape comes
   *  back in — so 1 plucks a string one unit clear of its rest line. */
  pluck(index: number, position: number, strength: number): void
  /** Run the strings forward by `seconds`. Time that does not divide evenly
   *  into a step is carried over to the next call, so the strings advance at
   *  the same rate however often this is called. */
  advance(seconds: number): void
  /** Where the string sits at `position` (0–1), relative to its rest line. */
  displacement(index: number, position: number): number
  /** How much a string is still ringing: 0 at rest, ~1 just after a full
   *  pluck. Used to brighten a string while it is moving. */
  energy(index: number): number
}

export function createStringField(voices: StringVoice[]): StringField {
  const strings = voices.map((voice) =>
    Array.from({ length: MODES }, (_, index) => createMode(voice, index + 1)),
  )

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

      string.forEach((mode, order) => {
        const harmonic = order + 1

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
          for (const mode of string) {
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

      let total = 0

      string.forEach((mode, order) => {
        total += mode.position * Math.sin((order + 1) * Math.PI * position)
      })

      return total
    },

    energy(index) {
      const string = strings[index]

      if (!string) {
        return 0
      }

      return string.reduce((total, mode) => total + Math.abs(mode.position), 0)
    },
  }
}
