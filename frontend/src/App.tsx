import { About } from '@/components/About'
import { Collaborate } from '@/components/Collaborate'
import { Footer } from '@/components/Footer'
import { Gallery } from '@/components/Gallery'
import { Hero } from '@/components/Hero'
import { Impact } from '@/components/Impact'
import { Join } from '@/components/Join'
import { Navbar } from '@/components/Navbar'
import { Testimonials } from '@/components/Testimonials'

function App() {
  return (
    <div className="relative isolate overflow-hidden text-brand-deep">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(circle_at_top,rgba(255,222,233,0.75),transparent_42%),linear-gradient(180deg,rgba(255,250,247,0.9)_0%,rgba(255,248,244,0.7)_56%,rgba(255,242,239,0)_100%)]" />
      <div className="pointer-events-none absolute left-[-6rem] top-24 -z-10 h-72 w-72 rounded-full bg-brand-pink/35 blur-3xl" />
      <div className="pointer-events-none absolute right-[-8rem] top-[32rem] -z-10 h-80 w-80 rounded-full bg-brand-rose/30 blur-3xl" />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Testimonials />
        <Gallery />
        <Impact />
        <Collaborate />
        <Join />
      </main>
      <Footer />
    </div>
  )
}

export default App
