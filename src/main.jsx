import './force-motion.js' // must run before anything reads prefers-reduced-motion
import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import './styles/app.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(<App />)
