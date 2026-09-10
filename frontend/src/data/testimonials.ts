/* ---------------------------------------------------------------------------
   The testimonials — one entry here is one circle in the word cloud on the
   home page.

   Entries render in the order they are written here. The cloud only draws the
   first several of them (Testimonials.tsx sets the cap), so anything past that
   stays in the file but off the page — put the strongest quotes first.

   Keep quotes short. Every circle has to fit its whole quote and attribution
   inside it, so the longest quote sets how small the lettering in the cloud
   gets.

   NOTE: most entries below are placeholders. Replace them with real quotes,
   with permission from the people quoted, before this goes live.
--------------------------------------------------------------------------- */

export type Testimonial = {
  /** The quote itself, without surrounding quotation marks — the cloud adds
      them. */
  quote: string
  name: string
  /** Who they are in relation to the club: a title, a ward, a venue. Shown
      after the name. */
  role: string
}

export const testimonials: Testimonial[] = [
  {
    quote:
      'I love visiting patients and playing with heartstrings. It is an absolute joy to see the smiles we bring to their faces.',
    name: 'Jonathan Lewis',
    role: 'Cellist',
  },
  {
    quote:
      'Our patients talked about that afternoon for days. The students read the room beautifully — soft where it needed to be, never intrusive.',
    name: 'Marcus Ibe',
    role: 'Charge nurse, St. Alden Medical',
  },
  {
    quote:
      'I have worked in palliative care for eleven years. I have rarely seen a room settle the way it did when the quartet began.',
    name: 'Dr. Priya Raghavan',
    role: 'Palliative care physician',
  },
  {
    quote:
      'Playing for someone six feet away, on the hardest day of their life, changed how I hear my own instrument.',
    name: 'Elena Marchetti',
    role: 'Violinist, Heartstrings',
  },
  {
    quote:
      'They arrived early, set up without a fuss, and left the lounge warmer than they found it. We ask them back every season.',
    name: 'Tom Bergstrom',
    role: 'Activities director, Rosewood Care',
  },
  {
    quote:
      'My father had not spoken much in months. He hummed along to the Bach. I will not forget that sound.',
    name: 'Ayesha Karim',
    role: 'Family member, Rosewood Care',
  },
  {
    quote:
      'My father had not spoken much in months. He hummed along to the Bach. I will not forget that sound.',
    name: 'Ayesha Karim',
    role: 'Family member, Rosewood Care',
  },
  {
    quote:
      'My father had not spoken much in months. He hummed along to the Bach. I will not forget that sound.',
    name: 'Ayesha Karim',
    role: 'Family member, Rosewood Care',
  },
  {
    quote:
      'My father had not spoken much in months. He hummed along to the Bach. I will not forget that sound.',
    name: 'Ayesha Karim',
    role: 'Family member, Rosewood Care',
  },
  {
    quote:
      'My father had not spoken much in months. He hummed along to the Bach. I will asdf asdfasdf not forget that sound.',
    name: 'Ayesha Karim',
    role: 'Family member, Rosewood Care',
  },
  {
    quote:
      'My father had not spoken much in months. He hummed along to the Bach. I will asdf asdfasdf not forget that sound.',
    name: 'Ayesha Karim',
    role: 'Family member, Rosewood Care',
  },
  {
    quote:
      'My father had not spoken much in months. He hummed along to the Bach. I will not forget that sound.',
    name: 'Ayesha Karim',
    role: 'Family member, Rosewood Care',
  },
]
