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
    label: 'First general body meeting slides',
    description: 'The slides from our first general body meeting.',
    href: 'https://docs.google.com/presentation/d/1v1FHj5qsAGIs17HNhh9V432mgJLKMbogD08sbnwfPA8',
  },
]
