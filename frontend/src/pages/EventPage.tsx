import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

import { Gallery } from '@/components/Gallery'
import {
  detailIcons,
  type EventDetail,
  type EventSpeaker,
  type SpecialEvent,
} from '@/data/events'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: 'easeOut' },
  },
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.14 } } }

/* The page is one column, like the home page, and every section shares the home
   page's horizontal padding. The one thing that breaks out of the column is the
   highlight photo at the top, which runs nearly the full width of the screen. */
const sectionClass = 'px-6 py-14 sm:px-8 lg:px-10 lg:py-20 xl:px-14'
const columnClass = 'mx-auto max-w-3xl'
const eyebrowClass =
  'text-xs font-medium uppercase tracking-[0.34em] text-brand-deep/55'
const headingClass =
  'mt-4 font-display text-4xl leading-[0.95] tracking-[-0.03em] text-brand-deep sm:text-5xl'
const bodyClass = 'text-lg leading-8 text-brand-deep/78'

const isExternal = (href: string) => /^https?:\/\//.test(href)

export function EventPage({ event }: { event: SpecialEvent }) {
  useEffect(() => {
    document.title = `${event.title} | Heartstrings`
    window.scrollTo(0, 0)
  }, [event])

  const ticketHref = event.tickets?.href

  return (
    <article>
      {/* Title — the only thing above the highlight photo. */}
      <section className="px-6 pb-8 pt-32 text-center sm:px-8 lg:px-10 lg:pb-10 xl:px-14">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-4xl"
        >
          {event.eyebrow ? (
            <motion.p variants={fadeUp} className={eyebrowClass}>
              {event.eyebrow}
            </motion.p>
          ) : null}
          <motion.h1
            variants={fadeUp}
            className="mt-5 font-display text-[clamp(2.5rem,9vw,3.25rem)] leading-[0.95] tracking-[-0.04em] text-brand-deep sm:text-6xl lg:text-7xl"
          >
            {event.title}
          </motion.h1>
          {/* Whose evening this is — the two names, always in this order. */}
          <motion.p
            variants={fadeUp}
            className="mt-4 text-sm font-medium uppercase tracking-[0.26em] text-brand-deep/60 sm:text-base"
          >
            Heartstrings &times; {event.collaborator.name}
          </motion.p>
          {event.tagline ? (
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-brand-deep/72 sm:text-xl"
            >
              {event.tagline}
            </motion.p>
          ) : null}
        </motion.div>
      </section>

      {/* Highlight photo — a wide rectangle just inside the edges of the
          screen, so it reads as the banner for everything under it. */}
      {event.highlight.src ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          className="px-3 sm:px-5 lg:px-6"
        >
          <div className="mx-auto aspect-[16/10] w-full overflow-hidden rounded-[1.75rem] border border-brand-rose/40 bg-white shadow-[0_28px_90px_rgba(201,116,143,0.16)] sm:aspect-[2/1] lg:aspect-[21/9] lg:rounded-[2.5rem]">
            <img
              src={event.highlight.src}
              alt={event.highlight.alt}
              className="h-full w-full object-cover object-center"
            />
          </div>
        </motion.div>
      ) : null}

      {/* Who we are working with */}
      <section className={sectionClass}>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className={columnClass}
        >
          <motion.p variants={fadeUp} className={eyebrowClass}>
            Collaboration
          </motion.p>
          <motion.h2 variants={fadeUp} className={headingClass}>
            {event.collaborator.name}
          </motion.h2>

          {event.collaborator.body.map((paragraph, index) => (
            <motion.p key={index} variants={fadeUp} className={`mt-6 ${bodyClass}`}>
              {paragraph}
            </motion.p>
          ))}

          {event.collaborator.href ? (
            <motion.a
              variants={fadeUp}
              href={event.collaborator.href}
              target="_blank"
              rel="noreferrer"
              className="group mt-7 inline-flex items-center gap-2 text-sm font-medium tracking-[0.14em] text-brand-deep/70 transition hover:text-brand-deep"
            >
              Visit {event.collaborator.name}
              <ArrowUpRight
                className="h-4 w-4 transition duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </motion.a>
          ) : null}
        </motion.div>
      </section>

      {/* Objective */}
      <section className={sectionClass}>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className={columnClass}
        >
          <motion.p variants={fadeUp} className={eyebrowClass}>
            Objective
          </motion.p>
          <motion.h2 variants={fadeUp} className={headingClass}>
            Our reason why
          </motion.h2>

          {event.objective.map((paragraph, index) => (
            <motion.p key={index} variants={fadeUp} className={`mt-6 ${bodyClass}`}>
              {paragraph}
            </motion.p>
          ))}
        </motion.div>
      </section>

      {/* Event details — rows, tickets, and the speakers, all driven by the
          event's own data so no two events have to carry the same fields. */}
      <section className={sectionClass}>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className={columnClass}
        >
          <motion.p variants={fadeUp} className={eyebrowClass}>
            Event details
          </motion.p>
          <motion.h2 variants={fadeUp} className={headingClass}>
            Where and when
          </motion.h2>

          {event.details.length > 0 ? (
            <motion.dl
              variants={fadeUp}
              className="mt-8 overflow-hidden rounded-[1.75rem] border border-brand-rose/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(255,248,244,0.95)_100%)] shadow-[0_16px_50px_rgba(201,116,143,0.08)]"
            >
              {event.details.map((detail, index) => (
                <DetailRow key={`${detail.label}-${index}`} detail={detail} />
              ))}
            </motion.dl>
          ) : null}

          {event.tickets ? (
            <motion.div variants={fadeUp} className="mt-8">
              {ticketHref ? (
                <a
                  href={ticketHref}
                  target={isExternal(ticketHref) ? '_blank' : undefined}
                  rel={isExternal(ticketHref) ? 'noreferrer' : undefined}
                  className="inline-flex items-center justify-center rounded-full bg-brand-cta px-7 py-3.5 text-sm font-medium tracking-[0.18em] text-brand-ink shadow-[0_18px_45px_rgba(224,143,169,0.32)] transition duration-300 ease-out hover:-translate-y-1 hover:bg-brand-cta-hover hover:shadow-[0_22px_55px_rgba(216,121,151,0.42)]"
                >
                  {event.tickets.label ?? 'Buy tickets'}
                </a>
              ) : (
                <p className="inline-flex items-center rounded-full border border-brand-rose/55 bg-white/65 px-6 py-3 text-sm font-medium tracking-[0.14em] text-brand-deep/70">
                  {event.tickets.label ?? 'Tickets coming soon'}
                </p>
              )}

              {event.tickets.note ? (
                <p className="mt-3 text-sm leading-7 text-brand-deep/60">
                  {event.tickets.note}
                </p>
              ) : null}
            </motion.div>
          ) : null}

          {event.speakers && event.speakers.length > 0 ? (
            <motion.div variants={fadeUp} className="mt-14">
              <h3 className="font-display text-3xl text-brand-deep sm:text-4xl">
                Guest speakers
              </h3>

              <ul className="mt-6 space-y-4">
                {event.speakers.map((speaker, index) => (
                  <li key={`${speaker.name}-${index}`}>
                    <SpeakerCard speaker={speaker} />
                  </li>
                ))}
              </ul>
            </motion.div>
          ) : null}
        </motion.div>
      </section>

      {/* Photos — the home page rail, without its heading. */}
      <Gallery
        id="photos"
        items={event.photos}
        eyebrow="Photos"
        heading={null}
        label="Event photos, scroll horizontally to see more"
      />
    </article>
  )
}

function DetailRow({ detail }: { detail: EventDetail }) {
  const Icon = detail.icon ? detailIcons[detail.icon] : null
  const lines = Array.isArray(detail.value) ? detail.value : [detail.value]

  const value = (
    <div className="space-y-1">
      {lines.map((line, index) => (
        <p key={index} className="text-base leading-7 text-brand-deep/85">
          {line}
        </p>
      ))}
    </div>
  )

  return (
    <div className="flex items-start gap-4 border-b border-brand-rose/30 px-5 py-5 last:border-b-0 sm:gap-5 sm:px-6">
      {Icon ? (
        <Icon
          className="mt-1 h-5 w-5 shrink-0 text-brand-deep/45"
          aria-hidden="true"
        />
      ) : null}

      <div className="min-w-0">
        <dt className="text-xs uppercase tracking-[0.24em] text-brand-deep/55">
          {detail.label}
        </dt>
        <dd className="mt-2">
          {detail.href ? (
            <a
              href={detail.href}
              target={isExternal(detail.href) ? '_blank' : undefined}
              rel={isExternal(detail.href) ? 'noreferrer' : undefined}
              className="group inline-flex items-start gap-1.5 transition hover:text-brand-deep"
            >
              {value}
              <ArrowUpRight
                className="mt-1.5 h-4 w-4 shrink-0 text-brand-deep/35 transition duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-deep/70"
                aria-hidden="true"
              />
            </a>
          ) : (
            value
          )}

          {detail.note ? (
            <p className="mt-2 text-sm leading-6 text-brand-deep/60">{detail.note}</p>
          ) : null}
        </dd>
      </div>
    </div>
  )
}

function SpeakerCard({ speaker }: { speaker: EventSpeaker }) {
  const body = (
    <>
      <p className="font-display text-2xl text-brand-deep sm:text-3xl">
        {speaker.name}
      </p>
      {speaker.role ? (
        <p className="mt-2 text-xs uppercase tracking-[0.24em] text-brand-deep/55">
          {speaker.role}
        </p>
      ) : null}
      {speaker.bio ? (
        <p className="mt-4 text-base leading-7 text-brand-deep/75">{speaker.bio}</p>
      ) : null}
    </>
  )

  const cardClass =
    'block rounded-[1.75rem] border border-brand-rose/40 bg-white/70 p-6 shadow-[0_16px_50px_rgba(201,116,143,0.08)] sm:p-7'

  if (!speaker.href) {
    return <div className={cardClass}>{body}</div>
  }

  return (
    <a
      href={speaker.href}
      target={isExternal(speaker.href) ? '_blank' : undefined}
      rel={isExternal(speaker.href) ? 'noreferrer' : undefined}
      className={`group ${cardClass} transition duration-300 ease-out hover:-translate-y-1 hover:bg-white/90 focus-visible:-translate-y-1 focus-visible:outline-none`}
    >
      {body}
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium tracking-[0.14em] text-brand-deep/70 transition group-hover:text-brand-deep">
        Read more
        <ArrowUpRight
          className="h-4 w-4 transition duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </a>
  )
}

/** Shown for a `/events/...` URL that no entry in `events.ts` answers to. */
export function EventNotFound() {
  useEffect(() => {
    document.title = 'Event not found | Heartstrings'
  }, [])

  return (
    <section className="px-6 pb-24 pt-40 text-center sm:px-8 lg:px-10 xl:px-14">
      <div className="mx-auto max-w-2xl">
        <p className={eyebrowClass}>Special events</p>
        <h1 className="mt-5 font-display text-5xl leading-[0.95] tracking-[-0.04em] text-brand-deep sm:text-6xl">
          We couldn’t find that event
        </h1>
        <p className="mt-6 text-lg leading-8 text-brand-deep/72">
          The link may be out of date. Our collaborations are listed on the home
          page.
        </p>
        <a
          href="/#impact"
          className="mt-10 inline-flex items-center justify-center rounded-full border border-brand-rose/70 bg-white/55 px-7 py-3.5 text-sm font-medium tracking-[0.18em] text-brand-deep transition duration-300 ease-out hover:-translate-y-1 hover:bg-brand-hover"
        >
          See our events
        </a>
      </div>
    </section>
  )
}
