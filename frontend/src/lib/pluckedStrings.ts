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
// this scale that reads as a wobble rather than as a string. So the modes are
// kept for the timing — how far the string is carried at any instant, and how
// that dies away — and the shape they are drawn through is a Gaussian pulse:
// `PULSE`, a compact disturbance a fifth of the way along the string, the
// picture of a wave on a string rather than of a string standing still and
// breathing. It is a chosen shape, not one derived from the modes below it.

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

/** Length of the pulse, in string lengths — the `a` of the shape below. At a
 *  tenth of the string the disturbance is compact: it is worth a third of its
 *  height half a pulse either side of its peak, and nothing at all by the
 *  middle of the string. */
const PULSE = 0.1

/** Where the pulse sits: two pulse lengths from the near pin. */
const PULSE_AT = 2 * PULSE

/** The shape the string is drawn through:
 *
 *      exp( -(x - 2a)² / a² )
 *
 *  A Gaussian pulse of length `a`, peaking at `2a` and falling away either
 *  side. Note that it is not symmetric about the middle of the string and does
 *  not reach zero at the near pin — it is worth about a fiftieth there, which
 *  at the sizes this is drawn at is under two pixels, and lands where the
 *  stroke has already faded out. Exported so the shape can be checked from
 *  outside. */
export function pulseAt(position: number) {
  const offset = position - PULSE_AT

  return Math.exp(-(offset * offset) / (PULSE * PULSE))
}

/** How far along the string the swing is measured: at the pulse's peak, where
 *  the shape is worth one, so the two multiply cleanly.
 *
 *  Every mode reaches it. Measured at the middle of the string the even modes
 *  would count for nothing — a string in its second mode has a still centre —
 *  but a fifth of the way along nothing has a node, so all four modes move the
 *  pulse and the fast ones are visible in it. */
const PROBE = Array.from({ length: MODES }, (_, order) =>
  Math.sin((order + 1) * Math.PI * PULSE_AT),
)

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
   *  Where it is caught no longer decides what the string looks like — that is
   *  always the same pulse — but it still decides how the string behaves. A
   *  pluck near a pin puts more into the modes above the fundamental, which are
   *  fast and die first, so the pulse starts with a shiver on it and settles
   *  quickly into a slower rise and fall; caught in the middle it simply swells
   *  and subsides. How far the pulse moves at all depends on how much the pluck
   *  displaced the string where the pulse sits, so a pluck landing near it
   *  moves it most — at the instant it is let go. Not for long after: the modes
   *  ring at multiples of one another and beat, so which pluck has the pulse
   *  furthest out keeps changing hands. */
  pluck(index: number, position: number, strength: number): void
  /** Run the strings forward by `seconds`. Time that does not divide evenly
   *  into a step is carried over to the next call, so the strings advance at
   *  the same rate however often this is called. */
  advance(seconds: number): void
  /** Where the string sits at `position` (0–1), relative to its rest line: how
   *  far the string has been carried under the pulse, shaped by the pulse. */
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

      // How far the string has been moved where the pulse sits, shaped over the
      // string by the pulse.
      let swing = 0

      string.forEach((mode, order) => {
        swing += mode.position * PROBE[order]
      })

      return swing * pulseAt(position)
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
