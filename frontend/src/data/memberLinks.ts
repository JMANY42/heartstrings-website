/* ---------------------------------------------------------------------------
   The links on the /member-info page, in the order they are listed there.

   Each group is a heading on the page with its links beneath it. A link with
   an empty `href` still shows up, marked "Link coming soon", so a placeholder
   can sit in the list until the real URL is ready.

   NOTE: every entry below except Instagram is a placeholder. Fill in the real
   URLs (and drop any the club doesn't use) before sharing the page.
--------------------------------------------------------------------------- */

export type MemberLink = {
  label: string
  /** One line on what the link is for. */
  description?: string
  /** Leave empty to show the link as "coming soon". */
  href: string
}

export type MemberLinkGroup = {
  heading: string
  links: MemberLink[]
}

export const memberLinkGroups: MemberLinkGroup[] = [
  {
    heading: 'Stay in touch',
    links: [
      {
        label: 'Group chat',
        description: 'Where announcements and last-minute changes go out first.',
        href: '',
      },
      {
        label: 'Instagram',
        description: 'Photos and recaps from our visits and events.',
        href: 'https://www.instagram.com/heartstringsatutd/',
      },
    ],
  },
  {
    heading: 'Visits & performances',
    links: [
      {
        label: 'Visit sign-up sheet',
        description: 'Claim a spot at an upcoming visit.',
        href: '',
      },
      {
        label: 'Club calendar',
        description: 'Every visit, rehearsal, and meeting in one place.',
        href: '',
      },
      {
        label: 'Repertoire & sheet music',
        description: 'The shared folder of pieces we play.',
        href: '',
      },
    ],
  },
  {
    heading: 'Club business',
    links: [
      {
        label: 'Volunteer hours log',
        description: 'Record your hours after each visit.',
        href: '',
      },
      {
        label: 'Member handbook',
        description: 'Expectations, etiquette, and how visits run.',
        href: '',
      },
    ],
  },
]
