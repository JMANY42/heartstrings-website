import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

// The photo of the pair and the words are the founders file's; who the
// founders are comes with them, read off the roster in `musicians.ts` so a
// name is only ever written in one place.
import {
  founders,
  foundersPhoto,
  missionStatement,
  musiciansPath,
} from '@/data/founders'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: 'easeOut' },
  },
}

/** The note from the founders — the foot of the about section, not a section
    of its own: the photo of the pair beside their words, signed by whoever the
    roster marks as a founder. */
export function FoundersNote() {
  return (
    <motion.div
      id="founders"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.14 } } }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      className="mt-24 lg:mt-32"
    >
      <motion.h3
        variants={fadeUp}
        className="font-display text-2xl text-brand-deep sm:text-3xl"
      >
        Founders
      </motion.h3>

      <div className="mt-12 grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        {/* Left — the photo of the two of them. */}
        {foundersPhoto.src ? (
          <motion.div
            variants={fadeUp}
            className="overflow-hidden rounded-[2.5rem] border border-brand-rose/45 bg-white shadow-[0_28px_90px_rgba(201,116,143,0.16)]"
          >
            <img
              src={foundersPhoto.src}
              alt={foundersPhoto.alt}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover object-center lg:aspect-[3/2]"
            />
          </motion.div>
        ) : null}

        {/* Right — their words, in their own voice, signed underneath. */}
        <motion.div variants={fadeUp}>
          <h4 className="font-display text-3xl text-brand-deep sm:text-4xl">
            Why we started Heartstrings
          </h4>

          <blockquote className="mt-6 border-l-2 border-brand-deep/20 pl-6">
            {missionStatement.map((paragraph, index) => (
              <p
                key={index}
                className="mt-6 text-lg leading-8 text-brand-deep/78 first:mt-0 sm:text-xl"
              >
                {paragraph}
              </p>
            ))}

            <footer className="mt-7 text-xs uppercase tracking-[0.24em] text-brand-deep/55">
              {/* Signed by whoever the roster marks as a founder. */}
              {founders.map((founder) => founder.name).join(' & ')}
            </footer>
          </blockquote>
        </motion.div>
      </div>

      {/* The rest of the ensemble gets a page of its own. */}
      <motion.div
        variants={fadeUp}
        className="mx-auto mt-12 max-w-3xl rounded-[1.75rem] border border-brand-rose/40 bg-brand-pink/45 p-6 text-center sm:p-7"
      >
        <p className="text-base leading-7 text-brand-deep/78">
          Heartstrings is far more than the two of us. Every performance is
          played by volunteers who give their evenings and weekends to it.
        </p>
        <a
          href={musiciansPath}
          className="group mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-brand-rose/70 bg-white/70 px-7 py-3.5 text-sm font-medium tracking-[0.18em] text-brand-deep shadow-[0_18px_50px_rgba(201,116,143,0.1)] transition duration-300 ease-out hover:-translate-y-1 hover:bg-brand-hover"
        >
          Meet our musicians
          <ArrowUpRight
            className="h-4 w-4 transition duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </a>
      </motion.div>
    </motion.div>
  )
}
