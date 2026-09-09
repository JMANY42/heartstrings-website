import { motion } from 'framer-motion'

import { FoundersNote } from '@/components/FoundersNote'
import { aboutPhoto } from '@/data/about'

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
            other section's does, and the copy underneath starts on the same
            line with a photo beside it. */}
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

          {/* The founders' pairing below, mirrored: the columns are the same
              two fractions the other way round and the gap is the same, so the
              photo lands in a column the width of theirs. Cropped the same way
              too — see the classes on the image — which is what makes the two
              pictures come out the same size down the page. */}
          <div className="mt-12 grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
            {/* Left — the copy, and the quote it closes on. */}
            <motion.div variants={fadeUp}>
              <p className="text-lg leading-8 text-brand-deep/78 sm:text-xl">
                Heartstrings is a student-run ensemble that believes music
                belongs everywhere — especially in places of hardship. We visit
                hospitals, clinics, and care facilities to perform intimate
                chamber music for patients, families, and staff.
              </p>

              <p className="mt-6 text-lg leading-8 text-brand-deep/78 sm:text-xl">
                Our repertoire spans Baroque to contemporary, performed by small
                ensembles of 4–6 musicians. Every performance is free,
                volunteer-driven, and tailored to the setting.
              </p>

              <blockquote className="mt-10 max-w-xl">
                <p className="font-display text-3xl italic leading-tight text-brand-deep sm:text-4xl">
                  “Music gives voice to that which cannot be put into words.”
                </p>
              </blockquote>
            </motion.div>

            {/* Right — the photo. */}
            {aboutPhoto.src ? (
              <motion.div
                variants={fadeUp}
                className="overflow-hidden rounded-[2.5rem] border border-brand-rose/45 bg-white shadow-[0_28px_90px_rgba(201,116,143,0.16)]"
              >
                <img
                  src={aboutPhoto.src}
                  alt={aboutPhoto.alt}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover object-center lg:aspect-[3/2]"
                />
              </motion.div>
            ) : null}
          </div>
        </motion.div>

        {/* The founders, at the foot of the same section. */}
        <FoundersNote />
      </div>
    </section>
  )
}
