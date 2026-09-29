/* ---------------------------------------------------------------------------
   The links on the /member-links page, in the order they are listed there.

   A link with an empty `href` still shows up, marked "Link coming soon", so a
   placeholder can sit in the list until the real URL is ready.

   A link that shouldn't be scrapable from the page source (the GroupMe) sets
   `fetchHref` instead: its URL is fetched from the backend only when clicked.
--------------------------------------------------------------------------- */

import { api } from '@/services/api'

export type MemberLink = {
  label: string
  /** One line on what the link is for. */
  description?: string
  /** Leave empty to show the link as "coming soon". Ignored when `fetchHref` is set. */
  href: string
  /** Fetches the URL at click time, so it never appears in the page source. */
  fetchHref?: () => Promise<string>
}

/** The member registration form. The Join section on the home page links to it
    too, so it lives here once. */
export const registrationFormUrl =
  'https://docs.google.com/forms/d/1LChZMxNYhPiG4xMKAX9LhhRG_Vt3Majj0nlcCoOlJSE/viewform'

export const memberLinks: MemberLink[] = [
  {
    label: 'Member registration',
    description: 'The Google Form to join the club',
    href: registrationFormUrl,
  },
  {
    label: 'GroupMe',
    description: 'Rehearsal times, performance sign-ups, and day-to-day questions.',
    href: '',
    fetchHref: api.getGroupMeLink,
  },
  {
    label: 'First general body meeting slides',
    description: 'The slides from our first general body meeting.',
    href: 'https://docs.google.com/presentation/d/1v1FHj5qsAGIs17HNhh9V432mgJLKMbogD08sbnwfPA8',
  },
]
