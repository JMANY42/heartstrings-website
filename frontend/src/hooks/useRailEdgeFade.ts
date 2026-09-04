import { useEffect, type RefObject } from 'react'

// How far a fully grown fade reaches. `.scroll-rail-fade` shapes the curve
// across it; this is the only place its length is set. Short on purpose — far
// enough to take the hard edge off a tile, not so far it washes one out.
const FADE_WIDTH = 40

// Feed a horizontal rail's scroll position back into the mask that softens its
// edges: the trailing edge fades while there is more to reach, the leading edge
// only once the reader has actually scrolled away from the start. Both ramp in
// over the width of the fade itself, so an edge that has just come into play
// grows in rather than popping.
//
// The top and bottom fades are the rail's own vertical padding, which is the
// strip either side of the tiles that holds nothing but the shadow the rail
// clips. Measuring it rather than repeating the number keeps the fade on the
// padding wherever a rail sets it.
//
// The position is written straight onto the element as custom properties — the
// mask is pure CSS from there — so a scroll never costs a React render.
export function useRailEdgeFade<T extends HTMLElement>(
  railRef: RefObject<T | null>,
) {
  useEffect(() => {
    const rail = railRef.current

    if (!rail) {
      return
    }

    const update = () => {
      const maxScroll = rail.scrollWidth - rail.clientWidth

      // Nothing overflowing: no edge to soften.
      const left = maxScroll <= 0 ? 0 : Math.min(rail.scrollLeft, FADE_WIDTH)
      const right =
        maxScroll <= 0 ? 0 : Math.min(maxScroll - rail.scrollLeft, FADE_WIDTH)

      rail.style.setProperty('--rail-fade-left', `${Math.max(left, 0)}px`)
      rail.style.setProperty('--rail-fade-right', `${Math.max(right, 0)}px`)
    }

    // Reading these back costs a style flush, and they only change when the
    // rail is laid out again, so they stay off the scroll path. The scrollbar
    // is whatever height it takes out of the box — zero where the platform
    // floats it over the content instead of reserving room for it.
    const measureBox = () => {
      const style = getComputedStyle(rail)

      rail.style.setProperty('--rail-fade-top', style.paddingTop)
      rail.style.setProperty('--rail-fade-bottom', style.paddingBottom)
      rail.style.setProperty(
        '--rail-scrollbar',
        `${rail.offsetHeight - rail.clientHeight}px`,
      )
    }

    const resize = () => {
      measureBox()
      update()
    }

    resize()

    rail.addEventListener('scroll', update, { passive: true })

    // The rail is sized off the viewport, and the tiles arrive lazily, so both
    // the box and its contents can change under a scroll position that hasn't.
    const observer = new ResizeObserver(resize)
    observer.observe(rail)

    for (const child of Array.from(rail.children)) {
      observer.observe(child)
    }

    return () => {
      rail.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [railRef])
}
