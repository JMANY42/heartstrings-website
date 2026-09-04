import { motion } from 'framer-motion'

import { useHorizontalWheelScroll } from '../hooks/useHorizontalWheelScroll'
import { useRailEdgeFade } from '../hooks/useRailEdgeFade'

const imageModules = import.meta.glob<string>(
  '../assets/gallery/image_*.{jpg,jpeg,png,webp,avif,gif}',
  { eager: true, import: 'default', query: '?url' },
)

const imageNumber = (path: string) => {
  const match = path.match(/image_(\d+)\./)
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER
}

const images = Object.entries(imageModules)
  .sort(([a], [b]) => imageNumber(a) - imageNumber(b))
  .map(([path, src]) => ({ src, number: imageNumber(path) }))

const captions = [
  'After performing at LifeCare Hospitals of North Texas ',
  'Presenting our organization on UTD\'s campus',
  'After performing at Orcharde Pointe Assisted Living',
  'Group photo to celebrate a successful performance',
  'Performing at a pop-up concert for the Plano Community Home',
] as const

const galleryItems = images.map((image, index) => ({
  ...image,
  caption: captions[index % captions.length],
}))

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
  const railRef = useHorizontalWheelScroll<HTMLUListElement>()

  useRailEdgeFade(railRef)

  if (galleryItems.length === 0) {
    return null
  }

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

        {/* Every tile is the same square, laid out on one horizontal rail. The
            negative margins let the rail bleed to the screen edge on small
            screens so a half-visible tile hints that it scrolls, and the mask
            behind `scroll-rail-fade` softens whichever end still has rail
            beyond it so that tile fades out rather than being cut off.

            A rail clips whatever leaves its padding box, so the padding is also
            the only room the tiles' shadow has to fade out in. Below the screen
            widths that bleed, that room has to be asked for: the shadow reaches
            about 60px to either side, so the rail is padded past it and pulled
            back out by the same amount, which leaves the tiles aligned with the
            heading while the shadow at each end reaches the page unclipped. */}
        <motion.ul
          ref={railRef}
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          tabIndex={0}
          aria-label="Gallery, scroll horizontally to see more"
          className="scroll-rail scroll-rail-fade -mx-6 -mt-3 flex list-none flex-row gap-5 overflow-x-auto px-6 pb-6 pt-3 sm:-mx-8 sm:px-8 md:-mx-16 md:px-16"
        >
          {galleryItems.map((item) => (
            <motion.li
              key={item.src}
              variants={card}
              className="group relative aspect-square w-[80vw] shrink-0 overflow-hidden rounded-[2rem] border border-brand-rose/35 bg-white shadow-[0_24px_70px_rgba(201,116,143,0.11)] sm:w-[25rem] md:w-[27.5rem] lg:w-[30rem]"
            >
              <img
                src={item.src}
                alt={item.caption}
                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />

              <div className="absolute inset-0 hidden bg-[linear-gradient(180deg,rgba(255,222,233,0.03)_0%,rgba(249,198,215,0.12)_58%,rgba(168,73,102,0.35)_100%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:block" />

              <div className="absolute inset-x-0 bottom-0 hidden translate-y-4 p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 md:block">
                <div className="rounded-[1.5rem] border border-white/45 bg-brand-pink/78 px-4 py-3 backdrop-blur-md">
                  <p className="text-sm leading-6 text-white">
                    {item.caption}
                  </p>
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
