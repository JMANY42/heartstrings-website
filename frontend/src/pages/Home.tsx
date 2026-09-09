import { About } from '@/components/About'
import { Collaborate } from '@/components/Collaborate'
import { Gallery } from '@/components/Gallery'
import { Hero } from '@/components/Hero'
import { Impact } from '@/components/Impact'
import { Join } from '@/components/Join'
import { Testimonials } from '@/components/Testimonials'

export function Home() {
  return (
    <>
      <Hero />
      <About />
      <Testimonials />
      <Gallery />
      <Impact />
      <Collaborate />
      <Join />
    </>
  )
}
