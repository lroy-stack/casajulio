import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Salad, Flame, Fish, CakeSlice } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICONS: readonly LucideIcon[] = [Salad, Flame, Fish, CakeSlice];

export default async function CartaPreview() {
  const t = await getTranslations('cartaPreview');

  const categories = [0, 1, 2, 3].map((i) => ({
    nombre: t(`cat${i}` as 'cat0' | 'cat1' | 'cat2' | 'cat3'),
    descripcion: t(`cat${i}_desc` as 'cat0_desc' | 'cat1_desc' | 'cat2_desc' | 'cat3_desc'),
    icon: ICONS[i],
  }));

  return (
    <section className="bg-crema py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block mb-4 text-terracota font-sans text-xs tracking-[0.25em] uppercase">
            {t('label')}
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-carbon leading-tight">
            {t('titulo')}
          </h2>
          <p className="mt-4 font-sans text-carbon/60 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            {t('subtitulo')}
          </p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {categories.map(({ nombre, descripcion, icon: Icon }) => (
            <div
              key={nombre}
              className="group bg-crema-light border border-border rounded-xl p-7 hover:shadow-md transition-shadow duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-terracota/10 flex items-center justify-center mb-4">
                <Icon size={20} className="text-terracota" aria-hidden="true" />
              </div>
              <h3 className="font-display text-2xl text-carbon mb-2">{nombre}</h3>
              <p className="font-sans text-sm text-carbon/65 leading-relaxed">{descripcion}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/carta"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-terracota hover:bg-terracota-dark text-crema-light font-sans text-sm tracking-wide rounded-full transition-colors duration-200"
          >
            {t('cta')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
