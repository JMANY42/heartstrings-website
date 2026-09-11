/* ---------------------------------------------------------------------------
   The musicians — one entry here is one card on /musicians.

   Everything a card shows comes from this file: the photo, the name, the
   optional officer role that sits under it, the instruments they play, their
   major and minor, and when they joined. Cards render in the order they
   are written here, so the file itself is the running order — officers first,
   then the rest, is the convention this list follows.

   A photo goes in `src/assets/musicians/` named after the musician's `slug`.
   See the README in that folder. A musician without one gets their initials in
   a soft circle rather than a broken image, so a card is never half-empty
   while a photo is still being chased.

   The founders note in the about section reads out of this file too: whoever's
   `role` says co-founder is who that note is signed by, so a co-founder's name,
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
  /** Their major — or intended major — while they have one to give. The card
      gives it one line: keep it under about 25 characters, abbreviating
      ("SLHS", "CS") rather than letting it end in an ellipsis. */
  major?: string
  /** Their minor, if they have one. Shares the major's line on the card as
      "Computer Science · Music minor", so the same length advice applies to
      the two together. */
  minor?: string
  /** When they joined — a semester reads better than a date. */
  joined: string
  /** Two or three sentences, in their own voice where possible. Not shown on
      the card at the moment — kept so the words aren't lost. */
}

/* Photos are picked up at build time and matched to a musician by filename, so
   dropping `ava-nguyen.jpg` in the folder is the whole job of adding a photo. */
const photoModules = import.meta.glob<string>(
  '../assets/musicians/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG,WEBP,AVIF,GIF}',
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
    slug: 'anishka-desai',
    name: 'Anishka Desai',
    role: 'President',
    instruments: ['Violin'],
    major: 'Healthcare Studies',
    joined: 'Fall 2025',
  },
  {
    slug: 'shadai-haeri',
    name: 'Shadai Haeri',
    role: 'President',
    instruments: ['Violin'],
    major: 'Biology',
    minor: 'Healthcare Studies',
    joined: 'Fall 2025',
  },
  {
    slug: 'stephen-pereira',
    name: 'Stephen Pereira',
    instruments: ['Violin'],
    major: 'Neuroscience',
    minor: 'Music',
    role: 'Secretary',
    joined: 'Fall 2025',
  },
  {
    slug: 'jonathan-lewis',
    name: 'Jonathan Lewis',
    role: 'Treasurer',
    instruments: ['Cello'],
    major: 'Computer Science',
    joined: 'Fall 2025',
  },
  {
    slug: 'habeen-kim',
    name: 'Habeen Kim',
    role: 'Philanthropy',
    instruments: ['Cello'],
    major: 'Biochemistry',
    joined: 'Fall 2025',
  },
  {
    slug: 'ashhad-qazi',
    name: 'Ashhad Qazi',
    role: 'Clinical Outreach',
    instruments: ['Viola'],
    major: 'Neuroscience',
    minor: 'Music',
    joined: 'Fall 2025',
  },
  {
    slug: 'jason-nguyen',
    name: 'Jason Nguyen',
    instruments: ['Piano', 'Guitar'],
    major: 'Neuroscience',
    role: 'Mentorship and Education',
    joined: 'Fall 2025',
  },
  {
    slug: 'olivia-lee',
    name: 'Olivia Lee',
    instruments: ['Cello'],
    major: 'Neuroscience',
    role: 'Clinical Outreach',
    joined: 'Fall 2025',
  },
  {
    slug: 'saimanasaa-viswanathan',
    name: 'Saimanasaa Viswanathan',
    instruments: ['Violin'],
    major: 'Neuroscience',
    role: 'Philanthropy',
    joined: 'Fall 2025',
  },
  {
    slug: 'audrey-kolega',
    name: 'Audrey Kolega',
    instruments: ['Violin'],
    major: 'Speech, Language, and Hearing Sciences',
    joined: 'Fall 2026',
  },
{
    slug: 'nicole-barnhart',
    name: 'Nicole Barnhart',
    instruments: ['Violin'],
    major: 'Neuroscience',
    joined: 'Fall 2026',
  },
{
    slug: 'ian-ignacio',
    name: 'Ian Ignacio',
    instruments: ['Viola'],
    major: 'Biology',
    joined: 'Fall 2026',
  },
]
