import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const siteUrl = 'https://heartstringsutd.org'

/* Writes sitemap.xml into the build. The fixed pages are listed here; event
   pages come from src/data/events.ts. That file builds its entries with
   import.meta.glob, so it can't be imported from this config — its uncommented
   `slug: '…'` lines are read instead, and a commented-out event stays off the
   sitemap just as it stays off the site. /member-links is left out on purpose:
   it is for members, and robots.txt asks crawlers to skip it. */
function sitemap(): Plugin {
  return {
    name: 'heartstrings-sitemap',
    apply: 'build',
    generateBundle() {
      const events = fs.readFileSync(path.resolve(__dirname, 'src/data/events.ts'), 'utf8')
      const slugs = [...events.matchAll(/^\s*slug:\s*['"]([^'"]+)['"]/gm)].map((match) => match[1])
      const paths = ['/', '/musicians', '/events', ...slugs.map((slug) => `/events/${slug}`)]
      const urls = paths.map((page) => `  <url><loc>${siteUrl}${page}</loc></url>`).join('\n')

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), sitemap()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
