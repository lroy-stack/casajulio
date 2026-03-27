import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function Hero() {
  const t = await getTranslations('hero');

  return (
    <section className="relative flex items-center justify-center min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-carbon/40" aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl mx-auto">
        <span className="animate-fade-up inline-block mb-3 text-terracota-light font-sans text-sm tracking-[0.25em] uppercase">
          {t('subtitulo')}
        </span>

        <h1 className="animate-fade-up-delay-1 font-display text-5xl md:text-7xl lg:text-8xl text-crema-light leading-none tracking-wide">
          Casa Julio
        </h1>

        <p className="animate-fade-up-delay-2 mt-6 font-sans text-lg md:text-xl text-crema-light/80 max-w-xl leading-relaxed">
          {t('tagline')}
        </p>

        <div className="animate-fade-up-delay-3 flex flex-col sm:flex-row items-center gap-4 mt-10">
          <Link
            href="#reservas"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-terracota hover:bg-terracota-dark text-crema-light font-sans text-sm tracking-wide rounded-full transition-colors duration-200 min-w-[160px]"
          >
            {t('cta_reservar')}
          </Link>
          <Link
            href="/carta"
            className="inline-flex items-center justify-center px-8 py-3.5 border border-crema-light text-crema-light hover:bg-crema-light/10 font-sans text-sm tracking-wide rounded-full transition-all duration-200 min-w-[160px]"
          >
            {t('cta_carta')}
          </Link>
        </div>
      </div>
    </section>
  );
}
