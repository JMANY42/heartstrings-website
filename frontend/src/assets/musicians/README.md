# Musician photos

One photo per musician, named after that musician's `slug` in
`src/data/musicians.ts`. The entry with `slug: 'ava-nguyen'` takes the file
`ava-nguyen.jpg`.

Supported extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.gif`. They
are picked up automatically at build time.

Square or close to it works best — a photo is cropped to a square at the top of
the card, so a face near the centre survives the crop. A musician without a
photo gets their initials in a soft circle instead, so the card still reads as
finished while the photo is being chased.
