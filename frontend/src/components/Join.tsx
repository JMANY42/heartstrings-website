import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { api } from '@/services/api'
import { musiciansPath } from '@/data/founders'
import { registrationFormUrl } from '@/data/memberLinks'
import { openFetchedLink } from '@/lib/openFetchedLink'

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: 'easeOut' },
  },
}

const stepClassName =
  'group flex w-full items-start justify-between gap-4 px-6 py-6 text-left transition hover:bg-brand-hover/40 disabled:cursor-wait disabled:opacity-70 sm:px-8 sm:py-7'

function StepBody({ step, title, children }: { step: string; title: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-brand-deep/50">{step}</p>
      <p className="mt-2 font-display text-2xl leading-tight tracking-[-0.02em] text-brand-deep sm:text-3xl">
        {title}
      </p>
      <p className="mt-2 text-base leading-7 text-brand-deep/70">{children}</p>
    </div>
  )
}

function StepArrow() {
  return (
    <ArrowUpRight
      className="mt-1.5 h-5 w-5 shrink-0 text-brand-deep/35 transition duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-deep/70"
      aria-hidden="true"
    />
  )
}

export function Join() {
  const [loadingGroupMe, setLoadingGroupMe] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* Fetched on click so the link never sits in the page source. */
  const openGroupMe = async () => {
    setError(null)
    setLoadingGroupMe(true)

    try {
      await openFetchedLink(api.getGroupMeLink)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the GroupMe link.')
    } finally {
      setLoadingGroupMe(false)
    }
  }

  return (
    <section id="join" className="px-6 py-20 sm:px-8 lg:px-10 lg:py-28 xl:px-14">
      <div className="mx-auto grid max-w-shell gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="flex max-w-2xl flex-col"
        >
          <p className="text-xs font-medium uppercase tracking-[0.34em] text-brand-deep/55">
            Join
          </p>
          <h2 className="mt-4 font-display text-4xl leading-[0.95] tracking-[-0.03em] text-brand-deep sm:text-5xl lg:text-6xl">
            Make music that matters
          </h2>
          <p className="mt-6 text-lg leading-8 text-brand-deep/78 sm:text-xl">
            Love playing music? Want to make a difference you can see? Want an awesome group of friends? Sounds like you're perfect for Heartstrings! We welcome musicians of all skill levels, instruments, and backgrounds.
          </p>

          {/* The current roster has a page of its own. `mt-auto` drops the
              invitation to the foot of the column, level with the bottom of
              the form; the button is sized to match the form's own. */}
          <div className="mt-auto flex flex-col gap-5 pt-10">
            <p className="text-base leading-7 text-brand-deep/78 sm:max-w-md">
              Want to see who's already playing? Check out our current roster of musicians!
            </p>
            <a
              href={musiciansPath}
              className="group inline-flex w-fit items-center justify-center gap-2.5 whitespace-nowrap rounded-full border border-brand-rose/70 bg-white/55 px-7 py-3.5 text-sm font-medium tracking-[0.18em] text-brand-deep shadow-[0_18px_50px_rgba(201,116,143,0.1)] transition duration-300 ease-out hover:-translate-y-1 hover:bg-brand-hover"
            >
              Meet our musicians
              <ArrowUpRight
                className="h-4 w-4 transition duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </a>
          </div>
        </motion.div>

        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="rounded-[2.5rem] border border-brand-rose/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.84)_0%,rgba(255,248,244,0.96)_100%)] shadow-[0_28px_90px_rgba(201,116,143,0.12)] flex flex-col overflow-hidden"
        >
          <ol>
            <li className="border-b border-brand-rose/30">
              <a
                href={registrationFormUrl}
                target="_blank"
                rel="noreferrer"
                className={stepClassName}
              >
                <StepBody step="Step one" title="Fill out the member form">
                  Tell us your name, your instrument, and how long you&apos;ve been playing.
                </StepBody>
                <StepArrow />
              </a>
            </li>
            <li>
              <button
                type="button"
                onClick={openGroupMe}
                disabled={loadingGroupMe}
                className={stepClassName}
              >
                <StepBody step="Step two" title="Join the GroupMe">
                  Rehearsal times, performance sign-ups, and day-to-day questions all happen there.
                </StepBody>
                <StepArrow />
              </button>
            </li>
          </ol>

          <div className="mt-auto border-t border-brand-rose/30 px-6 py-5 sm:px-8">
            <p className="text-sm leading-6 text-brand-deep/62">
              Expectation is simple: be prepared, be kind, and make a difference.
            </p>
            <AnimatePresence>
              {error ? (
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  className="mt-4 rounded-[1.5rem] border border-red-300 bg-red-50 px-4 py-3 text-sm leading-7 text-red-700"
                  role="alert"
                >
                  {error}
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  )
}