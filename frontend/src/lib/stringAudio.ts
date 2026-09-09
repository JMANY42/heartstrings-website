// The sound of the hero's strings: six notes, in a guitar's tuning, each one
// synthesised rather than sampled.
//
// The method is Karplus–Strong, which is the same idea as the visual
// simulation next door in `pluckedStrings`, arrived at from the other end. A
// buffer one wavelength long is filled with noise — a string, grabbed and let
// go in no particular shape — and then read round and round, each pass
// averaging neighbouring samples. The averaging is a low-pass filter, so every
// time round the loop the sharp content wears off a little faster than the
// smooth content. That is what a real string does, and it is why the result
// has a bright pick that mellows into a hum instead of sounding like an organ.
//
// A note is a fixed pitch, so each string's waveform is rendered once, into an
// AudioBuffer, and every pluck after that is a buffer being played at a volume.
// Nothing is synthesised while the page is running.

/** Where a note is considered finished, relative to the pick. */
const SILENCE = 0.001

/** Rounds the pick off. The noise burst starts at a random sample, and a jump
 *  from silence to that is a click; a few milliseconds of ramp removes it. */
const ATTACK = 0.004

/** Damps a note that is still ringing when its string is plucked again — the
 *  hand doing the plucking is on the string, so the old note stops. */
const RETRIGGER = 0.05

/** Overall level. These are notes under a page, not a performance. */
const MASTER = 0.34

/** Rolls the top off the whole instrument. Karplus–Strong on its own is
 *  brighter than a guitar in a room. */
const WARMTH = 3400

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
 *  anything browser-shaped, so the tuning can be measured outside a browser. */
export function renderPluck(rate: number, tone: StringTone) {
  const length = Math.max(Math.floor(rate * tone.sustain), 1)
  const output = new Float32Array(length)

  // One wavelength, in whole samples, plus the half sample the averaging filter
  // below takes back off every trip round the loop. That filter reads the slot
  // it is writing and the one in front of it — delays of `period` and
  // `period - 1` — so a note really sounds at rate / (period - 0.5), half a
  // sample sharp of the line's length. Half a sample is nothing on the bottom
  // string, where a wavelength is nearly six hundred of them, and worth about
  // six cents on the top string, where it is a hundred and forty-odd.
  //
  // What is left is the rounding, under three cents on every string here:
  // closer than a guitar holds its tuning between songs.
  const period = Math.max(Math.round(rate / tone.pitch + 0.5), 2)
  const line = new Float32Array(period)

  for (let index = 0; index < period; index += 1) {
    line[index] = Math.random() * 2 - 1
  }

  // Take the edge off the noise before it is ever heard. White noise picks a
  // string with a plectrum's worth of energy at every frequency at once, which
  // reads as a snap; smoothing it twice is closer to a fingertip.
  for (let pass = 0; pass < 2; pass += 1) {
    let previous = line[period - 1]

    for (let index = 0; index < period; index += 1) {
      const current = line[index]

      line[index] = (previous + current) * 0.5
      previous = current
    }
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

    line[cursor] = (current + next) * 0.5 * feedback
    output[index] = index < attack ? (current * index) / attack : current
    peak = Math.max(peak, Math.abs(output[index]))
    cursor = (cursor + 1) % period
  }

  // Every note starts from fresh noise, so its loudness is luck. Levelling them
  // here means a pluck's `level` is the only thing that decides how loud it is,
  // and that six strings at once cannot add up to something unpredictable.
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

  const master = context.createGain()
  const warmth = context.createBiquadFilter()
  // Six normalised strings sounding at once would run past what the output can
  // carry, and past it is a crunch rather than a louder chord. The strum is the
  // one moment that gets close, so the peaks are leaned on rather than the
  // whole instrument being turned down to suit a case that lasts half a second.
  const limiter = context.createDynamicsCompressor()

  master.gain.value = MASTER
  warmth.type = 'lowpass'
  warmth.frequency.value = WARMTH
  limiter.threshold.value = -8
  limiter.knee.value = 6
  limiter.ratio.value = 12
  limiter.attack.value = 0.003
  limiter.release.value = 0.25
  warmth.connect(limiter)
  limiter.connect(master)
  master.connect(context.destination)

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
      source.connect(gain).connect(warmth)

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
