# About photo

One photo for the right-hand side of the About section, named `photo.<ext>`.

Supported extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.gif`. It is
picked up automatically at build time (see `src/data/about.ts`).

Landscape works best — it is cropped to roughly 4:3 on a phone and 3:2 beside
the copy on a desktop screen, the same crop the founders photo takes, so the
two pictures come out the same size on the page.

Until the file is here, the section borrows a home page gallery image so
nothing renders empty.
