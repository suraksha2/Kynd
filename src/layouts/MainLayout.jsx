import React, { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonBadge,
} from '@ionic/react'
import {
  homeOutline,
  sparklesOutline,
  cartOutline,
  helpCircleOutline,
} from 'ionicons/icons'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'

export default function MainLayout() {
  const { pathname, hash } = useLocation()
  const navigate = useNavigate()
  const { items } = useCart() || { items: [] }
  const cartCount = (items || []).reduce((sum, i) => sum + (i.qty || 1), 0)

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return }
    }
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [pathname, hash])

  const tabs = [
    { tab: 'home',     path: '/',         icon: homeOutline,        label: 'Home' },
    { tab: 'services', path: '/services', icon: sparklesOutline,    label: 'Services' },
    { tab: 'cart',     path: '/cart',     icon: cartOutline,        label: 'Cart' },
    { tab: 'support',  path: '/support',  icon: helpCircleOutline,  label: 'Support' },
  ]

  const activeTab =
    tabs.find((t) => t.path !== '/' && pathname.startsWith(t.path))?.tab ||
    (pathname === '/' ? 'home' : '')

  return (
    <div className="min-h-full flex flex-col">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />

      {/* Ionic bottom tab bar — mobile only (native-feel nav) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-neutral-200 bg-white tabbar-safe">
        <IonTabBar selectedTab={activeTab}>
          {tabs.map((t) => (
            <IonTabButton
              key={t.tab}
              tab={t.tab}
              onClick={() => navigate(t.path)}
            >
              <IonIcon icon={t.icon} />
              <IonLabel>{t.label}</IonLabel>
              {t.tab === 'cart' && cartCount > 0 && (
                <IonBadge color="success">{cartCount}</IonBadge>
              )}
            </IonTabButton>
          ))}
        </IonTabBar>
      </div>
    </div>
  )
}
