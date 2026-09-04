import { useEffect, useRef } from 'react'

// Wheel deltas arrive in pixels, lines or pages depending on the browser.
const LINE_HEIGHT = 16

// Turn a vertical wheel over a horizontally scrolling rail into horizontal
// scrolling. The gesture is only swallowed when the rail actually moved, so at
// either end — or if anything ever refuses the scroll — the page keeps
// scrolling normally and the reader is never trapped inside the section.
export function useHorizontalWheelScroll<T extends HTMLElement>() {
  const railRef = useRef<T>(null)

  useEffect(() => {
    const rail = railRef.current

    if (!rail) {
      return
    }

    const handleWheel = (event: WheelEvent) => {
      const maxScroll = rail.scrollWidth - rail.clientWidth

      // Nothing overflowing: leave the page scroll alone.
      if (maxScroll <= 0) {
        return
      }

      // Browsers latch a continuous wheel gesture to the element it started
      // over, so events keep arriving after the rail has scrolled past the
      // pointer. Re-check the pointer against the rail on every event.
      const bounds = rail.getBoundingClientRect()

      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      ) {
        return
      }

      // A deliberate horizontal gesture (trackpad, tilt wheel) already works.
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        return
      }

      const delta =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? event.deltaY * LINE_HEIGHT
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? event.deltaY * rail.clientWidth
            : event.deltaY

      const before = rail.scrollLeft
      rail.scrollLeft = before + delta

      if (rail.scrollLeft !== before) {
        event.preventDefault()
      }
    }

    rail.addEventListener('wheel', handleWheel, { passive: false })

    return () => rail.removeEventListener('wheel', handleWheel)
  }, [])

  return railRef
}
