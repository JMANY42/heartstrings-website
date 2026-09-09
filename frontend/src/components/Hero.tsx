import { useRef } from 'react'
import { MotionConfig, motion } from 'framer-motion'

import { StringField } from '@/components/StringField'

// The hero says almost nothing. The name, a line under it, and one way in — the
// rest of the screen is the string field behind them, which carries the idea
// the old copy was spelling out: strings, a pulse, a room that is not quite
// still. Everything the page used to explain here is explained properly a
// screen further down, in About.

const NAME = 'Heartstrings'

/** The ink the name is set in, written out rather than reached for as
 *  `text-brand-deep`. That name lives in tailwind.config.ts, which Tailwind v4
 *  does not read unless a stylesheet points at it, so it compiles to nothing —
 *  see the note in index.css. Everything wearing it today is really inheriting
 *  this colour from :root, and the line below the name wants an opacity of it,
 *  which needs a rule that actually exists. */
const INK = '#6d4c5e'

const reveal = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.055, delayChildren: 0.15 },
  },
}

/** Each letter of the name rises into place on its own. The name is the only
 *  thing on the screen with any weight, so it arrives as a phrase rather than
 *  as a block. */
const letter = {
  hidden: { opacity: 0, y: '0.34em' },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
  },
}

const settle = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: 'easeOut' },
  },
}

export function Hero() {
  // The block the strings gather behind and fade out under. It holds the name
  // and the line, and not the button — the button is solid enough to sit over
  // a string, and taking it in would clear a hole most of the screen tall.
  const markRef = useRef<HTMLDivElement>(null)

  return (
    // Everything here moves, and a reader who has asked their system for less
    // of that should get the hero at rest rather than the hero caught
    // mid-entrance. `user` leaves the fades alone and drops the travel, which
    // is the part that causes trouble; the string field reads the same
    // preference itself and draws a single still frame instead of running.
    <MotionConfig reducedMotion="user">
      <section
        id="home"
        className="relative isolate flex min-h-[100svh] items-center overflow-hidden px-6 py-28 sm:px-8 lg:px-10 xl:px-14"
      >
        <StringField focusRef={markRef} />

        <motion.div
          variants={reveal}
          initial="hidden"
          animate="visible"
          className="relative mx-auto flex w-full max-w-shell flex-col items-center text-center"
        >
          <div ref={markRef} className="px-2">
            <h1
              className="font-display leading-[0.86] tracking-[-0.045em]"
              style={{ color: INK }}
            >
              <span className="sr-only">{NAME}</span>
              <span
                aria-hidden="true"
                className="flex justify-center text-[clamp(3rem,15.5vw,10.5rem)]"
              >
                {NAME.split('').map((character, index) => (
                  <motion.span
                    key={`${character}-${index}`}
                    variants={letter}
                    className="inline-block"
                  >
                    {character}
                  </motion.span>
                ))}
              </span>
            </h1>

            <motion.p
              variants={settle}
              className="mt-9 text-[0.55rem] font-medium uppercase tracking-[0.24em] text-[#6d4c5e]/70 sm:mt-12 sm:text-xs sm:tracking-[0.46em]"
            >
              Music where it is needed most
            </motion.p>
          </div>

          <motion.a
            variants={settle}
            href="#join"
            className="mt-12 inline-flex items-center justify-center rounded-full bg-brand-cta px-8 py-3.5 text-sm font-medium tracking-[0.18em] text-brand-ink shadow-[0_18px_45px_rgba(224,143,169,0.32)] transition duration-300 ease-out hover:-translate-y-1 hover:bg-brand-cta-hover hover:shadow-[0_22px_55px_rgba(216,121,151,0.42)] sm:mt-16"
          >
            Join the ensemble
          </motion.a>
        </motion.div>

        {/* The way on, without a word for it: a thread down to the next
            section with something travelling along it. */}
        <motion.a
          href="#about"
          aria-label="Continue to about"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="absolute bottom-9 left-1/2 -translate-x-1/2"
        >
          <span className="relative block h-16 w-3">
            <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[linear-gradient(180deg,rgba(201,116,143,0)_0%,rgba(201,116,143,0.4)_45%,rgba(201,116,143,0)_100%)]" />
            <motion.span
              className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-brand-cta"
              animate={{ y: [0, 58], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </span>
        </motion.a>
      </section>
    </MotionConfig>
  )
}
