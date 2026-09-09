import { ArrowUpRight } from 'lucide-react'

// The photo of the pair and the words are the founders file's; who the
// founders are comes with them, read off the roster in `musicians.ts` so a
// name is only ever written in one place.
import {
  founders,
  foundersPhoto,
  missionStatement,
  musiciansPath,
} from '@/data/founders'

/** The note from the founders — the right-hand half of the about section.
    Photo and words sit side by side wherever the panel is wide enough for it
    and stack when it isn't, so this reads the same in a narrow column as it
    does across the full width of a phone. */
export function FoundersNote() {
  return (
    <div
      id="founders"
      className="@container relative overflow-hidden rounded-[2.5rem] border border-brand-rose/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(255,248,244,0.95)_100%)] p-6 shadow-[0_28px_90px_rgba(201,116,143,0.12)] sm:p-8"
    >
      <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-brand-pink/45 blur-3xl" />

      <div className="relative">
        <p className="text-xs font-medium uppercase tracking-[0.34em] text-brand-deep/55">
          Note from the founders
        </p>
        {/* Signed at the top rather than the bottom — whoever the roster marks
            as a co-founder, in the order it lists them. */}
        <p className="mt-3 font-display text-2xl text-brand-deep sm:text-3xl">
          {founders.map((founder) => founder.name).join(' · ')}
        </p>

        <div className="mt-7 grid gap-6 @lg:grid-cols-[0.85fr_1.15fr] @lg:items-start @lg:gap-8">
          {foundersPhoto.src ? (
            <div className="overflow-hidden rounded-[2rem] border border-brand-rose/45 bg-white shadow-[0_18px_60px_rgba(201,116,143,0.14)]">
              <img
                src={foundersPhoto.src}
                alt={foundersPhoto.alt}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover object-center @lg:aspect-[4/5]"
              />
            </div>
          ) : null}

          <div className="space-y-5">
            {missionStatement.map((paragraph, index) => (
              <p key={index} className="text-base leading-7 text-brand-deep/78">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* The rest of the ensemble gets a page of its own. */}
        <div className="mt-8 flex justify-center">
          <a
            href={musiciansPath}
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-brand-rose/70 bg-white/70 px-7 py-3.5 text-sm font-medium tracking-[0.18em] text-brand-deep shadow-[0_18px_50px_rgba(201,116,143,0.1)] transition duration-300 ease-out hover:-translate-y-1 hover:bg-brand-hover"
          >
            Meet our musicians
            <ArrowUpRight
              className="h-4 w-4 transition duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </div>
  )
}
