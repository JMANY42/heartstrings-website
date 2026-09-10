import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

// The same cards, in the same groups, as the Impact section on the home page
// — this page just gives them room of their own.
import { EventSection, FeaturedEvent } from '@/components/EventCards'
import { groupEvents, specialEvents } from '@/data/events'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: 'easeOut' },
  },
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }

export function EventsPage() {
  const { featured, upcoming, past } = groupEvents(specialEvents)

  useEffect(() => {
    document.title = 'Special events | Heartstrings'
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
            Special events
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="mt-5 font-display text-[clamp(2.5rem,9vw,3.25rem)] leading-[0.95] tracking-[-0.04em] text-brand-deep sm:text-6xl lg:text-7xl"
          >
            Events &amp; collaborations
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-brand-deep/72 sm:text-xl"
          >
            Beyond our regular visits, we partner with organizations that share
            our belief in what music can do — every event we have played
            together, and every one still to come, is here.
          </motion.p>
        </motion.div>
      </section>

      {/* The events */}
      <section className="px-6 py-14 sm:px-8 lg:px-10 lg:py-20 xl:px-14">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          className="mx-auto max-w-5xl"
        >
          {featured ? <FeaturedEvent event={featured} /> : null}

          <EventSection heading="Upcoming" events={upcoming} />
          <EventSection heading="Past" events={past} />

          {!featured && !upcoming.length && !past.length ? (
            <p className="text-center text-base leading-8 text-brand-deep/72">
              Nothing on the calendar yet.
            </p>
          ) : null}
        </motion.div>

        <p className="mt-14 text-center text-base leading-8 text-brand-deep/72">
          More collaborations are in the works. Have one in mind?{' '}
          <a
            href="/#collaborate"
            className="group inline-flex items-center gap-1.5 text-brand-deep underline decoration-brand-rose decoration-2 underline-offset-4 transition hover:decoration-brand-deep"
          >
            Work with us
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
