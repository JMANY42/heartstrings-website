import { app } from './app.js'

const port = Number(process.env.PORT ?? 3001)
const debugEnabled = process.env.DEBUG === 'true' || process.env.NODE_ENV !== 'production'

if (debugEnabled) {
  console.debug('[DEBUG] Booting backend server', {
    nodeEnv: process.env.NODE_ENV ?? 'undefined',
    port,
    debug: process.env.DEBUG ?? 'undefined',
  })
}

app.listen(port, () => {
  console.log(`Heartstrings backend listening on port ${port}`)
})
