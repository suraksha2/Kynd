import PhoneMockup from '../PhoneMockup'

export default function Steps() {
  const steps = [
    { n: 'STEP 1', t: 'Pick from 18 trusted services', d: 'Browse 18 services in the Helpr app — from hourly bookings to per-task jobs to express cleans.', screen: 'list' },
    { n: 'STEP 2', t: 'Add it to your cart', d: 'Stack multiple tasks into one booking. Your Pro handles them all in a single visit.', screen: 'book' },
    { n: 'STEP 3', t: 'Choose instant, scheduled, or recurring. Pay & done!', d: 'Get a Pro in minutes, book for later, or set up a recurring slot.', screen: 'track' }
  ]
  return (
    <section id="how" className="py-16 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900">Simple steps to a<br />cleaner home.</h2>
          <p className="mt-3 text-neutral-500">Follow these simple steps to get house help in 15 minutes.</p>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map((s, i) => (
            <div key={i} className="rounded-3xl bg-white p-6 flex flex-col items-center text-center shadow-soft border border-neutral-100">
              <div className="rounded-2xl bg-brand-50 p-4 w-full flex items-center justify-center">
                <PhoneMockup screen={s.screen} size="sm" />
              </div>
              <div className="mt-5 text-[11px] font-bold tracking-widest text-brand-700">{s.n}</div>
              <h3 className="mt-1 text-base font-bold text-neutral-900">{s.t}</h3>
              <p className="mt-1 text-sm text-neutral-500 max-w-[260px]">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
