# Event photos

One folder per event, named after the event's `slug` in `src/data/events.ts`.
This folder is `breaking-taboo`, so its photos show on `/events/breaking-taboo`.

- `highlight.<ext>` — the wide photo at the top of the page. Landscape works
  best: it is cropped to roughly 21:9 on a desktop screen and 16:10 on a phone.
- everything else — the photo rail lower down, in filename order. Name them
  `photo_1`, `photo_2`, ... to keep that order obvious.

Supported extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.gif`. They
are picked up automatically at build time.

Until a folder has photos of its own, the page borrows the home page gallery
images so nothing renders empty. Captions for the rail come from
`photoCaptions` on the event, matched to the files in order.
