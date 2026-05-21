import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'helpr.cart.v1'

const parsePrice = (str = '') => {
  const n = parseInt(String(str).replace(/[^0-9]/g, ''), 10)
  return Number.isFinite(n) ? n : 0
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
  }, [items])

  const addItem = (svc, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.slug === svc.slug)
      if (existing) {
        return prev.map(i => i.slug === svc.slug ? { ...i, qty: i.qty + qty } : i)
      }
      return [...prev, {
        slug: svc.slug,
        name: svc.name,
        img: svc.img,
        priceFrom: parsePrice(svc.pricingFrom),
        duration: svc.duration,
        qty
      }]
    })
  }

  const removeItem = (slug) => setItems(prev => prev.filter(i => i.slug !== slug))
  const setQty = (slug, qty) => setItems(prev => prev.flatMap(i => {
    if (i.slug !== slug) return [i]
    if (qty <= 0) return []
    return [{ ...i, qty }]
  }))
  const clear = () => setItems([])

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.priceFrom * i.qty, 0), [items])
  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items])

  const value = { items, count, subtotal, addItem, removeItem, setQty, clear }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
