import { motion } from 'framer-motion'

import { galleryItems, type GalleryItem } from '../data/gallery'
import { useHorizontalWheelScroll } from '../hooks/useHorizontalWheelScroll'
import { useRailEdgeFade } from '../hooks/useRailEdgeFade'

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

type GalleryProps = {
  /** Defaults to the home page photos. */
  items?: GalleryItem[]
  id?: string
  /** Pass `null` to drop the small caps line above the heading. */
  eyebrow?: string | null
  /** Pass `null` to drop the display heading. With both null the rail stands
      on its own, which is how the event pages show their photos. */
  heading?: string | null
  /** Screen reader name for the rail. */
  label?: string
}

export function Gallery({
  items = galleryItems,
  id = 'gallery',
  eyebrow = 'Gallery',
  heading = 'Moments from the room',
  label = 'Gallery, scroll horizontally to see more',
}: GalleryProps = {}) {
  const railRef = useHorizontalWheelScroll<HTMLUListElement>()

  useRailEdgeFade(railRef)

  if (items.length === 0) {
    return null
  }

  return (
    <section id={id} className="px-6 py-20 sm:px-8 lg:px-10 lg:py-28 xl:px-14">
      <div className="mx-auto max-w-shell">
        {eyebrow || heading ? (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="mb-10 max-w-3xl"
          >
            {eyebrow ? (
              <p className="text-xs font-medium uppercase tracking-[0.34em] text-brand-deep/55">
                {eyebrow}
              </p>
            ) : null}
            {heading ? (
              <h2 className="change mt-4 font-display text-4xl leading-[0.95] tracking-[-0.03em] text-brand-deep sm:text-5xl lg:text-6xl">
                {heading}
              </h2>
            ) : null}
          </motion.div>
        ) : null}

        {/* Every tile is the same square, laid out on one horizontal rail. The
            negative margins let the rail bleed to the screen edge on small
            screens so a half-visible tile hints that it scrolls, and the mask
            behind `scroll-rail-fade` softens whichever end still has rail
            beyond it so that tile fades out rather than being cut off.

            The rail is exactly the column wide, so a tile is never drawn past
            it and the scrollbar spans no further than the tiles do. That also
            makes the rail's own box the only room the tiles' shadow has, since
            a scroll container clips whatever leaves its padding box and a
            shadow is no exception. Sideways that room is nothing at all, so the
            outermost tiles carry a shadow that stops at their own edge — see
            the shadow classes below. */}
        <motion.ul
          ref={railRef}
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          tabIndex={0}
          aria-label={label}
          className="scroll-rail scroll-rail-fade -mx-6 -mt-3 flex list-none flex-row gap-5 overflow-x-auto px-6 pb-6 pt-3 sm:-mx-8 sm:px-8 md:mx-0 md:px-0"
        >
          {items.map((item) => (
            // The wide shadow reaches about 60px past a tile, which is what
            // keeps the band under the rail unbroken across the gaps. Only the
            // first tile's left side and the last tile's right side ever sit
            // against the rail's edge — every other edge a tile passes is
            // covered by the mask's fade — and there the spill has nowhere to
            // go and would be sliced into a hard line, so those two tiles get a
            // shadow drawn back inside their own box instead. Their inner side
            // loses its spill too, but the neighbouring tile's reaches over it.
            <motion.li
              key={item.src}
              variants={card}
              className="group relative aspect-square w-[80vw] shrink-0 overflow-hidden rounded-[2rem] border border-brand-rose/35 bg-white shadow-[0_24px_70px_rgba(201,116,143,0.11)] first:shadow-[0_24px_16px_-24px_rgba(201,116,143,0.26)] last:shadow-[0_24px_16px_-24px_rgba(201,116,143,0.26)] sm:w-[25rem] md:w-[27.5rem] lg:w-[30rem]"
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
