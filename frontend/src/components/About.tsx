import { motion } from 'framer-motion'

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
    <section id="about" className="px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.14 } } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.28 }}
          className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16"
        >
          <motion.div variants={fadeUp} className="space-y-6">
            <p className="text-xs font-medium uppercase tracking-[0.34em] text-brand-deep/55">
              About
            </p>
            <h2 className="font-display text-4xl leading-[0.95] tracking-[-0.03em] text-brand-deep sm:text-5xl lg:text-6xl">
              Healing with Music
            </h2>

            <p className="max-w-2xl text-lg leading-8 text-brand-deep/78 sm:text-xl">
              Heartstrings is a student-run ensemble that believes music
              belongs everywhere — especially in places of hardship. We visit
              hospitals, clinics, and care facilities to perform intimate
              chamber music for patients, families, and staff.
            </p>

            <p className="max-w-2xl text-lg leading-8 text-brand-deep/78 sm:text-xl">
              Our repertoire spans Baroque to contemporary, performed by small
              ensembles of 4–6 musicians. Every performance is free,
              volunteer-driven, and tailored to the setting.
            </p>

            <motion.blockquote
              variants={fadeUp}
              className="mt-10 max-w-xl border-l-2 border-brand-deep/20 pl-6"
            >
              <p className="font-display text-3xl italic leading-tight text-brand-deep sm:text-4xl">
                “Music gives voice to that which cannot be put into words.”
              </p>
            </motion.blockquote>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="relative overflow-hidden rounded-[2.5rem] border border-brand-rose/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(255,248,244,0.95)_100%)] p-6 shadow-[0_28px_90px_rgba(201,116,143,0.12)] sm:p-8"
          >
            <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-brand-pink/45 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/80 bg-white/55 p-6 backdrop-blur-sm sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.3em] text-brand-deep/55">
                    Heartstrings
                  </p>
                  <p className="mt-2 font-display text-2xl text-brand-deep sm:text-3xl">
                    Gentle, not distant.
                  </p>
                </div>
                <div className="h-16 w-16 shrink-0 rounded-full border border-brand-rose/55 sm:h-20 sm:w-20 bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.85),rgba(255,222,233,0.65)_40%,rgba(249,198,215,0.4)_100%)]" />
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-brand-rose/40 bg-brand-cream/85 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-brand-deep/55">
                    Ensemble size
                  </p>
                  <p className="mt-3 font-display text-3xl text-brand-deep">
                    4–6 musicians
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-brand-rose/40 bg-brand-pink/45 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-brand-deep/55">
                    Volunteer model
                  </p>
                  <p className="mt-3 font-display text-3xl text-brand-deep">
                    Always free
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-[1.75rem] border border-brand-rose/35 bg-[linear-gradient(180deg,rgba(255,255,255,0.85)_0%,rgba(255,248,244,0.92)_100%)] p-5">
                <p className="mt-4 text-sm leading-7 text-brand-deep/72">
                  Rehearsed with care, performed with sensitivity, and shaped to
                  honor the atmosphere of each room.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}