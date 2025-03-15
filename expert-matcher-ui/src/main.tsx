import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import './index.css'
import './css/fonts.css'
import App from './App.tsx'
import i18next from "./i18n/i18n.ts";

i18next.on("languageChanged", (lng) => {
  document.body.dir = i18next.dir();
  document.body.lang = lng;
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
