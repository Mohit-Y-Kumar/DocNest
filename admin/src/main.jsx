import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'react-toastify/dist/ReactToastify.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminContextProvider from './context/AdminContext.jsx';
import DoctorContextProvider from './context/DoctorContext.jsx';
import AppContextProvider from './context/AppContext.jsx';
import axios from 'axios'
import { setupCsrfInterceptor } from './utils/csrfToken.js'

axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true'
axios.defaults.withCredentials = true
setupCsrfInterceptor(axios)

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AdminContextProvider>
      <DoctorContextProvider>
        <AppContextProvider>
          <App />

        </AppContextProvider>
      </DoctorContextProvider>
    </AdminContextProvider>
  </BrowserRouter>,
)
