/* ---------------------------------------------------------------------------
   The musicians — one entry here is one card on /musicians.

   Everything a card shows comes from this file: the photo, the name, the
   optional officer role that sits under it, the instrument, when they joined,
   and a short blurb. Cards render in the order they are written here, so the
   file itself is the running order — officers first, then the rest, is the
   convention this list follows.

   A photo goes in `src/assets/musicians/` named after the musician's `slug`.
   See the README in that folder. A musician without one gets their initials in
   a soft circle rather than a broken image, so a card is never half-empty
   while a photo is still being chased.

   NOTE: every entry below is a placeholder. Replace the names, instruments,
   join dates, roles, and blurbs with the real roster before this goes live.
--------------------------------------------------------------------------- */

export type Musician = {
  /** Also names the photo file. Lower case, dashes, no spaces. */
  slug: string
  name: string
  /** Officer title, if they hold one. Shown as the subtitle under the name. */
  role?: string
  instrument: string
  /** When they joined — a semester reads better than a date. */
  joined: string
  /** Two or three sentences, in their own voice where possible. */
  blurb: string
}

/* Photos are picked up at build time and matched to a musician by filename, so
   dropping `ava-nguyen.jpg` in the folder is the whole job of adding a photo. */
const photoModules = import.meta.glob<string>(
  '../assets/musicians/*.{jpg,jpeg,png,webp,avif,gif}',
  { eager: true, import: 'default', query: '?url' },
)

const photosBySlug = new Map(
  Object.entries(photoModules).map(([path, src]) => [
    path.replace(/^.*\//, '').replace(/\.[^.]+$/, ''),
    src,
  ]),
)

/** The photo for a musician, or undefined while they haven't got one. */
export function photoFor(musician: Musician): string | undefined {
  return photosBySlug.get(musician.slug)
}

/** First letter of the first and last word of a name — the fallback for a
    card whose photo hasn't arrived yet. */
export function initialsFor(name: string): string {
  const words = name.trim().split(/\s+/)
  const first = words[0]?.[0] ?? ''
  const last = words.length > 1 ? (words[words.length - 1][0] ?? '') : ''

  return (first + last).toUpperCase()
}

export const musicians: Musician[] = [
  {
    slug: 'co-founder-one',
    name: 'Co-founder name',
    role: 'Co-founder & President',
    instrument: 'Violin',
    joined: 'Founding member, Fall 2024',
    blurb:
      'Started Heartstrings after a semester of playing in hospital lobbies and realising the rooms wanted more. Plays first violin in most of our quartets and books nearly every visit.',
  },
  {
    slug: 'co-founder-two',
    name: 'Co-founder name',
    role: 'Co-founder & Vice President',
    instrument: 'Cello',
    joined: 'Founding member, Fall 2024',
    blurb:
      'Handles the programming — which pieces suit which room, and how long a set should run when the audience is tired. Has been playing cello since she was seven.',
  },
  {
    slug: 'officer-treasurer',
    name: 'Musician name',
    role: 'Treasurer',
    instrument: 'Viola',
    joined: 'Fall 2024',
    blurb:
      'Keeps the books and the instrument fund. Joined for one performance in her first semester and has not missed a visit since.',
  },
  {
    slug: 'officer-outreach',
    name: 'Musician name',
    role: 'Outreach Officer',
    instrument: 'Flute',
    joined: 'Spring 2025',
    blurb:
      'The reason we get through the door anywhere. Writes to hospitals and care homes across the Dallas area and turns a maybe into a date on the calendar.',
  },
  {
    slug: 'musician-five',
    name: 'Musician name',
    instrument: 'Violin',
    joined: 'Spring 2025',
    blurb:
      'Plays second violin and sight-reads anything put in front of her, which has saved more than one set list on the drive over.',
  },
  {
    slug: 'musician-six',
    name: 'Musician name',
    instrument: 'Piano',
    joined: 'Fall 2025',
    blurb:
      'Accompanies whatever the room has a piano for, and arranges pieces down to whichever three or four of us made it that afternoon.',
  },
]
