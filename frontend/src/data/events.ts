import type { LucideIcon } from 'lucide-react'
import {
  CalendarDays,
  Clock,
  Info,
  MapPin,
  Music,
  Ticket,
  Users,
} from 'lucide-react'

import { galleryItems, type GalleryItem } from '@/data/gallery'

/* ---------------------------------------------------------------------------
   Special events — one entry here is one page at /events/<slug>.

   Everything a page shows comes from this file. The detail section in
   particular is deliberately open-ended: `details` is an ordered list of rows,
   so an event can carry whatever it actually has — a location, two dates, a
   dress code, a parking note — without EventPage.tsx knowing about any of them.
   Rows render in the order they are written here, and anything left out is
   left off the page rather than rendered empty.
--------------------------------------------------------------------------- */

/** Icons a detail row can pick from. Extend the map, not the page. */
export const detailIcons = {
  location: MapPin,
  date: CalendarDays,
  time: Clock,
  tickets: Ticket,
  program: Music,
  people: Users,
  info: Info,
} satisfies Record<string, LucideIcon>

export type DetailIcon = keyof typeof detailIcons

export type EventDetail = {
  label: string
  /** A single line, or several lines stacked under the one label. */
  value: string | string[]
  /** Turns the value into a link. Off-site links open in a new tab. */
  href?: string
  /** Small print under the value — a room number, a note about parking. */
  note?: string
  icon?: DetailIcon
}

export type EventSpeaker = {
  name: string
  /** Title, organization, or both — shown under the name. */
  role?: string
  bio?: string
  href?: string
}

export type EventTickets = {
  /** Leave this out while tickets are not on sale; the page then shows
      `label` as a plain note rather than a dead button. */
  href?: string
  label?: string
  note?: string
}

/** What an event is written as. Images are filled in by `defineEvent`. */
type EventContent = {
  slug: string
  /** Page heading, and the heading on the home page card. */
  title: string
  /** Small caps line above the title. */
  eyebrow?: string
  /** One line under the title. */
  tagline?: string
  /** Short blurb for the card in the Impact section. */
  summary: string
  /** Lifts that card on the home page. */
  featured?: boolean
  /** ISO date (YYYY-MM-DD) the event happens on. Sorts the cards on the home
      page into upcoming and past; an event without one counts as upcoming. */
  date?: string
  collaborator: {
    name: string
    href?: string
    /** Who they are and what we are doing together — one paragraph per entry. */
    body: string[]
  }
  /** Why the two of us are doing it — one paragraph per entry. */
  objective: string[]
  details: EventDetail[]
  tickets?: EventTickets
  speakers?: EventSpeaker[]
  /** Captions for the photos in `src/assets/events/<slug>/`, in file order. */
  photoCaptions?: string[]
}

export type SpecialEvent = EventContent & {
  /** The wide photo at the top of the page. */
  highlight: { src: string; alt: string }
  /** Feeds the photo rail. Falls back to the home page gallery. */
  photos: GalleryItem[]
}

/* Photos for a page live in `src/assets/events/<slug>/`. The one named
   `highlight` becomes the wide photo at the top of the page; the rest fill the
   photo rail, in filename order. See the README in that folder. */
const eventImageModules = import.meta.glob<string>(
  '../assets/events/*/*.{jpg,jpeg,png,webp,avif,gif}',
  { eager: true, import: 'default', query: '?url' },
)

const isHighlight = (path: string) => /\/highlight\.[^/]+$/.test(path)

function imagesFor(slug: string) {
  const prefix = `../assets/events/${slug}/`
  const entries = Object.entries(eventImageModules)
    .filter(([path]) => path.startsWith(prefix))
    .sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true }))

  return {
    highlight: entries.find(([path]) => isHighlight(path))?.[1],
    photos: entries.filter(([path]) => !isHighlight(path)).map(([, src]) => src),
  }
}

function defineEvent(content: EventContent): SpecialEvent {
  const images = imagesFor(content.slug)

  return {
    ...content,
    // Until an event has photos of its own it borrows the home page gallery,
    // so a page never renders with a hole where a picture should be.
    highlight: {
      src: images.highlight ?? galleryItems[0]?.src ?? '',
      alt: content.title,
    },
    photos: images.photos.length
      ? images.photos.map((src, index) => ({
          src,
          caption: content.photoCaptions?.[index] ?? content.title,
        }))
      : galleryItems,
  }
}

export const specialEvents: SpecialEvent[] = [
  defineEvent({
    slug: 'breaking-taboo',
    title: 'Inside the Mind',
    eyebrow: 'Special event',
    tagline:
      'An evening of chamber music in support of open conversation about mental health.',
    summary:
      'A joint fundraiser for mental health awareness and an evening of chamber music in support of open conversation about mental health.',
    featured: false,
    date: '2026-04-25',
    collaborator: {
      name: 'Breaking Taboo',
      href: "https://breaking-taboo.org/",
      body: [
        'Breaking Taboo is a nonprofit working to end the silence around mental health. They run open conversations, education, and outreach for people who are rarely given room to talk about what they are carrying.',
        'We share an audience and a belief: that the hardest things get easier to say out loud once a room has been made gentle enough to say them in. Heartstrings brings the music, Breaking Taboo brings the conversation.',
      ],
    },
    objective: [
      'The evening raises money for Breaking Taboo’s mental health programming by pairing musical pieces selected to reflect a specific emotions with guest speakers who share their experiences and insights on that emotion. The goal is to create a space where people can feel safe to talk about mental health, and to raise awareness of the resources available for those who need them.',
      'Every dollar from tickets goes to that work. Our musicians play, as always, as volunteers.',
    ],
    // NOTE: placeholders. Replace the venue, date, and time with the confirmed
    // details before this page is shared.
    details: [
      {
        label: 'Location',
        value: 'Jonsson Perfomance Hall',
        note: 'UTD Campus JO 2.604',
        icon: 'location',
      },
      {
        label: 'Date',
        value: '4/25/2026',
        icon: 'date',
      },
      {
        label: 'Time',
        value: ['Doors 6:30 PM', 'Performance 7:00 PM'],
        icon: 'time',
      },
      {
        label: 'Program',
        value:
          'Chamber works for strings tied to specific emotions, played by a small Heartstrings ensemble between the evening’s conversations.',
        icon: 'program',
      },
      {
        label: 'Admission',
        value: 'Ticketed — proceeds go to Breaking Taboo',
        icon: 'info',
      },
    ],
    tickets: {
      // NOTE: drop the ticketing link in here and the note below turns into a
      // live button — set `label` to the button's wording at the same time.
      href: undefined,
      label: 'Ticket sale has ended',
    },
    // NOTE: STILL UPDATE SPEAKERS
    speakers: [
      {
        name: 'Speaker to be announced',
        role: 'Breaking Taboo',
        bio: 'A speaker from Breaking Taboo on the work they do, and on why the silence around mental health is worth breaking.',
      },
      {
        name: 'Speaker to be announced',
        role: 'Heartstrings',
        bio: 'A Heartstrings musician on what playing in hospitals and care homes has taught us about being in a hard room.',
      },
    ],
  }),
  defineEvent({
    slug: 'breaking-taboo2',
    title: 'Inside the Mind2',
    eyebrow: 'Special event',
    tagline:
      'An evening of chamber music in support of open conversation about mental health.',
    summary:
      'A joint fundraiser for mental health awareness and an evening of chamber music in support of open conversation about mental health.',
    featured: false,
    date: '2027-04-25',
    collaborator: {
      name: 'Breaking Taboo',
      href: "https://breaking-taboo.org/",
      body: [
        'Breaking Taboo is a nonprofit working to end the silence around mental health. They run open conversations, education, and outreach for people who are rarely given room to talk about what they are carrying.',
        'We share an audience and a belief: that the hardest things get easier to say out loud once a room has been made gentle enough to say them in. Heartstrings brings the music, Breaking Taboo brings the conversation.',
      ],
    },
    objective: [
      'The evening raises money for Breaking Taboo’s mental health programming by pairing musical pieces selected to reflect a specific emotions with guest speakers who share their experiences and insights on that emotion. The goal is to create a space where people can feel safe to talk about mental health, and to raise awareness of the resources available for those who need them.',
      'Every dollar from tickets goes to that work. Our musicians play, as always, as volunteers.',
    ],
    // NOTE: placeholders. Replace the venue, date, and time with the confirmed
    // details before this page is shared.
    details: [
      {
        label: 'Location',
        value: 'Jonsson Perfomance Hall',
        note: 'UTD Campus JO 2.604',
        icon: 'location',
      },
      {
        label: 'Date',
        value: '4/25/2026',
        icon: 'date',
      },
      {
        label: 'Time',
        value: ['Doors 6:30 PM', 'Performance 7:00 PM'],
        icon: 'time',
      },
      {
        label: 'Program',
        value:
          'Chamber works for strings tied to specific emotions, played by a small Heartstrings ensemble between the evening’s conversations.',
        icon: 'program',
      },
      {
        label: 'Admission',
        value: 'Ticketed — proceeds go to Breaking Taboo',
        icon: 'info',
      },
    ],
    tickets: {
      // NOTE: drop the ticketing link in here and the note below turns into a
      // live button — set `label` to the button's wording at the same time.
      href: undefined,
      label: 'Ticket sale has ended',
    },
    // NOTE: STILL UPDATE SPEAKERS
    speakers: [
      {
        name: 'Speaker to be announced',
        role: 'Breaking Taboo',
        bio: 'A speaker from Breaking Taboo on the work they do, and on why the silence around mental health is worth breaking.',
      },
      {
        name: 'Speaker to be announced',
        role: 'Heartstrings',
        bio: 'A Heartstrings musician on what playing in hospitals and care homes has taught us about being in a hard room.',
      },
    ],
  }),
]

export function findEvent(slug: string): SpecialEvent | undefined {
  return specialEvents.find((event) => event.slug === slug)
}
