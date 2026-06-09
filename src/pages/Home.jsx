import Hero from '../components/home/Hero'
import Stats from '../components/home/Stats'
import Services from '../components/home/Services'
import Steps from '../components/home/Steps'
import Reviews from '../components/home/Reviews'
import Faq from '../components/home/Faq'
import DownloadCta from '../components/home/DownloadCta'

export { Stats, Services, Steps, Reviews, Faq, DownloadCta }

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <Services />
      <Steps />
      <Reviews />
      <Faq />
      <DownloadCta />
    </>
  )
}
