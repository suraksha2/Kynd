import { Apple, Play } from 'lucide-react'

export default function StoreButtons({ className = '' }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 ${className}`}>
      <a href="#" className="store-btn">
        <Play className="w-5 h-5" />
        <span className="label">
          <span className="small block">GET IT ON</span>
          <span className="big block">Google Play</span>
        </span>
      </a>
      <a href="#" className="store-btn">
        <Apple className="w-5 h-5" />
        <span className="label">
          <span className="small block">Download on the</span>
          <span className="big block">App Store</span>
        </span>
      </a>
    </div>
  )
}
