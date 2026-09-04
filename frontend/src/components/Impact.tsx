import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

// The cards below are the same events the /events/<slug> pages are built from,
// so a card and its page can never say different things.
import { specialEvents, type SpecialEvent } from '@/data/events'

// ---------------------------------------------------------------------------
// Impact figures — update these as the numbers grow.
// NOTE: patientsUplifted and amountRaised are placeholders. Replace them with
// the real totals before this goes live.
// ---------------------------------------------------------------------------
const patientsUplifted = 450
const amountRaised = 1200

const locations = [
  {
    name: 'LifeCare Hospitals of North Texas',
    href: 'https://www.lifecare-health.com',
  },
  {
    name: 'Orcharde Pointe Assisted Living',
    href: 'https://www.heritage-communities.com/senior-living/orchard-pointe/tx/carrollton/orchard-pointe-at-creek-valley/',
  },
  {
    name: 'Plano Community Home',
    href: 'https://www.planocommunityhome.org/',
  },
  {
    name: 'UT Dallas campus',
    href: 'https://www.utdallas.edu/',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: 'easeOut' },
  },
}

/** Counts up to `value` once the element scrolls into view. */
function useCountUp(value: number, isActive: boolean) {
  const reduceMotion = useReducedMotion()
  const [animated, setAnimated] = useState(0)

  useEffect(() => {
    if (!isActive || reduceMotion) return

    const duration = 1400
    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      // Ease-out cubic, so the number settles rather than stopping dead.
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimated(Math.round(value * eased))

      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      }
    }

    frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frame)
  }, [isActive, reduceMotion, value])

  if (reduceMotion) return value

  return isActive ? animated : 0
}

/** Every event card looks the same — the sections around them say which is
    which, so the card itself carries no badge. */
function EventCard({ event }: { event: SpecialEvent }) {
  return (
    <a
      href={`/events/${event.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] text-center border border-brand-deep/25 bg-[linear-gradient(180deg,rgba(255,222,233,0.72)_0%,rgba(255,248,244,0.96)_100%)] p-6 shadow-[0_24px_70px_rgba(201,116,143,0.16)] transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_32px_90px_rgba(201,116,143,0.22)] focus-visible:-translate-y-1 focus-visible:outline-none sm:p-8"
    >
      <p className="font-display text-3xl leading-tight text-brand-deep sm:text-4xl">
        {event.title}
      </p>
      <p className="mt-2 text-xs font-medium uppercase tracking-[0.24em] text-brand-deep/60 sm:text-sm">
        Heartstrings &times; {event.collaborator.name}
      </p>
      <p className="mx-auto mt-3 max-w-md text-base leading-7 text-brand-deep/75">
        {event.summary}
      </p>
      <span className="mt-auto inline-flex items-center justify-center gap-2 pt-5 text-sm font-medium tracking-[0.14em] text-brand-deep/70 transition group-hover:text-brand-deep">
        Read more
        <ArrowUpRight
          className="h-4 w-4 transition duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </a>
  )
}

/** Two columns of cards. An odd one out sits centered on its own row rather
    than hanging off the left edge. */
function EventSection({
  heading,
  events,
}: {
  heading: string
  events: SpecialEvent[]
}) {
  if (!events.length) return null

  const hasOddCard = events.length % 2 === 1

  return (
    <div className="mt-14">
      <h4 className="text-center text-xs font-medium uppercase tracking-[0.34em] text-brand-deep/55">
        {heading}
      </h4>
      <ul className="mt-6 grid gap-6 sm:grid-cols-2">
        {events.map((event, index) => (
          <li
            key={event.slug}
            className={
              hasOddCard && index === events.length - 1
                ? 'sm:col-span-2 sm:w-[calc(50%-0.75rem)] sm:justify-self-center'
                : ''
            }
          >
            <EventCard event={event} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Splits the events into the three groups the home page shows. An event
    without a date is treated as still to come. */
function groupEvents(events: SpecialEvent[]) {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const dateOf = (event: SpecialEvent) =>
    event.date ? new Date(`${event.date}T00:00:00`).getTime() : Infinity

  const featured = events.find((event) => event.featured)
  const rest = events.filter((event) => event !== featured)

  return {
    featured,
    upcoming: rest
      .filter((event) => dateOf(event) >= startOfToday.getTime())
      .sort((a, b) => dateOf(a) - dateOf(b)),
    past: rest
      .filter((event) => dateOf(event) < startOfToday.getTime())
      .sort((a, b) => dateOf(b) - dateOf(a)),
  }
}

export function Impact() {
  const statRef = useRef<HTMLDivElement>(null)
  const statInView = useInView(statRef, { once: true, amount: 0.5 })
  const patients = useCountUp(patientsUplifted, statInView)
  const raised = useCountUp(amountRaised, statInView)
  const { featured, upcoming, past } = groupEvents(specialEvents)

  return (
    <section id="impact" className="px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.14 } } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-medium uppercase tracking-[0.34em] text-brand-deep/55"
          >
            Impact
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="mt-4 font-display text-4xl leading-[0.95] tracking-[-0.03em] text-brand-deep sm:text-5xl lg:text-6xl"
          >
            What the music has done
          </motion.h2>

          <div className="mt-12 grid items-start gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
            {/* Left — where we have played */}
            <motion.div variants={fadeUp}>
              <h3 className="font-display text-3xl text-brand-deep sm:text-4xl">
                Where we&apos;ve played
              </h3>
              <p className="mt-4 max-w-md text-base leading-7 text-brand-deep/72">
                Hospitals, care homes, and community spaces across the Dallas
                area that have opened their doors to us.
              </p>

              {/* One connected panel — rows are divided, not detached. */}
              <ul className="mt-8 overflow-hidden rounded-[1.75rem] border border-brand-rose/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(255,248,244,0.95)_100%)] shadow-[0_16px_50px_rgba(201,116,143,0.08)]">
                {locations.map((location) => (
                  <li
                    key={location.name}
                    className="border-b border-brand-rose/30 last:border-b-0"
                  >
                    <a
                      href={location.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-start gap-4 px-5 py-4 transition duration-300 ease-out hover:bg-brand-pink/30 focus-visible:bg-brand-pink/30 focus-visible:outline-none"
                    >
                      <span
                        className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-deep/45 transition group-hover:bg-brand-deep"
                        aria-hidden="true"
                      />
                      <span className="text-base leading-7 text-brand-deep/85 transition group-hover:text-brand-deep">
                        {location.name}
                      </span>
                      <ArrowUpRight
                        className="ml-auto mt-1.5 h-4 w-4 shrink-0 text-brand-deep/35 transition duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-deep/70"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Right — the headline stat */}
            <div>
              <motion.div
                ref={statRef}
                variants={fadeUp}
                className="relative overflow-hidden rounded-[2.5rem] border border-brand-rose/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.84)_0%,rgba(255,248,244,0.96)_100%)] p-8 text-center shadow-[0_28px_90px_rgba(201,116,143,0.12)] sm:p-10"
              >
                <div className="pointer-events-none absolute left-1/2 top-0 h-52 w-52 -translate-x-1/2 -translate-y-1/3 rounded-full bg-brand-pink/50 blur-3xl" />

                <div className="relative">
                  <p className="text-sm uppercase tracking-[0.3em] text-brand-deep/62 sm:text-base">
                    Patients uplifted
                  </p>
                  <p className="mt-4 font-display text-7xl leading-none tracking-[-0.04em] text-brand-deep sm:text-8xl lg:text-[7rem]">
                    {patients.toLocaleString()}
                    <span aria-hidden="true">+</span>
                  </p>
                  <p className="mx-auto mt-5 max-w-sm text-base leading-7 text-brand-deep/72">
                    Patients, families, and caregivers who have heard live music
                    from a Heartstrings ensemble.
                  </p>

                  <div className="mt-8 rounded-[1.75rem] border border-brand-rose/40 bg-brand-pink/45 px-6 py-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-brand-deep/55">
                      Raised for care and outreach
                    </p>
                    <p className="mt-3 font-display text-4xl text-brand-deep sm:text-5xl">
                      ${raised.toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>

          {/* Full width, centered on the page — not tucked into a column. */}
          <motion.div
            variants={fadeUp}
            className="mx-auto mt-16 max-w-5xl lg:mt-24"
          >
            {/* Fluid size so the title holds one line at every width. */}
            <h3 className="whitespace-nowrap text-center font-display text-[clamp(1.4rem,5vw,3.5rem)] leading-tight text-brand-deep">
              Special events &amp; collaborations
            </h3>

            {featured ? (
              <div className="mt-10">
                <h4 className="text-center text-xs font-medium uppercase tracking-[0.34em] text-brand-deep/55">
                  Featured
                </h4>
                <div className="mx-auto mt-6 max-w-xl">
                  <EventCard event={featured} />
                </div>
              </div>
            ) : null}

            <EventSection heading="Upcoming" events={upcoming} />
            <EventSection heading="Past" events={past} />

            <p className="mt-8 text-center text-sm leading-7 text-brand-deep/60">
              More collaborations are in the works — check back soon.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
