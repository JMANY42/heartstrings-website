import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

import { memberLinks, type MemberLink } from '@/data/memberLinks'
import { openFetchedLink } from '@/lib/openFetchedLink'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: 'easeOut' },
  },
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }

const isExternal = (href: string) => /^https?:\/\//.test(href)

export function MemberLinksPage() {
  useEffect(() => {
    document.title = 'Member links | Heartstrings'
    window.scrollTo(0, 0)
  }, [])

  return (
    <article>
      {/* Title */}
      <section className="px-6 pb-8 pt-32 text-center sm:px-8 lg:px-10 lg:pb-10 xl:px-14">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-3xl"
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-medium uppercase tracking-[0.34em] text-brand-deep/55"
          >
            For members
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="mt-5 font-display text-[clamp(2.5rem,9vw,3.25rem)] leading-[0.95] tracking-[-0.04em] text-brand-deep sm:text-6xl lg:text-7xl"
          >
            Member links
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-brand-deep/72 sm:text-xl"
          >
            Everything you need as a Heartstrings member, in one place.
          </motion.p>
        </motion.div>
      </section>

      {/* The links, one card of rows. */}
      <section className="px-6 pb-14 pt-4 sm:px-8 lg:px-10 lg:pb-20 lg:pt-6 xl:px-14">
        <motion.ul
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          className="mx-auto max-w-3xl overflow-hidden rounded-[1.75rem] border border-brand-rose/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(255,248,244,0.95)_100%)] shadow-[0_16px_50px_rgba(201,116,143,0.08)]"
        >
          {memberLinks.map((link) => (
            <li
              key={link.label}
              className="border-b border-brand-rose/30 last:border-b-0"
            >
              <LinkRow link={link} />
            </li>
          ))}
        </motion.ul>
      </section>
    </article>
  )
}

function LinkRow({ link }: { link: MemberLink }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const body = (
    <div className="min-w-0">
      <p className="text-base font-medium leading-7 text-brand-deep">
        {link.label}
      </p>
      {link.description ? (
        <p className="mt-1 text-sm leading-6 text-brand-deep/65">
          {link.description}
        </p>
      ) : null}
      {error ? (
        <p className="mt-1 text-sm leading-6 text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )

  const rowClass = 'flex items-start justify-between gap-4 px-5 py-5 sm:px-6'

  const arrow = (
    <ArrowUpRight
      className="mt-1.5 h-4 w-4 shrink-0 text-brand-deep/35 transition duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-deep/70"
      aria-hidden="true"
    />
  )

  const { fetchHref } = link
  if (fetchHref) {
    const open = async () => {
      setError(null)
      setLoading(true)
      try {
        await openFetchedLink(fetchHref)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load this link.')
      } finally {
        setLoading(false)
      }
    }

    return (
      <button
        type="button"
        onClick={open}
        disabled={loading}
        className={`group w-full text-left ${rowClass} transition hover:bg-brand-hover/40 disabled:cursor-wait disabled:opacity-70`}
      >
        {body}
        {arrow}
      </button>
    )
  }

  if (!link.href) {
    return (
      <div className={rowClass}>
        {body}
        <span className="mt-1 shrink-0 text-xs uppercase tracking-[0.2em] text-brand-deep/45">
          Link coming soon
        </span>
      </div>
    )
  }

  return (
    <a
      href={link.href}
      target={isExternal(link.href) ? '_blank' : undefined}
      rel={isExternal(link.href) ? 'noreferrer' : undefined}
      className={`group ${rowClass} transition hover:bg-brand-hover/40`}
    >
      {body}
      {arrow}
    </a>
  )
}
