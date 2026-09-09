// The physics behind the hero's string field: six strings pinned at both ends,
// each carrying a pulse that runs its length, turns over at the pins, and fades.
//
// Two things are tracked per string, and they answer different questions.
//
// Where the string is bent, and which way, is the pulse — `pulseAt`. It travels,
// so every part of the string takes its turn; it inverts each time it reaches a
// pin, so a point on the string is carried up, then down, then up. That is the
// whole of the motion.
//
// How much is left is a decay, held as four numbers per string. A pluck is a
// corner, and a corner is a sum of standing waves whose sizes fall away as
// 1/k² — spread far up the series near a pin, nearly all in the broadest one in
// the middle. Each fades at its own rate, the finer ones faster, which is why a
// sharp pluck starts with more in it and loses most of that quickly while a
// pluck in the middle subsides evenly. Four is enough to tell those apart.
//
// Those four were once damped oscillators, stepped by the exact solution of the
// oscillator equation. They no longer oscillate, and that is deliberate: the
// pulse supplies the rise and fall now, so anything swinging underneath it would
// have the string swing twice over. Only their amplitude was ever read, and an
// amplitude is A·e^(-λt) whatever the phase is doing — so all the machinery for
// the phase computed something nothing could see. Four decaying numbers give the
// same answer to fifteen decimal places, and they carry no frequency, which
// means no limit on how quickly a string may be asked to die away. The
// oscillators had one: past critical damping the amplitude they reported was
// nonsense, and the bottom string could not have been given a ring shorter than
// 3.7 seconds.

/** A string's voice. */
export type StringVoice = {
  /** How fast its pulse runs, in string lengths per second. Two lengths is one
   *  round trip, down and back. */
  speed: number
  /** Roughly how long a pluck takes to die away, in seconds. */
  ring: number
}

/** How the parts of a pluck fade relative to one another. The finer the standing
 *  wave, the more sharply it bends the string, the faster it goes — which is
 *  what turns the kink of a fresh pluck into a smooth swell. */
const MODE_DAMPING = [1, 1.7, 2.6, 3.6]

/** Where a pluck is allowed to land. Right at the pin the parts of a pluck
 *  divide by nearly nothing, so a pluck there would be enormous. */
const PLUCK_MARGIN = 0.06

/** The longest stretch simulated in one go. A tab that was in the background
 *  hands back an enormous first frame, and running all of it would be a stall to
 *  arrive at strings that are at rest anyway. */
const LONGEST_STEP = 0.25

/** How much of a string's existing swing survives being plucked again.
 *
 *  Plucks add to whatever is already there, and nothing stops a reader dragging
 *  the cursor back and forth across one string. Left to add freely, a string
 *  hammered at the shortest gap the cursor allows settles at many times a single
 *  pluck — comfortably off the screen. It is not what a hand does either: to
 *  pluck a ringing string you first put a finger on it, which stops most of what
 *  was there before it starts anything new. Holding most of it back is both the
 *  true behaviour and what bounds the swing. */
const GRIP = 0.3

/** Length of the pulse, in string lengths — the `a` of the shape below. At a
 *  tenth of the string the disturbance is compact: it is worth a third of its
 *  height half a pulse either side of its peak, and nothing at all half a length
 *  away. */
const PULSE = 0.1

/** Where a string's pulse sits before anything has plucked it: two pulse lengths
 *  from the near pin. After that it starts wherever the string was caught. */
const PULSE_AT = 2 * PULSE

/** The pulse itself, before it is put on a string:
 *
 *      exp( -z² / a² )
 *
 *  a Gaussian of length `a`, worth one at its centre. */
function bump(distance: number) {
  return Math.exp(-(distance * distance) / (PULSE * PULSE))
}

/** The pulse at `position` along the string, after `travel` string-lengths of
 *  running. This is the shape asked for — a Gaussian of length `a` — set moving
 *  and made to obey the pins.
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
 *  again, and is exactly nothing at both ends the whole time. `travel` runs
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

type Part = {
  /** How much of the pluck is still in this part of it. */
  amplitude: number
  /** How fast that falls away, per second. */
  damping: number
}

type Strand = {
  parts: Part[]
  /** How far this string's pulse has run, in string lengths. */
  travel: number
  /** Lengths per second. */
  speed: number
}

/** How much swing a string has left: its parts, added up. Only ever falls, which
 *  is what lets the pulse own the rise and fall. */
function swingOf(strand: Strand) {
  return strand.parts.reduce((total, part) => total + part.amplitude, 0)
}

export type StringField = {
  /** Pull a string aside at `position` (0–1 across its length) and let go.
   *  `strength` is the height of the pull, in the units the swing comes back in.
   *
   *  The pulse starts from there. A disturbance begins where the string was
   *  caught, so a pluck near a pin sends the wave off from that pin, and a reader
   *  strumming a string sees it leave from under the cursor. Where it is caught
   *  also decides the decay: nearer a pin is a sharper corner, so more of the
   *  pluck goes into the finer parts, which die first. */
  pluck(index: number, position: number, strength: number): void
  /** Run the strings forward by `seconds`: the pulses travel, the swing fades. */
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
  const strings: Strand[] = voices.map((voice) => ({
    parts: MODE_DAMPING.map((share) => ({
      amplitude: 0,
      // e^(-λ·ring) ≈ 0.04 is where a pluck reads as finished, so λ ≈ 3.2 / ring.
      damping: (3.2 / voice.ring) * share,
    })),
    travel: PULSE_AT,
    speed: voice.speed,
  }))

  return {
    pluck(index, position, strength) {
      const string = strings[index]

      if (!string) {
        return
      }

      // The sizes of the standing waves making up a string held in a triangle:
      // pulled aside at `at` by `strength`, straight to each pin.
      const at = Math.min(Math.max(position, PLUCK_MARGIN), 1 - PLUCK_MARGIN)
      const scale = (2 * strength) / (Math.PI * Math.PI * at * (1 - at))

      string.parts.forEach((part, order) => {
        const harmonic = order + 1

        // The finger lands before it lets go.
        part.amplitude =
          part.amplitude * GRIP +
          Math.abs(scale * Math.sin(harmonic * Math.PI * at)) / (harmonic * harmonic)
      })

      // And the wave leaves from under it.
      string.travel = at
    },

    advance(seconds) {
      const elapsed = Math.min(Math.max(seconds, 0), LONGEST_STEP)

      for (const string of strings) {
        string.travel += string.speed * elapsed

        for (const part of string.parts) {
          part.amplitude *= Math.exp(-part.damping * elapsed)
        }
      }
    },

    displacement(index, position) {
      const string = strings[index]

      if (!string) {
        return 0
      }

      return swingOf(string) * pulseAt(position, string.travel)
    },

    energy(index) {
      const string = strings[index]

      return string ? swingOf(string) : 0
    },
  }
}
