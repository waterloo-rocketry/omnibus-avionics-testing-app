import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { OmnibusProvider } from './components/OmnibusProvider.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <OmnibusProvider>
            <App />
        </OmnibusProvider>
    </StrictMode>
)
