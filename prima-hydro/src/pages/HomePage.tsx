import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Hero from '../components/home/Hero'
import Services from '../components/home/Services'
import Configurator from '../components/configurator/Configurator'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Services />
        <Configurator />
      </main>
      <Footer />
    </div>
  )
}
