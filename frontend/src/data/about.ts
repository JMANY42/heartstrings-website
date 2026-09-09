/* ---------------------------------------------------------------------------
   The photo that fills the right-hand column of the About section, beside the
   copy. It takes the same crop as the founders photo further down the same
   section so the two come out the same size on the page — see
   `src/data/founders.ts`, which this follows.
--------------------------------------------------------------------------- */

import { galleryItems } from '@/data/gallery'

/* The photo lives in `src/assets/about/`, named `photo.<ext>`. See the README
   in that folder. */
const aboutImageModules = import.meta.glob<string>(
  '../assets/about/photo.{jpg,jpeg,png,webp,avif,gif}',
  { eager: true, import: 'default', query: '?url' },
)

const photoSrc = Object.values(aboutImageModules)[0]

/** Until the real photo is dropped in it borrows the home page gallery, the
    same fallback the founders photo and the event pages use. The second image
    rather than the first, so the two photos in this section are not the same
    picture while both are standing in. */
export const aboutPhoto = {
  src: photoSrc ?? galleryItems[1]?.src ?? galleryItems[0]?.src ?? '',
  alt: 'A Heartstrings ensemble performing',
}
