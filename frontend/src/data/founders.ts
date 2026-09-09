/* ---------------------------------------------------------------------------
   The founders section on the home page.

   Everything it shows lives here: the photo of the co-founders, who they are,
   and the mission statement in their own words. The section reads from this
   file, so the copy can change without the component being touched.

   NOTE: the names, roles, and the mission statement below are placeholders.
   Replace them with the founders' own words before this goes live.
--------------------------------------------------------------------------- */

import { galleryItems } from '@/data/gallery'

export type Founder = {
  name: string
  /** Instrument, title, or both — shown under the name. */
  role?: string
}

/* The photo of the two of them together lives in `src/assets/founders/`, named
   `portrait.<ext>`. See the README in that folder. */
const founderImageModules = import.meta.glob<string>(
  '../assets/founders/portrait.{jpg,jpeg,png,webp,avif,gif}',
  { eager: true, import: 'default', query: '?url' },
)

const portraitSrc = Object.values(founderImageModules)[0]

export const founders: Founder[] = [
  { name: 'Co-founder name', role: 'Co-founder · Violin' },
  { name: 'Co-founder name', role: 'Co-founder · Cello' },
]

/** The photo the section is built around. Until the real one is dropped in it
    borrows the home page gallery, so the section never renders with a hole
    where a picture should be — the same fallback the event pages use. */
export const foundersPhoto = {
  src: portraitSrc ?? galleryItems[0]?.src ?? '',
  alt: 'The co-founders of Heartstrings',
}

/** In their own words — one paragraph per entry. */
export const missionStatement: string[] = [
  'We started Heartstrings because we kept noticing the same thing in two very different rooms: a hospital ward goes quiet in a way a rehearsal hall never does, and the music we had spent years learning had somewhere better to be than a stage.',
  'So we took it there. Our mission is simple — bring live music to the people least likely to be able to come and hear it, and play for them with the same care we would give an audience anywhere else. No tickets, no stage, no distance. Just a few musicians in a room, for as long as the room wants us.',
]

/** Where the musicians page lives. The section links to it; the page itself is
    `MusiciansPage.tsx`, routed in `App.tsx`, and its roster is
    `src/data/musicians.ts`. */
export const musiciansPath = '/musicians'
