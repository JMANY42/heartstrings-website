import { useLayoutEffect } from 'react'
import type { RefObject } from 'react'

// How close the corners of the text block may come to the ring. A centred
// rectangle fits exactly when its diagonal equals the diameter, so this is
// nearly 1 — the block's corners are the emptiest part of it anyway, since the
// lines are ragged and centred.
const CLEARANCE = 0.98
const STEPS = 9

// Sizes each circle's text to fill it. The markup already carries a size worked
// out from the character count, which is what a reader without JavaScript gets;
// this measures what the browser actually rendered — with the real font, at the
// real width — and searches for the largest size whose text block still fits
// inside the ring.
//
// The block is centred, so the test is whether its corners clear the circle:
// √(width² + height²) ≤ diameter. Everything inside the block is set in `em`,
// so one number per circle drives the quote and its attribution together.
export function useCircleTextFit(
  root: RefObject<HTMLElement | null>,
  layoutKey: string,
) {
  useLayoutEffect(() => {
    const cloud = root.current

    if (!cloud || typeof ResizeObserver === 'undefined') {
      return
    }

    const fit = () => {
      cloud.querySelectorAll<HTMLElement>('[data-circle]').forEach((circle) => {
        const block = circle.querySelector<HTMLElement>('[data-circle-text]')
        const diameter = circle.clientWidth

        if (!block || diameter === 0) {
          return
        }

        const limit = diameter * CLEARANCE
        let small = diameter * 0.02
        let large = diameter * 0.22

        for (let step = 0; step < STEPS; step += 1) {
          const size = (small + large) / 2

          block.style.fontSize = `${size}px`

          const { width, height } = block.getBoundingClientRect()

          if (Math.hypot(width, height) <= limit) {
            small = size
          } else {
            large = size
          }
        }

        block.style.fontSize = `${small}px`
      })
    }

    fit()

    // The quotes are set in webfonts, so the first measurement is of whatever
    // fell back until they arrive. Measure again once they have.
    let stale = false

    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        if (!stale) {
          fit()
        }
      })
    }

    // The cloud is sized by the screen, never by its own contents, so watching
    // it cannot feed back into itself.
    const observer = new ResizeObserver(() => fit())

    observer.observe(cloud)

    return () => {
      stale = true
      observer.disconnect()
    }
  }, [root, layoutKey])
}
