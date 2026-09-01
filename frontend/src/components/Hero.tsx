import { motion } from 'framer-motion'

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.2,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
}

const notes = [
  { className: 'left-[8%] top-[14%] note-float', symbol: '♪', size: 'text-4xl' },
  { className: 'left-[26%] top-[8%] note-float-slow', symbol: '♫', size: 'text-2xl' },
  { className: 'right-[16%] top-[18%] note-float-reverse', symbol: '♪', size: 'text-5xl' },
  { className: 'right-[6%] top-[34%] note-float-delay-1', symbol: '♩', size: 'text-3xl' },
  { className: 'left-[14%] bottom-[20%] note-float-delay-2', symbol: '♬', size: 'text-4xl' },
  { className: 'right-[24%] bottom-[12%] note-float-delay-3', symbol: '♪', size: 'text-2xl' },
]

export function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-[100svh] overflow-hidden px-6 pb-20 pt-32 sm:px-8 lg:px-10"
    >
      <div className="mx-auto flex min-h-[calc(100svh-8rem)] max-w-7xl items-center">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid w-full items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div className="max-w-3xl">
            <motion.p
              variants={item}
              className="mb-6 inline-flex rounded-full border border-brand-rose/60 bg-white/55 px-4 py-2 text-xs font-medium uppercase tracking-[0.34em] text-brand-deep shadow-[0_14px_40px_rgba(201,116,143,0.08)]"
            >
              University chamber ensemble
            </motion.p>

            <motion.h1
              variants={item}
              className="mb-4 font-display text-6xl leading-[0.88] tracking-[-0.04em] text-brand-deep sm:mb-5 sm:text-7xl lg:mb-6 lg:text-[7.75rem]"
            >
              Heartstrings
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-6 max-w-2xl text-lg leading-8 text-brand-deep/78 sm:text-xl"
            >
              Bringing the healing power of music to those who need it most.
            </motion.p>

            <motion.div variants={item} className="mt-10 flex flex-wrap gap-4">
              <a
                href="#join"
                className="inline-flex items-center justify-center rounded-full bg-brand-deep px-7 py-3.5 text-sm font-medium tracking-[0.18em] text-brand-cream shadow-[0_20px_60px_rgba(201,116,143,0.28)] transition-transform hover:-translate-y-0.5 hover:bg-[#b75f7e]"
              >
                Join the ensemble
              </a>
              <a
                href="#about"
                className="inline-flex items-center justify-center rounded-full border border-brand-rose/70 bg-white/55 px-7 py-3.5 text-sm font-medium tracking-[0.18em] text-brand-deep transition-colors hover:bg-brand-pink/65"
              >
                Discover our mission
              </a>
            </motion.div>
          </div>

          <motion.div
            variants={item}
            className="relative mx-auto w-full max-w-[30rem]"
            aria-hidden="true"
          >
            <div className="absolute inset-0 rounded-[2.75rem] bg-brand-pink/28 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2.75rem] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.8)_0%,rgba(255,248,244,0.88)_100%)] p-6 shadow-[0_30px_90px_rgba(201,116,143,0.18)] backdrop-blur-sm sm:p-8">
              <div className="absolute inset-x-8 top-8 h-px bg-brand-rose/55" />
              <div className="absolute inset-x-8 top-[4.75rem] h-px bg-brand-rose/35" />
              <div className="absolute inset-x-8 top-[8rem] h-px bg-brand-rose/25" />

              <div className="relative aspect-[4/5] rounded-[2rem] border border-brand-rose/40 bg-[radial-gradient(circle_at_top,rgba(255,222,233,0.72),transparent_45%),linear-gradient(180deg,rgba(255,252,249,0.92)_0%,rgba(255,247,243,0.98)_100%)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                {notes.map((note) => (
                  <span
                    key={note.symbol + note.className}
                    className={`absolute select-none text-brand-deep/25 ${note.className} ${note.size}`}
                  >
                    {note.symbol}
                  </span>
                ))}

                <div className="absolute left-1/2 top-1/2 w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-brand-rose/45 bg-white/58 p-6 shadow-[0_16px_46px_rgba(201,116,143,0.1)] backdrop-blur-sm">
                  <p className="font-display text-3xl italic text-brand-deep sm:text-4xl">
                    Music that feels close enough to hold.
                  </p>
                  <p className="mt-5 max-w-sm text-sm leading-7 text-brand-deep/70 sm:text-base">
                    Small ensembles. Gentle presence. Concert experiences shaped
                    around the human pace of healing.
                  </p>

                  <div className="mt-6 flex items-end justify-between">
                    <div>
                      <p className="text-[0.65rem] uppercase tracking-[0.3em] text-brand-deep/55">
                        Chamber music
                      </p>
                      <p className="mt-2 font-display text-2xl text-brand-deep">
                        In the room, with you.
                      </p>
                    </div>
                    <div className="h-16 w-16 shrink-0 rounded-full border border-brand-rose/55 bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.85),rgba(255,222,233,0.65)_40%,rgba(249,198,215,0.4)_100%)]" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}