/* The home page photos. Drop files in `src/assets/gallery/` — see the README
   there — and they are picked up here at build time. Event pages fall back to
   this list until they have photos of their own (`src/data/events.ts`). */

export type GalleryItem = {
  src: string
  caption: string
}

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
  .map(([, src]) => src)

const captions = [
  'After performing at LifeCare Hospitals of North Texas ',
  'Presenting our organization on UTD\'s campus',
  'After performing at Orcharde Pointe Assisted Living',
  'Group photo to celebrate a successful performance',
  'Performing at a pop-up concert for the Plano Community Home',
] as const

export const galleryItems: GalleryItem[] = images.map((src, index) => ({
  src,
  caption: captions[index % captions.length],
}))
