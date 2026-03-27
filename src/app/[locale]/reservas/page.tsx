import type { Metadata } from 'next';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import ReservasForm from '@/components/public/ReservasForm';

export const metadata: Metadata = {
  title: 'Reservar mesa | Casa Julio',
  description:
    'Reserva tu mesa en Casa Julio, restaurante de cocina casera mediterránea en Palma de Mallorca.',
};

export default function ReservasPage() {
  return (
    <div className="min-h-screen bg-crema flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <div className="max-w-2xl mx-auto">
          <ReservasForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
