import { useEffect, useState } from 'react'

import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import { findEvent } from '@/data/events'
import { EventNotFound, EventPage } from '@/pages/EventPage'
import { Home } from '@/pages/Home'
import { MusiciansPage } from '@/pages/MusiciansPage'

/* Routing.

   The site is the home page, the musicians page, and a page per special event,
   and every link between them is a plain anchor, so there is nothing here to
   gain from a router library: the path is read once at load, and the matching
   page is rendered. `popstate` is listened for so the back and forward buttons
   still land on the right page if a restored history entry is served from the
   browser's cache rather than re-requested.

   Deploy note: because neither /musicians nor /events/<slug> has a file of its
   own in the build, the web server has to serve index.html for them. See the
   README. */
const eventPath = /^\/events\/([^/]+)\/?$/
const musiciansRoute = /^\/musicians\/?$/

function usePathname() {
  const [pathname, setPathname] = useState(() => window.location.pathname)

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname)

    window.addEventListener('popstate', handlePopState)

    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return pathname
}

function Page() {
  const pathname = usePathname()

  if (musiciansRoute.test(pathname)) {
    return <MusiciansPage />
  }

  const match = eventPath.exec(pathname)

  if (!match) {
    return <Home />
  }

  const event = findEvent(decodeURIComponent(match[1]))

  return event ? <EventPage event={event} /> : <EventNotFound />
}

function App() {
  return (
    <div className="relative isolate overflow-hidden text-brand-deep">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(circle_at_top,rgba(255,222,233,0.75),transparent_42%),linear-gradient(180deg,rgba(255,250,247,0.9)_0%,rgba(255,248,244,0.7)_56%,rgba(255,242,239,0)_100%)]" />
      <div className="pointer-events-none absolute left-[-6rem] top-24 -z-10 h-72 w-72 rounded-full bg-brand-pink/35 blur-3xl" />
      <div className="pointer-events-none absolute right-[-8rem] top-[32rem] -z-10 h-80 w-80 rounded-full bg-brand-rose/30 blur-3xl" />
      <Navbar />
      <main>
        <Page />
      </main>
      <Footer />
    </div>
  )
}

export default App
