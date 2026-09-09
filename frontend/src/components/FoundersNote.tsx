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
    of its own. One centered column: a small heading, who they are, the photo
    of the pair, their words, and the way through to the rest of the
    ensemble. */
export function FoundersNote() {
  return (
    <motion.div
      id="founders"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.14 } } }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      className="mx-auto mt-24 flex max-w-3xl flex-col items-center text-center lg:mt-32"
    >
      <motion.h3
        variants={fadeUp}
        className="font-display text-2xl text-brand-deep sm:text-3xl"
      >
        Founders
      </motion.h3>

      {/* Where the two avatar rows used to be — whoever the roster marks as a
          co-founder, in the order it lists them. */}
      <motion.p
        variants={fadeUp}
        className="mt-3 text-xs font-medium uppercase tracking-[0.28em] text-brand-deep/55"
      >
        {founders.map((founder) => founder.name).join(' · ')}
      </motion.p>

      {foundersPhoto.src ? (
        <motion.div
          variants={fadeUp}
          className="mt-10 w-full overflow-hidden rounded-[2.5rem] border border-brand-rose/45 bg-white shadow-[0_28px_90px_rgba(201,116,143,0.16)]"
        >
          <img
            src={foundersPhoto.src}
            alt={foundersPhoto.alt}
            loading="lazy"
            className="aspect-[4/3] w-full object-cover object-center lg:aspect-[3/2]"
          />
        </motion.div>
      ) : null}

      {missionStatement.map((paragraph, index) => (
        <motion.p
          key={index}
          variants={fadeUp}
          className="mt-8 text-lg leading-8 text-brand-deep/78 sm:text-xl"
        >
          {paragraph}
        </motion.p>
      ))}

      {/* The rest of the ensemble gets a page of its own. */}
      <motion.p
        variants={fadeUp}
        className="mt-8 text-base leading-7 text-brand-deep/78"
      >
        Heartstrings is far more than the two of us. Every performance is
        played by volunteers who give their evenings and weekends to it.
      </motion.p>

      <motion.a
        variants={fadeUp}
        href={musiciansPath}
        className="group mt-10 inline-flex items-center justify-center gap-2 rounded-full border border-brand-rose/70 bg-white/70 px-7 py-3.5 text-sm font-medium tracking-[0.18em] text-brand-deep shadow-[0_18px_50px_rgba(201,116,143,0.1)] transition duration-300 ease-out hover:-translate-y-1 hover:bg-brand-hover"
      >
        Meet our musicians
        <ArrowUpRight
          className="h-4 w-4 transition duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </motion.a>
    </motion.div>
  )
}
