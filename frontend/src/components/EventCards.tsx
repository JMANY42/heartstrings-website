import { ArrowUpRight } from 'lucide-react'

// The cards here are the same events the /events/<slug> pages are built from,
// so a card and its page can never say different things. Both the Impact
// section on the home page and the /events page draw from this file, so the
// two never drift apart either.
import type { SpecialEvent } from '@/data/events'

/** Every event card looks the same — the sections around them say which is
    which, so the card itself carries no badge. */
export function EventCard({ event }: { event: SpecialEvent }) {
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
export function EventSection({
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

/** The featured event on its own, centered above the rest. */
export function FeaturedEvent({ event }: { event: SpecialEvent }) {
  return (
    <div className="mt-10">
      <h4 className="text-center text-xs font-medium uppercase tracking-[0.34em] text-brand-deep/55">
        Featured
      </h4>
      <div className="mx-auto mt-6 max-w-xl">
        <EventCard event={event} />
      </div>
    </div>
  )
}
