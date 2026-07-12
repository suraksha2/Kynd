
export default function PageHero({ title, subtitle, children }) {
  return (
    <section className="pt-32 pb-12 bg-cream">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-neutral-900">{title}</h1>
        {subtitle && <p className="mt-3 text-neutral-700">{subtitle}</p>}
        {children}
      </div>
    </section>
  )
}
