import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Services from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import Cities from './pages/Cities'
import CityDetail from './pages/CityDetail'
import FAQ from './pages/FAQ'
import Support from './pages/Support'
import DeleteAccount from './pages/DeleteAccount'
import { TnC, PrivacyPolicy, CancellationPolicy, Credits } from './pages/Legal'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import BookingConfirmed from './pages/BookingConfirmed'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:slug" element={<ServiceDetail />} />
        <Route path="/cities" element={<Cities />} />
        <Route path="/cities/:slug" element={<CityDetail />} />
        <Route path="/frequently-asked-questions" element={<FAQ />} />
        <Route path="/support" element={<Support />} />
        <Route path="/delete-account" element={<DeleteAccount />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/booking/confirmed" element={<BookingConfirmed />} />
        <Route path="/tnc" element={<TnC />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/cancellation-policy" element={<CancellationPolicy />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
