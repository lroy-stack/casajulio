import Header from '@/components/public/Header';
import Hero from '@/components/public/Hero';
import SobreNosotros from '@/components/public/SobreNosotros';
import CartaPreview from '@/components/public/CartaPreview';
import ReservasForm from '@/components/public/ReservasForm';
import Contacto from '@/components/public/Contacto';
import Footer from '@/components/public/Footer';
import BottomNav from '@/components/public/BottomNav';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <SobreNosotros />
        <CartaPreview />
        <ReservasForm />
        <Contacto />
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}
