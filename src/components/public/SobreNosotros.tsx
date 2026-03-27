import { getTranslations } from 'next-intl/server';

export default async function SobreNosotros() {
  const t = await getTranslations('sobre');

  const paragraphs = [t('p1'), t('p2'), t('p3')];

  return (
    <section id="sobre-nosotros" className="texture-paper relative bg-crema py-20 md:py-28 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center gap-12 lg:gap-20">
          {/* Image column */}
          <div className="md:w-2/5 shrink-0">
            <div className="relative">
              <div className="absolute -inset-3 rounded-2xl border border-terracota/20" />
              <img
                src="https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80"
                alt="El interior cálido de Casa Julio"
                className="relative w-full aspect-[4/5] object-cover rounded-xl shadow-lg"
                loading="lazy"
              />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border-r-2 border-b-2 border-terracota/30 rounded-br-xl" />
            </div>
          </div>

          {/* Text column */}
          <div className="md:w-3/5">
            <span className="inline-block mb-4 text-terracota font-sans text-xs tracking-[0.25em] uppercase">
              {t('label')}
            </span>

            <h2 className="font-display text-4xl md:text-5xl text-carbon mb-8 leading-tight">
              {t('titulo')}
            </h2>

            <div className="space-y-5">
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="font-sans text-carbon/75 leading-relaxed text-[15px] md:text-base">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Horarios */}
            <div className="mt-10 pt-8 border-t border-border">
              <h3 className="font-display text-xl text-carbon mb-4">{t('horarios_titulo')}</h3>
              <p className="font-sans text-sm text-carbon/65">{t('horario_valor')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
