import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// HashRouter (not BrowserRouter): GitHub Pages serves static files with no
// server-side rewrite, so a direct link or refresh on a non-root route would
// 404 under BrowserRouter. Hash routes never reach the server, so this works
// regardless of host.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
