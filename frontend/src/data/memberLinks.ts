/* ---------------------------------------------------------------------------
   The links on the /member-links page, in the order they are listed there.

   A link with an empty `href` still shows up, marked "Link coming soon", so a
   placeholder can sit in the list until the real URL is ready.
--------------------------------------------------------------------------- */

export type MemberLink = {
  label: string
  /** One line on what the link is for. */
  description?: string
  /** Leave empty to show the link as "coming soon". */
  href: string
}

export const memberLinks: MemberLink[] = [
  {
    label: 'Member registration',
    description: 'The Google Form every member fills out to join the club.',
    href: '',
  },
  {
    label: 'First general body meeting slides',
    description: 'The Google Slides from our first general body meeting.',
    href: '',
  },
]
