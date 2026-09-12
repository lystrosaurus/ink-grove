import React, { lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'

// A full document navigation switches products, so neither shell carries the other's CSS or state.
const seedExperience = /^\/seed(?:\/|$)/.test(window.location.pathname)
let launchSearchRequested = false
function captureLaunchSearch(event) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    launchSearchRequested = true
  }
}
if (!seedExperience) window.addEventListener('keydown', captureLaunchSearch)
function inkReady(openSearch) {
  window.removeEventListener('keydown', captureLaunchSearch)
  if (launchSearchRequested) {
    launchSearchRequested = false
    openSearch()
  }
}
if (seedExperience) {
  document.title = 'Seed Grove · 小小思考家'
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute('content', '一座可以自由探索的儿童思考花园。观察、选择、尝试，让发现慢慢长大。')
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#fbf7ed')
  document.querySelector('link[rel="icon"]')?.setAttribute('href', '/seed-icon.svg')
}
const Experience = lazy(async () => {
  if (seedExperience) return import('./seed/SeedApp.jsx')
  const [app] = await Promise.all([
    import('./App.jsx'),
    import('./styles.css'),
    import('./theme.css'),
    import('@fontsource-variable/dm-sans'),
    import('@fontsource-variable/noto-serif-sc'),
  ])
  return app
})
document.body.style.margin = '0'
createRoot(document.getElementById('root')).render(
  <Suspense
    fallback={
      <p role="status" style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        {seedExperience ? '小花园正在醒来…' : '花园正在展开…'}
      </p>
    }
  >
    <Experience onReady={inkReady} />
  </Suspense>,
)
