import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const testimonials = [
  {
    quote:
      'They played in the hallway outside my mother’s room for twenty minutes. It was the first time all week she asked to sit up and listen.',
    name: 'Dana Whitfield',
    role: 'Family member, oncology ward',
  },
  {
    quote:
      'Our patients talked about that afternoon for days. The students read the room beautifully — soft where it needed to be, never intrusive.',
    name: 'Marcus Ibe',
    role: 'Charge nurse, St. Alden Medical',
  },
  {
    quote:
      'I have worked in palliative care for eleven years. I have rarely seen a room settle the way it did when the quartet began.',
    name: 'Dr. Priya Raghavan',
    role: 'Palliative care physician',
  },
  {
    quote:
      'Playing for someone six feet away, on the hardest day of their life, changed how I hear my own instrument.',
    name: 'Elena Marchetti',
    role: 'Violinist, Heartstrings',
  },
  {
    quote:
      'They arrived early, set up without a fuss, and left the lounge warmer than they found it. We ask them back every season.',
    name: 'Tom Bergstrom',
    role: 'Activities director, Rosewood Care',
  },
  {
    quote:
      'My father had not spoken much in months. He hummed along to the Bach. I will not forget that sound.',
    name: 'Ayesha Karim',
    role: 'Family member, Rosewood Care',
  },
] as const

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const card = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: 'easeOut' },
  },
}

// Wheel deltas arrive in pixels, lines or pages depending on the browser.
const LINE_HEIGHT = 16

export function Testimonials() {
  const railRef = useRef<HTMLUListElement>(null)

  // Turn a vertical wheel over the rail into horizontal scrolling. The gesture
  // is only swallowed when the rail actually moved, so at either end — or if
  // anything ever refuses the scroll — the page keeps scrolling normally and
  // the reader is never trapped inside the section.
  useEffect(() => {
    const rail = railRef.current

    if (!rail) {
      return
    }

    const handleWheel = (event: WheelEvent) => {
      const maxScroll = rail.scrollWidth - rail.clientWidth

      // Nothing overflowing: leave the page scroll alone.
      if (maxScroll <= 0) {
        return
      }

      // Browsers latch a continuous wheel gesture to the element it started
      // over, so events keep arriving after the rail has scrolled past the
      // pointer. Re-check the pointer against the rail on every event.
      const bounds = rail.getBoundingClientRect()

      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      ) {
        return
      }

      // A deliberate horizontal gesture (trackpad, tilt wheel) already works.
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        return
      }

      const delta =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? event.deltaY * LINE_HEIGHT
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? event.deltaY * rail.clientWidth
            : event.deltaY

      const before = rail.scrollLeft
      rail.scrollLeft = before + delta

      if (rail.scrollLeft !== before) {
        event.preventDefault()
      }
    }

    rail.addEventListener('wheel', handleWheel, { passive: false })

    return () => rail.removeEventListener('wheel', handleWheel)
  }, [])

  return (
    <section id="testimonials" className="px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="mb-10 max-w-3xl"
        >
          <p className="text-xs font-medium uppercase tracking-[0.34em] text-brand-deep/55">
            Testimonials
          </p>
          <h2 className="mt-4 font-display text-4xl leading-[0.95] tracking-[-0.03em] text-brand-deep sm:text-5xl lg:text-6xl">
            Words from the rooms we visit
          </h2>
        </motion.div>

        <motion.ul
          ref={railRef}
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          tabIndex={0}
          aria-label="Testimonials, scroll horizontally to see more"
          className="testimonial-rail -mx-6 -mt-3 flex list-none flex-row gap-5 overflow-x-auto px-6 pb-6 pt-3 sm:-mx-8 sm:px-8 md:mx-0 md:px-0"
        >
          {testimonials.map((testimonial) => (
            <motion.li
              key={testimonial.name}
              variants={card}
              className="flex shrink-0 flex-col rounded-[2rem] border border-brand-rose/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(255,248,244,0.95)_100%)] w-[80vw] p-7 shadow-[0_24px_70px_rgba(201,116,143,0.11)] transition-transform duration-500 sm:w-[20rem] md:w-[22rem] md:hover:-translate-y-1 lg:w-[24rem]"
            >
              <p
                className="font-display text-5xl leading-none text-brand-deep/30"
                aria-hidden="true"
              >
                “
              </p>

              <blockquote className="mt-2 flex-1 text-lg leading-8 text-brand-deep/78">
                {testimonial.quote}
              </blockquote>

              <div className="mt-7 border-t border-brand-rose/40 pt-5">
                <p className="font-display text-2xl text-brand-deep">
                  {testimonial.name}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.24em] text-brand-deep/55">
                  {testimonial.role}
                </p>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
