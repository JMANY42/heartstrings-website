import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

// The mission statement and the photo of the pair come from the founders file;
// who the founders are comes with them, read off the roster in `musicians.ts`
// so a name is only ever written in one place.
import {
  founders,
  foundersPhoto,
  missionStatement,
  musiciansPath,
  type Founder,
} from '@/data/founders'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: 'easeOut' },
  },
}

/** The founders, sized to fill the right-hand column of the About section
    rather than to hold a section of their own. Everything the full-width
    version had is still here in the same order — the photo of the pair, the
    two names, the mission statement, then the way through to the rest of the
    ensemble — scaled down to a column about half as wide. */
export function FoundersPanel() {
  return (
    <motion.div
      id="founders"
      variants={fadeUp}
      className="relative overflow-hidden rounded-[2.5rem] border border-brand-rose/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(255,248,244,0.95)_100%)] p-6 shadow-[0_28px_90px_rgba(201,116,143,0.12)] sm:p-7"
    >
      <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-brand-pink/45 blur-3xl" />

      <div className="relative">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-brand-deep/55">
          Founders
        </p>
        <h2 className="mt-2 font-display text-2xl leading-[1.05] tracking-[-0.02em] text-brand-deep sm:text-3xl">
          The two who started it
        </h2>

        {/* The photo of the two of them together. */}
        {foundersPhoto.src ? (
          <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-brand-rose/45 bg-white shadow-[0_18px_60px_rgba(201,116,143,0.14)]">
            <img
              src={foundersPhoto.src}
              alt={foundersPhoto.alt}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover object-center"
            />
          </div>
        ) : null}

        {/* One connected panel, like the locations list elsewhere on the page. */}
        <ul className="mt-5 overflow-hidden rounded-[1.5rem] border border-brand-rose/40 bg-white/60 shadow-[0_12px_36px_rgba(201,116,143,0.08)]">
          {founders.map((founder) => (
            <li
              key={founder.slug}
              className="border-b border-brand-rose/30 px-4 py-3 last:border-b-0"
            >
              <FounderRow founder={founder} />
            </li>
          ))}
        </ul>

        {/* The mission statement, in their words. */}
        <blockquote className="mt-6 border-l-2 border-brand-deep/20 pl-4">
          {missionStatement.map((paragraph, index) => (
            <p
              key={index}
              className="mt-3 text-sm leading-6 text-brand-deep/78 first:mt-0"
            >
              {paragraph}
            </p>
          ))}

          <footer className="mt-4 text-[0.6rem] uppercase tracking-[0.24em] text-brand-deep/55">
            {/* Signed by whoever the founders file lists. */}
            {founders.map((founder) => founder.name).join(' & ')}
          </footer>
        </blockquote>

        {/* The rest of the ensemble gets a page of its own. */}
        <div className="mt-6 rounded-[1.5rem] border border-brand-rose/40 bg-brand-pink/45 p-5">
          <p className="text-sm leading-6 text-brand-deep/78">
            Heartstrings is far more than the two of us. Every performance is
            played by volunteers who give their evenings and weekends to it.
          </p>
          <a
            href={musiciansPath}
            className="group mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-brand-rose/70 bg-white/70 px-5 py-3 text-xs font-medium tracking-[0.18em] text-brand-deep shadow-[0_14px_38px_rgba(201,116,143,0.1)] transition duration-300 ease-out hover:-translate-y-1 hover:bg-brand-hover"
          >
            Meet our musicians
            <ArrowUpRight
              className="h-3.5 w-3.5 transition duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </motion.div>
  )
}

/** One founder: their roster photo (or initials while there isn't one), their
    name, and the title and instruments the roster gives them. */
function FounderRow({ founder }: { founder: Founder }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-brand-rose/55 bg-brand-pink/40 shadow-[0_8px_22px_rgba(201,116,143,0.12)]">
        {founder.photo ? (
          <img
            src={founder.photo}
            alt={founder.name}
            loading="lazy"
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.85),rgba(255,222,233,0.65)_40%,rgba(249,198,215,0.4)_100%)] font-display text-base text-brand-deep/70"
            aria-hidden="true"
          >
            {founder.initials}
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className="font-display text-lg text-brand-deep sm:text-xl">
          {founder.name}
        </p>
        <p className="mt-1 text-[0.6rem] uppercase tracking-[0.22em] text-brand-deep/55">
          {/* The roster's title, then everything they play under it. */}
          {[founder.role, ...founder.instruments].filter(Boolean).join(' · ')}
        </p>
      </div>
    </div>
  )
}
