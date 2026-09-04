import { useLayoutEffect, useState } from 'react'
import type { RefObject } from 'react'

export type BoxSize = { width: number; height: number }

const EMPTY: BoxSize = { width: 0, height: 0 }

// Reports an element's content box, and updates when it changes. The same
// object is returned while the size holds, so a consumer can depend on it
// without re-rendering on every observation.
export function useBoxSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState<BoxSize>(EMPTY)

  useLayoutEffect(() => {
    const element = ref.current

    if (!element || typeof ResizeObserver === 'undefined') {
      return
    }

    const measure = () => {
      const { clientWidth, clientHeight } = element

      setSize((previous) =>
        previous.width === clientWidth && previous.height === clientHeight
          ? previous
          : { width: clientWidth, height: clientHeight },
      )
    }

    measure()

    const observer = new ResizeObserver(measure)

    observer.observe(element)

    return () => observer.disconnect()
  }, [ref])

  return size
}
