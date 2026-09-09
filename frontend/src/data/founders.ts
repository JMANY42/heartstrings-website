/* ---------------------------------------------------------------------------
   The founders section on the home page.

   Who the founders are is NOT written here — it is read out of the roster in
   `src/data/musicians.ts`, which is the one place a person's name, title,
   instruments and photo are kept. Anyone whose `role` there says co-founder
   shows up in this section, in the order the roster lists them, so a founder
   never has to be renamed in two files.

   What does live here is the part of the section the roster has no opinion
   about: the photo of the two of them together, and the mission statement in
   their own words.

   NOTE: the mission statement below is a placeholder. Replace it with the
   founders' own words before this goes live.
--------------------------------------------------------------------------- */

import { galleryItems } from '@/data/gallery'
import { initialsFor, musicians, photoFor, type Musician } from '@/data/musicians'

/** A founder is just a musician the roster marks as one. */
export type Founder = Musician & {
  /** Their photo from `src/assets/musicians/`, while they have one. */
  photo?: string
  /** Shown in the soft circle until that photo arrives. */
  initials: string
}

/** Matches "Co-founder", "Cofounder & President", "co founder", and so on, so
    the roster can title someone however it likes without dropping them here. */
const coFounderRole = /co[-\s]?founder/i

export const founders: Founder[] = musicians
  .filter((musician) => coFounderRole.test(musician.role ?? ''))
  .map((musician) => ({
    ...musician,
    photo: photoFor(musician),
    initials: initialsFor(musician.name),
  }))

/* The photo of the two of them together lives in `src/assets/founders/`, named
   `portrait.<ext>`. See the README in that folder. */
const founderImageModules = import.meta.glob<string>(
  '../assets/founders/portrait.{jpg,jpeg,png,webp,avif,gif}',
  { eager: true, import: 'default', query: '?url' },
)

const portraitSrc = Object.values(founderImageModules)[0]

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
