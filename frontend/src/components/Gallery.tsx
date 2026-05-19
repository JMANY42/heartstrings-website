import { motion } from 'framer-motion'

const galleryItems = [
  {
    seed: 'melody',
    caption: 'A phrase lifted softly into the room.',
    className: 'md:col-span-3 md:row-span-2',
  },
  {
    seed: 'violin',
    caption: 'A violin line held like a private conversation.',
    className: 'md:col-span-3',
  },
  {
    seed: 'concert',
    caption: 'Small concerts shaped around patient comfort.',
    className: 'md:col-span-2',
  },
  {
    seed: 'ensemble',
    caption: 'Listening becomes the first instrument.',
    className: 'md:col-span-2 md:row-span-2',
  },
  {
    seed: 'music',
    caption: 'Warm harmonies and a quiet sense of arrival.',
    className: 'md:col-span-2',
  },
  {
    seed: 'strings',
    caption: 'Strings that meet the ear with tenderness.',
    className: 'md:col-span-4',
  },
  {
    seed: 'quartet',
    caption: 'Quartet textures turning into calm.',
    className: 'md:col-span-2',
  },
  {
    seed: 'notes',
    caption: 'Notes that linger with the people who need them.',
    className: 'md:col-span-2',
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

export function Gallery() {
  return (
    <section id="gallery" className="px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="mb-10 max-w-3xl"
        >
          <p className="text-xs font-medium uppercase tracking-[0.34em] text-brand-deep/55">
            Gallery
          </p>
          <h2 className="mt-4 font-display text-4xl leading-[0.95] tracking-[-0.03em] text-brand-deep sm:text-5xl lg:text-6xl">
            Moments from the room
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid auto-rows-[190px] gap-5 md:grid-cols-6 md:auto-rows-[170px]"
        >
          {galleryItems.map((item) => (
            <motion.article
              key={item.seed}
              variants={card}
              className={`group relative overflow-hidden rounded-[2rem] border border-brand-rose/35 bg-white shadow-[0_24px_70px_rgba(201,116,143,0.11)] ${item.className}`}
            >
              <img
                src={`https://picsum.photos/seed/${item.seed}/600/400`}
                alt={item.caption}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,222,233,0.03)_0%,rgba(249,198,215,0.12)_58%,rgba(168,73,102,0.35)_100%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="absolute inset-x-0 bottom-0 translate-y-4 p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <div className="rounded-[1.5rem] border border-white/45 bg-brand-pink/78 px-4 py-3 backdrop-blur-md">
                  <p className="text-sm leading-6 text-brand-deep">
                    {item.caption}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}