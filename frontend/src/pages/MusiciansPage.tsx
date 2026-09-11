import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, CalendarDays, GraduationCap, Music } from 'lucide-react'

// One entry in `musicians.ts` is one card here. The page knows nothing about
// who is on the roster; it only knows how a card is laid out.
import {
  initialsFor,
  musicians,
  photoFor,
  type Musician,
} from '@/data/musicians'

// Cards with a photo come first, then the rest — each group keeps the order
// the roster file gives it. A stable partition rather than a sort, so the
// running order in `musicians.ts` still decides everything else.
const roster = [
  ...musicians.filter((musician) => photoFor(musician)),
  ...musicians.filter((musician) => !photoFor(musician)),
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: 'easeOut' },
  },
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }

export function MusiciansPage() {
  useEffect(() => {
    document.title = 'Our musicians | Heartstrings'
    window.scrollTo(0, 0)
  }, [])

  return (
    <article>
      {/* Title */}
      <section className="px-6 pb-8 pt-32 text-center sm:px-8 lg:px-10 lg:pb-10 xl:px-14">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-3xl"
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-medium uppercase tracking-[0.34em] text-brand-deep/55"
          >
            Our musicians
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="mt-5 font-display text-[clamp(2.5rem,9vw,3.25rem)] leading-[0.95] tracking-[-0.04em] text-brand-deep sm:text-6xl lg:text-7xl"
          >
            The people who play
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-brand-deep/72 sm:text-xl"
          >
            Every Heartstrings performance is played by our volunteers — students
            who give their evenings and weekends to bring music to those who need it most.
          </motion.p>
        </motion.div>
      </section>

      {/* The roster */}
      <section className="px-6 py-14 sm:px-8 lg:px-10 lg:py-20 xl:px-14">
        <motion.ul
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          className="mx-auto grid max-w-shell gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {roster.map((musician) => (
            <motion.li key={musician.slug} variants={fadeUp} className="h-full">
              <MusicianCard musician={musician} />
            </motion.li>
          ))}
        </motion.ul>

        <p className="mt-14 text-center text-base leading-8 text-brand-deep/72">
          We are always short a pair of hands.{' '}
          <a
            href="/#join"
            className="group inline-flex items-center gap-1.5 text-brand-deep underline decoration-brand-rose decoration-2 underline-offset-4 transition hover:decoration-brand-deep"
          >
            Join us
            <ArrowUpRight
              className="h-4 w-4 transition duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </a>
        </p>
      </section>
    </article>
  )
}

/** Photo on top, name under it, officer role as the subtitle under the name,
    then — pinned to the foot of the card — what they play, their major (and
    minor) and the term they joined, one to a row.

    Every text region is a fixed number of lines: the name always takes two,
    the role one, the foot three. A short name reserves the space anyway and a
    long one is clipped with an ellipsis (the full text sits in a `title`
    tooltip), so no roster entry can push a card taller than its neighbours. */
function MusicianCard({ musician }: { musician: Musician }) {
  const photo = photoFor(musician)
  const instruments = musician.instruments.join(' · ')
  // "Computer Science · Music minor" — or just whichever half they have.
  const studies = [musician.major, musician.minor && `${musician.minor}`]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-brand-rose/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.84)_0%,rgba(255,248,244,0.96)_100%)] p-5 text-center shadow-[0_20px_60px_rgba(201,116,143,0.1)] transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(201,116,143,0.16)]">
      {/* A square photo the full width of the card, or the musician's initials
          while there isn't one. */}
      <div className="aspect-square w-full shrink-0 overflow-hidden rounded-[1.5rem] border border-brand-rose/55 bg-brand-pink/40 shadow-[0_14px_40px_rgba(201,116,143,0.14)]">
        {photo ? (
          <img
            src={photo}
            alt={musician.name}
            loading="lazy"
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.85),rgba(255,222,233,0.65)_40%,rgba(249,198,215,0.4)_100%)] font-display text-7xl text-brand-deep/70"
            aria-hidden="true"
          >
            {initialsFor(musician.name)}
          </div>
        )}
      </div>

      <div className="mt-5 pb-5">
        {/* Always two lines tall; a longer name ends in an ellipsis. */}
        <p
          title={musician.name}
          className="line-clamp-2 min-h-[2lh] break-words font-display text-2xl leading-tight text-brand-deep sm:text-3xl"
        >
          {musician.name}
        </p>

        {/* Always rendered, so a musician without a role reserves the same
            line an officer's title takes. */}
        <p
          title={musician.role}
          className="mt-2 min-h-[1lh] truncate text-xs font-medium uppercase tracking-[0.24em] text-brand-deep/60"
        >
          {musician.role ?? '\u00A0'}
        </p>
      </div>

      {/* What they play, their major and minor, and the joining term — one to a row, so
          the foot is exactly three lines on every card. A second instrument
          reads as "Piano · Guitar". `mt-auto` keeps this at the foot of the
          card, level across a row. `min-w-0` on each row is what lets
          `truncate` on the text inside it actually clip. */}
      <div className="mt-auto flex flex-col gap-y-2 border-t border-brand-rose/35 pt-5 text-sm text-brand-deep/70">
        <span className="flex min-w-0 items-center justify-center gap-2">
          <Music className="h-4 w-4 shrink-0 text-brand-deep/45" aria-hidden="true" />
          <span className="truncate" title={instruments}>
            {instruments}
          </span>
        </span>
        <span className="flex min-h-[1lh] min-w-0 items-center justify-center gap-2">
          {studies ? (
            <>
              <GraduationCap
                className="h-4 w-4 shrink-0 text-brand-deep/45"
                aria-hidden="true"
              />
              <span className="sr-only">Studies: </span>
              <span className="truncate" title={studies}>
                {studies}
              </span>
            </>
          ) : null}
        </span>
        <span className="flex min-w-0 items-center justify-center gap-2">
          <CalendarDays
            className="h-4 w-4 shrink-0 text-brand-deep/45"
            aria-hidden="true"
          />
          <span className="sr-only">Joined </span>
          <span className="truncate">{musician.joined}</span>
        </span>
      </div>
    </div>
  )
}
