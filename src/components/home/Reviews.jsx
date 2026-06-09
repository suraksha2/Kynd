import { Star } from 'lucide-react'

export default function Reviews() {
  const data = [
    { n: 'Kirti', loc: 'Sector 56', r: "I'd say it was great value for money. The urgency was handled well, without compromising quality. Really satisfied with the experience." },
    { n: 'Neha', loc: 'Sector 57', r: 'The service was simple and effective. It met my expectations without any hassle. Good overall experience.' },
    { n: 'Pradnyesh', loc: 'Suncity', r: 'Great work, my home was left spotless and fresh. The cleaning was thorough, and I appreciated the attention to detail. 👍🏼' },
    { n: 'Ridhi Saluja', loc: 'Sector 56', r: 'The services have definitely improved from the first time. Preferences are kept as top priority. Thank you for making our lives easier with Helpr!' },
    { n: 'Ritika', loc: 'Sector 57', r: 'Seamless experience from booking to completion. The staff was courteous, punctual, and did a fantastic job.' },
    { n: 'Sameer', loc: 'Sector 57', r: 'Really liked your service, it was smooth, efficient, and just what I needed. Would definitely recommend to others. 🌟' },
    { n: 'Karishma', loc: 'Suncity', r: 'Absolutely excellent service! The team was prompt and professional throughout. Would love to use it again.' },
    { n: 'Rabia', loc: 'Suncity', r: 'Really impressive compared to other platforms. The service was reliable and professional. Communication was clear and fast — very pleased!' }
  ]
  return (
    <section id="reviews" className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900">Loved by Helpr<br />homes.</h2>
          <p className="mt-3 text-neutral-500">Real reviews from real homes across India.</p>
        </div>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.map((u, i) => (
            <div key={i} className="rounded-2xl bg-neutral-50 p-5">
              <div className="flex gap-0.5 text-amber-400 mb-2">
                {Array.from({ length: 5 }).map((_, k) => <Star key={k} className="w-3.5 h-3.5 fill-amber-400" />)}
              </div>
              <p className="text-[13px] text-neutral-700 leading-relaxed">"{u.r}"</p>
              <div className="mt-4">
                <div className="font-semibold text-sm text-neutral-900">{u.n}</div>
                <div className="text-xs text-neutral-500">{u.loc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
