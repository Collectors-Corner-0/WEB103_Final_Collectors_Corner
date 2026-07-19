import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { BrowserRouter, Route, Routes } from "react-router-dom"
// import PrivateRoute from './components/PrivateRoute.jsx'

import './index.css'

import App from './App.jsx'
import Header from './components/Header.jsx'
import NotFound from './routes/NotFound.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Header />} >
        <Route index element={<App />} />

        {/* <Route path="signin" element={<SignIn />} /> */}
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>,
)
