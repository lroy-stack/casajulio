import { getCartaCompleta, getMenusDia } from '@/lib/queries';
import { CartaContent } from '@/components/public/CartaContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nuestra Carta | Casa Julio',
  description:
    'Descubre nuestra carta de cocina mediterránea con productos frescos de temporada en Casa Julio, Palma de Mallorca.',
};

export default async function CartaPage() {
  const [categorias, allMenus] = await Promise.all([
    getCartaCompleta(),
    getMenusDia(),
  ]);

  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long' });
  const activeMenus = allMenus.filter(
    (menu) =>
      menu.activo &&
      (menu.dias_semana.length === 0 ||
        menu.dias_semana.some(
          (dia) => dia.toLowerCase() === today.toLowerCase(),
        )),
  );

  return (
    <div className="min-h-screen bg-crema-light">
      <section className="py-12 px-4 text-center bg-crema">
        <p className="font-sans text-sm tracking-widest uppercase text-terracota mb-3">
          Casa Julio · Palma de Mallorca
        </p>
        <h1 className="font-display text-5xl md:text-6xl text-carbon">
          Nuestra Carta
        </h1>
        <p className="mt-4 font-sans text-carbon/60 max-w-xl mx-auto text-base">
          Cocina mediterránea de temporada, elaborada con productos frescos del mercado
        </p>
      </section>

      <section className="px-4 pt-8 pb-32 md:pb-16 max-w-4xl mx-auto">
        <CartaContent categorias={categorias} menusDia={activeMenus} />
      </section>
    </div>
  );
}
