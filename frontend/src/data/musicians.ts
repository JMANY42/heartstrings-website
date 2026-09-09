/* ---------------------------------------------------------------------------
   The musicians — one entry here is one card on /musicians.

   Everything a card shows comes from this file: the photo, the name, the
   optional officer role that sits under it, the instruments they play, their
   major, when they joined, and a short blurb. Cards render in the order they
   are written here, so the file itself is the running order — officers first,
   then the rest, is the convention this list follows.

   A photo goes in `src/assets/musicians/` named after the musician's `slug`.
   See the README in that folder. A musician without one gets their initials in
   a soft circle rather than a broken image, so a card is never half-empty
   while a photo is still being chased.

   The founders section on the home page reads out of this file too: whoever's
   `role` says co-founder is who that section shows, so a co-founder's name,
   title, instruments and photo live here and nowhere else.

   NOTE: most entries below are still placeholders. Replace the names,
   instruments, majors, join dates, roles, and blurbs with the real roster
   before this goes live.
--------------------------------------------------------------------------- */

export type Musician = {
  /** Also names the photo file. Lower case, dashes, no spaces. */
  slug: string
  name: string
  /** Officer title, if they hold one. Shown as the subtitle under the name. */
  role?: string
  /** Everything they play, most-played first. One is a list of one. */
  instruments: string[]
  /** Their major — or intended major — while they have one to give. */
  major?: string
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
    name: 'Anishka Desai',
    role: 'Co-founder & President',
    instruments: ['Violin'],
    major: 'Biology',
    joined: 'Founding member, Fall 2025',
    blurb:
      'Founded heartstrings as a way to reach out to the people who need music most. Plays first violin and finds/arranges pieces for the group.',
  },
  {
    slug: 'co-founder-two',
    name: 'Shadai Haeri',
    role: 'Co-founder & Vice President',
    instruments: ['Violin'],
    major: 'Neuroscience',
    joined: 'Founding member, Fall 2025',
    blurb:
      'Founded heartstrings as a way to reach out to the people who need music most. Plays first violin and finds/arranges pieces for the group.',
  },
  {
    slug: 'officer-treasurer',
    name: 'Jonathan Lewis',
    role: 'Treasurer',
    instruments: ['Cello'],
    major: 'Computer Science',
    joined: 'Fall 2025',
    blurb:
      'Loves seeing the smile on patient\'s faces when we play. Maintaines the website as a small side project.',
  },
  {
    slug: 'officer-outreach',
    name: 'Musician name',
    role: 'Outreach Officer',
    instruments: ['Flute'],
    major: 'Public Health',
    joined: 'Spring 2025',
    blurb:
      'The reason we get through the door anywhere. Writes to hospitals and care homes across the Dallas area and turns a maybe into a date on the calendar.',
  },
  {
    slug: 'musician-five',
    name: 'Ashhad Qazi',
    instruments: ['Viola'],
    major: 'Business',
    joined: 'Spring 2025',
    blurb:
      'Plays second violin and sight-reads anything put in front of her, which has saved more than one set list on the drive over.',
  },
  {
    slug: 'musician-six',
    name: 'Jason Nguyen',
    instruments: ['Piano', 'Guitar'],
    major: 'Computer Science',
    joined: 'Fall 2025',
    blurb:
      'Accompanies whatever the room has a piano for, and arranges pieces down to whichever three or four of us made it that afternoon.',
  },
  {
    slug: 'musician-seven',
    name: 'Olivia Lee',
    instruments: ['Cello'],
    major: 'Psychology',
    joined: 'Fall 2025',
    blurb:
      'Accompanies whatever the room has a piano for, and arranges pieces down to whichever three or four of us made it that afternoon.',
  },
  {
    slug: 'musician-eight',
    name: 'Saimanasaa Lastname',
    instruments: ['Viola'],
    major: 'Biochemistry',
    joined: 'Fall 2025',
    blurb:
      'Accompanies whatever the room has a piano for, and arranges pieces down to whichever three or four of us made it that afternoon.',
  },
  {
    slug: 'musician-nine',
    name: 'Stephen Pereira',
    instruments: ['Violin'],
    major: 'Music',
    joined: 'Fall 2025',
    blurb:
      'Accompanies whatever the room has a piano for, and arranges pieces down to whichever three or four of us made it that afternoon.',
  },
]
