import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './RxReady.jsx'
import './index.css'

// Note: StrictMode is intentionally omitted — the live "Shift" mode uses
// real-time intervals, and StrictMode's double-invoke in dev can briefly
// duplicate timers. The component cleans up its own effects.
createRoot(document.getElementById('root')).render(<App />)
