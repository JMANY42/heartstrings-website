// The sound of the hero's strings: six notes, in a guitar's tuning, each one
// synthesised rather than sampled.
//
// The method is Karplus–Strong, which is the same idea as the visual simulation
// next door in `pluckedStrings`, arrived at from the other end. A buffer one
// wavelength long is filled with the shape the string is holding when it is let
// go, and then read round and round, each pass averaging neighbouring samples.
// The averaging is a low-pass filter, so every time round the loop the sharp
// content wears off a little faster than the smooth content. That is what a real
// string does, and it is why the result has a bright pick that mellows into a
// hum instead of sounding like an organ.
//
// Two things separate this from the textbook version, and both are what stop it
// sounding like a rubber band.
//
// The first is what the loop starts with. Karplus–Strong is usually seeded with
// noise, which is a string given every frequency at once — nothing does that,
// and the result has the metallic ring of a banjo or a harpsichord. A plucked
// string is held in a triangle: straight from the bridge to the fingertip and
// straight on to the nut. Seeding the loop with that triangle is both what the
// string is really doing and the reason the harmonics come out in the
// proportions a guitar's do — a corner at `PICK` gives the kth harmonic a
// weight of sin(kπ·PICK)/k², which is measurably what comes back out.
//
// Where the corner sits tilts that whole series, which is why moving your hand
// up the string on a real guitar changes the tone rather than the note. In
// theory it also puts a deep null at the harmonics with a node exactly under
// the pick — the eighth, here — but at the level of noise below, that null is
// filled in and inaudible. The audible part is the tilt across the first six.
// Only a little noise is mixed in, for the fingertip itself, not the string.
//
// The second is the box. A string alone is thin whatever you do to it; what
// makes it a guitar is the soundboard it is stretched over, which is nowhere
// near flat in its response. That is `BODY` below.
//
// A note is a fixed pitch, so each string's waveform is rendered once, into an
// AudioBuffer, and every pluck after that is a buffer being played at a volume.
// Nothing is synthesised while the page is running.

/** Where a note is considered finished, relative to the pick. */
const SILENCE = 0.001

/** Rounds the very start off, so the jump from silence into the pluck is not
 *  itself a click. */
const ATTACK = 0.004

/** Damps a note that is still ringing when its string is plucked again — the
 *  hand doing the plucking is on the string, so the old note stops. */
const RETRIGGER = 0.05

/** Overall level. These are notes under a page, not a performance. */
const MASTER = 0.22

/** Weight of the nearer of the loop filter's two taps. A half is a plain
 *  average, which is the classic Karplus–Strong loop; it costs the loop half a
 *  sample of delay, which `renderPluck` has to give back when it picks the
 *  length of the line. Raising it holds on to the high harmonics for longer. */
const LOOP = 0.5

/** Where the string is picked, as a fraction of its length from the bridge.
 *  A guitar's strings are all the same length, so a player's hand sits at the
 *  same fraction along all six — which is why the hollow it puts in the
 *  harmonics falls in the same place on every string, and why they sound like
 *  one instrument. About an eighth along is where a hand naturally falls over
 *  the soundhole. */
const PICK = 0.13

/** How much of the pluck is the fingertip rather than the string. Enough to
 *  hear the pick land; past this it starts to hiss. */
const NOISE = 0.22

/** The soundbox, as a handful of resonances the whole instrument is played
 *  through. A guitar body has a strong air resonance around the low E's octave,
 *  a top-plate resonance a fifth or so above it, a broad cluster in the low
 *  mids, and a gentle presence lift where the pick lives. These are the coarse
 *  shape of a real one, not a measurement of a particular guitar. */
const BODY = [
  { frequency: 98, q: 6, gain: 7 },
  { frequency: 196, q: 5, gain: 4.5 },
  { frequency: 430, q: 3, gain: 2.5 },
  { frequency: 2600, q: 1.2, gain: 2 },
]

/** Below the low E's fundamental there is nothing but rumble, and above this
 *  there is nothing a nylon string does. */
const RUMBLE = 70
const AIR = 6000

export type StringTone = {
  /** Fundamental, in Hz. */
  pitch: number
  /** Seconds from the pick to silence. */
  sustain: number
}

export type StringAudio = {
  /** Sound a string. `level` is 0–1, and anything at or below 0 is ignored. */
  pluck(index: number, level: number): void
  close(): void
}

/** Renders one note. Split out from the AudioBuffer it ends up in, and free of
 *  anything browser-shaped, so the tuning and the timbre can be measured
 *  outside a browser. */
export function renderPluck(rate: number, tone: StringTone) {
  const length = Math.max(Math.floor(rate * tone.sustain), 1)
  const output = new Float32Array(length)

  // One wavelength, in whole samples, plus the delay the loop filter takes back
  // off every trip. That filter reads the slot it is writing and the one in
  // front of it — delays of `period` and `period - 1` — so with equal weights
  // the loop runs half a sample short and the note sounds sharp of the line's
  // length. Half a sample is nothing on the bottom string, where a wavelength
  // is nearly six hundred of them, and worth about six cents on the top string,
  // where it is a hundred and forty-odd.
  //
  // What is left is the rounding, under three cents on every string here:
  // closer than a guitar holds its tuning between songs.
  const period = Math.max(Math.round(rate / tone.pitch + (1 - LOOP)), 2)
  const line = new Float32Array(period)

  // The string as it is let go: straight from the bridge up to the fingertip at
  // `PICK`, and straight back down to the nut.
  for (let index = 0; index < period; index += 1) {
    const along = index / period

    line[index] =
      along < PICK ? along / PICK : (1 - along) / (1 - PICK)
  }

  // The fingertip's own noise, low-passed rather than white — skin on a wound
  // string is a scrape, not a hiss.
  let drift = 0

  for (let index = 0; index < period; index += 1) {
    drift = drift * 0.72 + (Math.random() * 2 - 1) * 0.28
    line[index] += drift * NOISE
  }

  // Round the corner off. A fingertip has width, so the string does not really
  // leave it in a point, and an unrounded corner is brighter than any pluck.
  let previous = line[period - 1]

  for (let index = 0; index < period; index += 1) {
    const current = line[index]

    line[index] = (previous + current) * 0.5
    previous = current
  }

  // Take the average out. A triangle sits entirely on one side of the rest
  // line, and that offset is a frequency of zero — which the loop filter passes
  // untouched, so it would sit under the note as a thump and fade only as
  // slowly as the note itself. A real string is displaced, not stretched.
  let mean = 0

  for (let index = 0; index < period; index += 1) {
    mean += line[index]
  }

  mean /= period

  for (let index = 0; index < period; index += 1) {
    line[index] -= mean
  }

  // Loop gain. The averaging above sets how the harmonics fall away relative to
  // each other; this sets how long the note lasts at all, and it is worked out
  // from the sustain so that a low string is not left ringing for twice as long
  // as a high one simply because its loop is longer.
  //
  // The exponent is per trip round the loop, not per sample: a given slot in
  // the line is only rewritten once every `period` samples, so there are
  // length / period of them in a note. Damping per sample instead leaves the
  // string still swinging when the buffer runs out, and a note cut off at
  // amplitude is a click.
  const feedback = Math.pow(SILENCE, period / length)
  const attack = Math.max(Math.floor(rate * ATTACK), 1)

  let cursor = 0
  let peak = 0

  for (let index = 0; index < length; index += 1) {
    const current = line[cursor]
    const next = line[(cursor + 1) % period]

    line[cursor] = (LOOP * current + (1 - LOOP) * next) * feedback
    output[index] = index < attack ? (current * index) / attack : current
    peak = Math.max(peak, Math.abs(output[index]))
    cursor = (cursor + 1) % period
  }

  // Every note carries a little noise, so its loudness is partly luck.
  // Levelling them here means a pluck's `level` is the only thing that decides
  // how loud it is, and that six strings at once cannot add up to something
  // unpredictable.
  if (peak > 0) {
    for (let index = 0; index < length; index += 1) {
      output[index] /= peak
    }
  }

  return output
}

function render(context: BaseAudioContext, tone: StringTone) {
  const samples = renderPluck(context.sampleRate, tone)
  const buffer = context.createBuffer(1, samples.length, context.sampleRate)

  buffer.getChannelData(0).set(samples)

  return buffer
}

/** Builds the instrument. Must be called from a user gesture: browsers start
 *  an AudioContext suspended, and only a gesture may resume it. */
export function createStringAudio(tones: StringTone[]): StringAudio | null {
  if (typeof window === 'undefined' || !window.AudioContext) {
    return null
  }

  const context = new window.AudioContext()

  void context.resume()

  const rumble = context.createBiquadFilter()
  const air = context.createBiquadFilter()
  // Six strings sounding at once would run past what the output can carry, and
  // past it is a crunch rather than a louder chord. The strum is the one moment
  // that gets close, so the peaks are leaned on rather than the whole
  // instrument being turned down to suit a case that lasts half a second.
  const limiter = context.createDynamicsCompressor()
  const master = context.createGain()

  rumble.type = 'highpass'
  rumble.frequency.value = RUMBLE
  rumble.Q.value = 0.7
  air.type = 'lowpass'
  air.frequency.value = AIR
  limiter.threshold.value = -8
  limiter.knee.value = 6
  limiter.ratio.value = 12
  limiter.attack.value = 0.003
  limiter.release.value = 0.25
  master.gain.value = MASTER

  const body = BODY.map(({ frequency, q, gain }) => {
    const peak = context.createBiquadFilter()

    peak.type = 'peaking'
    peak.frequency.value = frequency
    peak.Q.value = q
    peak.gain.value = gain

    return peak
  })

  // Strings, then the box, then the room: every string is played through the
  // same one, which is most of why six of them sound like one instrument.
  const chain: AudioNode[] = [rumble, ...body, air, limiter, master]

  chain.reduce((from, to) => {
    from.connect(to)

    return to
  })

  master.connect(context.destination)

  const input = chain[0]
  const buffers = tones.map((tone) => render(context, tone))
  const ringing: (GainNode | null)[] = tones.map(() => null)

  let closed = false

  return {
    pluck(index, level) {
      const buffer = buffers[index]

      if (closed || !buffer || level <= 0) {
        return
      }

      const now = context.currentTime
      const previous = ringing[index]

      if (previous) {
        previous.gain.cancelScheduledValues(now)
        previous.gain.setValueAtTime(previous.gain.value, now)
        previous.gain.linearRampToValueAtTime(0, now + RETRIGGER)
      }

      const source = context.createBufferSource()
      const gain = context.createGain()

      source.buffer = buffer
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(Math.min(level, 1), now + ATTACK)
      source.connect(gain).connect(input)

      source.onended = () => {
        gain.disconnect()

        if (ringing[index] === gain) {
          ringing[index] = null
        }
      }

      source.start(now)
      ringing[index] = gain
    },

    close() {
      closed = true
      ringing.fill(null)
      void context.close()
    },
  }
}
