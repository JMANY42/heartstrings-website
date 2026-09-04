export function Footer() {
  return (
    <footer className="border-t border-brand-rose/40 bg-brand-cream/85 px-6 py-10 sm:px-8 lg:px-10 xl:px-14">
      <div className="mx-auto flex max-w-shell flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-3xl leading-none tracking-[0.06em] text-brand-deep sm:text-4xl">
            Heartstrings
          </p>
          <p className="mt-3 max-w-sm text-sm leading-7 text-brand-deep/70">
            Healing, one note at a time.
          </p>
        </div>

        <div className="flex flex-col items-start gap-4 md:items-end">
          <a
            href="https://www.instagram.com/heartstringsatutd/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 rounded-full border border-brand-rose/55 bg-white/75 px-5 py-3 shadow-[0_18px_50px_rgba(201,116,143,0.1)] transition-transform hover:-translate-y-0.5"
            aria-label="Instagram"
          >
            <InstagramIcon />
            <span className="text-sm font-medium tracking-[0.16em] text-brand-deep">
              Instagram
            </span>
          </a>
          <p className="text-[0.72rem] uppercase tracking-[0.32em] text-brand-deep/55">
            © 2026 Heartstrings @ UTD
          </p>
        </div>
      </div>
    </footer>
  )
}

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
    >
      <defs>
        <linearGradient id="instagram-gradient" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F58529" />
          <stop offset="35%" stopColor="#DD2A7B" />
          <stop offset="70%" stopColor="#8134AF" />
          <stop offset="100%" stopColor="#515BD4" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="url(#instagram-gradient)" />
      <rect x="7" y="7" width="10" height="10" rx="3" stroke="white" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.2" fill="white" />
      <circle cx="16.1" cy="7.9" r="0.9" fill="white" />
    </svg>
  )
}