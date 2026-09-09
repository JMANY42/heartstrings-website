import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

// The photo, the names, and the mission statement all come from one file, so
// the founders can rewrite their own words without this component changing.
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

export function Founders() {
  return (
    <section id="founders" className="px-6 py-20 sm:px-8 lg:px-10 lg:py-28 xl:px-14">
      <div className="mx-auto max-w-shell">
        <motion.div
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.14 } } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-medium uppercase tracking-[0.34em] text-brand-deep/55"
          >
            Founders
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="mt-4 font-display text-4xl leading-[0.95] tracking-[-0.03em] text-brand-deep sm:text-5xl lg:text-6xl"
          >
            The two who started it
          </motion.h2>

          <div className="mt-12 grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            {/* Left — the photo of the two of them, and their names under it. */}
            <motion.div variants={fadeUp}>
              {foundersPhoto.src ? (
                <div className="overflow-hidden rounded-[2.5rem] border border-brand-rose/45 bg-white shadow-[0_28px_90px_rgba(201,116,143,0.16)]">
                  <img
                    src={foundersPhoto.src}
                    alt={foundersPhoto.alt}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover object-center lg:aspect-[3/2]"
                  />
                </div>
              ) : null}

              {/* One connected panel, like the locations list above it. */}
              <ul className="mt-6 overflow-hidden rounded-[1.75rem] border border-brand-rose/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(255,248,244,0.95)_100%)] shadow-[0_16px_50px_rgba(201,116,143,0.08)]">
                {founders.map((founder, index) => (
                  <li
                    key={`${founder.name}-${index}`}
                    className="border-b border-brand-rose/30 px-5 py-4 last:border-b-0"
                  >
                    <p className="font-display text-2xl text-brand-deep sm:text-3xl">
                      {founder.name}
                    </p>
                    {founder.role ? (
                      <p className="mt-1.5 text-xs uppercase tracking-[0.24em] text-brand-deep/55">
                        {founder.role}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Right — the mission statement, in their words. */}
            <motion.div variants={fadeUp}>
              <h3 className="font-display text-3xl text-brand-deep sm:text-4xl">
                Why we started Heartstrings
              </h3>

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
                  {/* Signed by whoever the founders file lists. */}
                  {founders.map((founder) => founder.name).join(' & ')}
                </footer>
              </blockquote>

              {/* The rest of the ensemble gets a page of its own. */}
              <div className="mt-10 rounded-[1.75rem] border border-brand-rose/40 bg-brand-pink/45 p-6 sm:p-7">
                <p className="text-base leading-7 text-brand-deep/78">
                  Heartstrings is far more than the two of us. Every performance
                  is played by volunteers who give their evenings and weekends
                  to it.
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
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
