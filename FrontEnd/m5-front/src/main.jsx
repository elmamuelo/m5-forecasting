import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ForecastUI from './m5-main.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ForecastUI />
  </StrictMode>,
)
