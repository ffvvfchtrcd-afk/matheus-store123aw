import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { ToastContainer } from '../ui/ToastContainer'
import { OfflineBanner } from '../ui/OfflineBanner'
import { ToastProvider } from '../../context/ToastContext'

export function Layout() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-surface text-text-primary">
        <Navbar />
        <main className="pt-16">
          <Outlet />
        </main>
        <Footer />
        <OfflineBanner />
        <ToastContainer />
      </div>
    </ToastProvider>
  )
}
