import { motion } from 'framer-motion'

import { FoundersNote } from '@/components/FoundersNote'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: 'easeOut' },
  },
}

export function About() {
  return (
    <section id="about" className="px-6 py-20 sm:px-8 lg:px-10 lg:py-28 xl:px-14">
      <div className="mx-auto max-w-shell">
        {/* The title sits flush with the section's left edge, the way every
            other section's does; the copy underneath stays a centered column,
            and the founders follow it. */}
        <motion.div
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.14 } } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.28 }}
          className="flex flex-col"
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-medium uppercase tracking-[0.34em] text-brand-deep/55"
          >
            About
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="mt-6 font-display text-4xl leading-[0.95] tracking-[-0.03em] text-brand-deep sm:text-5xl lg:text-6xl"
          >
            Healing with Music
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-3xl text-center text-lg leading-8 text-brand-deep/78 sm:text-xl"
          >
            Heartstrings is a student-run ensemble that believes music belongs
            everywhere — especially in places of hardship. We visit hospitals,
            clinics, and care facilities to perform intimate chamber music for
            patients, families, and staff.
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-3xl text-center text-lg leading-8 text-brand-deep/78 sm:text-xl"
          >
            Our repertoire spans Baroque to contemporary, performed by small
            ensembles of 4–6 musicians. Every performance is free,
            volunteer-driven, and tailored to the setting.
          </motion.p>

          <motion.blockquote variants={fadeUp} className="mx-auto mt-10 max-w-xl text-center">
            <p className="font-display text-3xl italic leading-tight text-brand-deep sm:text-4xl">
              “Music gives voice to that which cannot be put into words.”
            </p>
          </motion.blockquote>
        </motion.div>

        {/* The founders, at the foot of the same section. */}
        <FoundersNote />
      </div>
    </section>
  )
}
