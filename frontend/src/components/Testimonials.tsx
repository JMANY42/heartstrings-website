import { useMemo, useRef } from 'react'
import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'

import { useBoxSize } from '../hooks/useBoxSize'
import { useCircleTextFit } from '../hooks/useCircleTextFit'
import { fitTextToCircle, layoutCircleCloud } from '../lib/circleCloud'

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
  {
    quote:
      'My father had not spoken much in months. He hummed along to the Bach. I will not forget that sound.',
    name: 'Ayesha Karim',
    role: 'Family member, Rosewood Care',
  },
  {
    quote:
      'My father had not spoken much in months. He hummed along to the Bach. I will not forget that sound.',
    name: 'Ayesha Karim',
    role: 'Family member, Rosewood Care',
  },
  {
    quote:
      'My father had not spoken much in months. He hummed along to the Bach. I will not forget that sound.',
    name: 'Ayesha Karim',
    role: 'Family member, Rosewood Care',
  }, {
    quote:
      'My father had not spoken much in months. He hummed along to the Bach. I will asdf asdfasdf not forget that sound.',
    name: 'Ayesha Karim',
    role: 'Family member, Rosewood Care',
  }, {
    quote:
      'My father had not spoken much in months. He hummed along to the Bach. I will asdf asdfasdf not forget that sound.',
    name: 'Ayesha Karim',
    role: 'Family member, Rosewood Care',
  },{
    quote:
      'My father had not spoken much in months. He hummed along to the Bach. I will not forget that sound.',
    name: 'Ayesha Karim',
    role: 'Family member, Rosewood Care',
  }

] as const

// The shape of the screen assumed before one has been measured. Landscape,
// because most of them are.
const ASSUMED_ASPECT = 1.5

// Rounds the measured shape of the screen, so that dragging a window edge does
// not repack the cloud for every pixel.
const ASPECT_QUANTUM = 50

// The most circles the cloud will ever draw. Past this the quotes are still in
// the file, but the cloud stops: more than ten and they are too small to read
// and too many to take in.
const MAX_BUBBLES = 15

const shown = testimonials.slice(0, MAX_BUBBLES)

// The attribution is set at 58% of the quote's size — small enough to stay
// subordinate, large enough to read where there is room for it — so each of its
// characters takes about a third of the area one of the quote's does.
const ATTRIBUTION_SCALE = 0.58
const ATTRIBUTION_WEIGHT = ATTRIBUTION_SCALE * ATTRIBUTION_SCALE

// The whole cloud animates in together, so the stagger has to shorten as the
// count grows or the last circle arrives long after the reader has looked away.
const ENTRANCE = 1.2

const card = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: 'easeOut' },
  },
}

export function Testimonials() {
  const frameRef = useRef<HTMLDivElement>(null)
  const cloudRef = useRef<HTMLDivElement>(null)

  // The circles are sized for the shape of the space they are going into, so
  // the packing has to be redone when the window changes it. The frame is
  // measured rather than the cloud, because the cloud's own size is set from
  // the answer.
  const frame = useBoxSize(frameRef)
  const aspect = useMemo(() => {
    if (frame.width === 0 || frame.height === 0) {
      return ASSUMED_ASPECT
    }

    return (
      Math.round((frame.width / frame.height) * ASPECT_QUANTUM) / ASPECT_QUANTUM
    )
  }, [frame])

  const cloud = useMemo(
    () => layoutCircleCloud(shown.length, aspect),
    [aspect],
  )

  // The largest box of the packed cluster's shape that fits. Nothing is
  // stretched to reach the edges; the slack becomes margin, and the flex row
  // around it does the centring.
  const width = Math.min(frame.width, frame.height * cloud.aspect)

  const items = useMemo(() => {
    const sizes = cloud.circles.map((circle) => circle.size)
    const smallest = Math.min(...sizes)
    const largest = Math.max(...sizes)

    return shown.map((testimonial, index) => {
      const circle = cloud.circles[index]

      // Where this circle sits in the size range, 0 for the outermost and 1 for
      // the one nearest the title. Everything else about a quote — its
      // typeface, how dark it is set, how firm its ring is — reads off this one
      // number, so the cloud has a front and a back rather than N equal voices.
      const depth =
        largest === smallest ? 1 : (circle.size - smallest) / (largest - smallest)
      const attribution = `${testimonial.name} · ${testimonial.role}`

      // The nearer half of the cloud is set in the display serif, which is
      // narrower than the sans and so fills its circle at a larger size.
      const face = depth > 0.5 ? 'display' : 'sans'

      return {
        ...testimonial,
        attribution,
        circle,
        quoteSize: fitTextToCircle(
          testimonial.quote.length + attribution.length * ATTRIBUTION_WEIGHT,
          face,
        ),
        className: [
          face === 'display' ? 'font-display' : 'font-sans',
          depth > 0.66
            ? 'border-brand-rose/55 text-brand-deep'
            : depth > 0.33
              ? 'border-brand-rose/45 text-brand-deep/85'
              : 'border-brand-rose/35 text-brand-deep/65',
        ].join(' '),
      }
    })
  }, [cloud])

  const container = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: Math.min(0.12, ENTRANCE / shown.length),
        },
      },
    }),
    [],
  )

  // The sizes above are a starting point; this trims them to what the fonts
  // actually measure.
  useCircleTextFit(cloudRef, `${items.length}:${aspect}`)

  if (items.length === 0) {
    return null
  }

  // Exactly one screen tall, less the fixed navbar across the top, so the title
  // lands in the middle of what the reader can actually see and no circle is
  // ever cut off by an edge.
  return (
    <section
      id="testimonials"
      className="flex h-[100svh] w-full items-center justify-center px-3 pb-3 pt-[4.75rem] sm:px-5 sm:pb-5"
    >
      <div
        ref={frameRef}
        className="flex h-full w-full items-center justify-center"
      >
        <motion.div
          ref={cloudRef}
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="cloud"
          style={{ width, height: width / cloud.aspect }}
        >
          <motion.div
            variants={card}
            className="cloud-title text-center"
            style={{ '--w': `${cloud.titleWidth}%` } as CSSProperties}
          >
            <p className="font-medium uppercase tracking-[0.34em] text-brand-deep/55 text-[clamp(0.5rem,2.4cqw,0.75rem)]">
              Testimonials
            </p>
            <h2 className="mt-[0.35em] font-display leading-[0.95] tracking-[-0.03em] text-brand-deep text-[clamp(0.85rem,13cqw,5rem)]">
              Words from the patients we visit
            </h2>
          </motion.div>

          {/* Keyed by position: the same person can leave more than one quote,
              so a name is not a unique key. */}
          {items.map((testimonial, index) => (
            <motion.figure
              key={index}
              variants={card}
              data-circle
              className={`cloud-circle flex aspect-square items-center justify-center rounded-full border bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(255,248,244,0.95)_100%)] text-center shadow-[0_24px_70px_rgba(201,116,143,0.11)] transition-shadow duration-500 hover:shadow-[0_30px_80px_rgba(201,116,143,0.2)] ${testimonial.className}`}
              style={
                {
                  '--x': `${testimonial.circle.left}%`,
                  '--y': `${testimonial.circle.top}%`,
                  '--d': `${testimonial.circle.size}%`,
                } as CSSProperties
              }
            >
              <div
                data-circle-text
                className="change mx-auto w-fit max-w-[72cqw]"
                style={{ fontSize: `${testimonial.quoteSize}cqw` }}
              >
                <blockquote className="leading-[1.3] hyphens-auto">
                  “{testimonial.quote}”
                </blockquote>

                <figcaption
                  className="mt-[0.9em] font-sans uppercase leading-[1.4] tracking-[0.18em] text-brand-deep/55"
                  style={{ fontSize: `${ATTRIBUTION_SCALE}em` }}
                >
                  {testimonial.attribution}
                </figcaption>
              </div>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
