import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import '@fontsource-variable/dm-sans'
import '@fontsource-variable/noto-serif-sc'
import './styles.css'
import './theme.css'

createRoot(document.getElementById('root')).render(<App />)
