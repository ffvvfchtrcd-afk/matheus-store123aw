import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { MobileBottomNav } from './MobileBottomNav'
import { ToastContainer } from '../ui/ToastContainer'
import { OfflineBanner } from '../ui/OfflineBanner'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export function Layout() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <ScrollToTop />
      <Navbar />
      <main className="pt-16 pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
      <OfflineBanner />
      <ToastContainer />
    </div>
  )
}
