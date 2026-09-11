/* ---------------------------------------------------------------------------
   The founders panel, which fills the right-hand column of the About
   section on the home page.

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
import { musicians, type Musician } from '@/data/musicians'

/** Matches "Co-founder", "Cofounder & President", "co founder", and so on, so
    the roster can title someone however it likes without dropping them here. */
const coFounderRole = /co[-\s]?founder/i

/** A founder is just a musician the roster marks as one. The note signs itself
    with their names, in the order the roster lists them. */
export const founders: Musician[] = musicians.filter((musician) =>
  coFounderRole.test(musician.role ?? ''),
)

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
  'Hi! We are Shadai and Anishka, and we started Heartstrings to give music a purpose beyond performance. After meeting as stand partners in the UTD University Orchestra, we realized that despite such a strong community of musicians on campus, there wasn’t yet an organization using music to serve others beyond it. What began as an idea between the two of us in November 2025 has grown into a space that allows us to share what we love with patients and others throughout the DFW area and bring the UTD music community together.',
  'In less than a year, we’ve had the opportunity to consistently perform for patients at care centers like Scottish Rite for Children and Baylor Scott & White, collaborate with other student organizations, raise funds for causes we care about, and create new ways for musicians to serve their community. We’re so grateful for everyone who has helped bring Heartstrings to life, including our amazing officer team and our supportive community, and we can’t wait to see where it goes! Music truly can heal, and we want to embrace that to its fullest, shining some light where it is needed most 🎻🤍'
]

/** Where the musicians page lives. The section links to it; the page itself is
    `MusiciansPage.tsx`, routed in `App.tsx`, and its roster is
    `src/data/musicians.ts`. */
export const musiciansPath = '/musicians'
