import { getTranslations } from 'next-intl/server';
import { MapPin, Phone, Clock } from 'lucide-react';

const PHONE = '+34 971 71 06 70';
const ADDRESS = 'Carrer de la Previsió, 4, 07001 Palma, Illes Balears';
const MAPS_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3075.4!2d2.6509005!3d39.5697444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1297924fd6a8fa43%3A0xe1816a3404fd2b35!2sRestaurante%20Casa%20Julio!5e0!3m2!1ses!2ses!4v1711000000000!5m2!1ses!2ses';

export default async function ComoLlegar() {
  const t = await getTranslations('contacto');

  return (
    <section id="como-llegar" className="bg-crema py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="inline-block mb-4 text-terracota font-sans text-xs tracking-[0.25em] uppercase">
            {t('label')}
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-carbon leading-tight">
            {t('titulo')}
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          {/* Info column */}
          <div className="lg:w-2/5 space-y-8 shrink-0">
            {/* Address */}
            <div className="flex gap-4">
              <div className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-full bg-terracota/10 flex items-center justify-center">
                <MapPin size={17} className="text-terracota" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-sans text-xs font-semibold tracking-widest uppercase text-carbon/50 mb-1">
                  {t('direccion')}
                </h3>
                <address className="font-sans text-carbon not-italic leading-relaxed text-[15px]">
                  {ADDRESS}
                </address>
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-4">
              <div className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-full bg-terracota/10 flex items-center justify-center">
                <Phone size={17} className="text-terracota" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-sans text-xs font-semibold tracking-widest uppercase text-carbon/50 mb-1">
                  {t('telefono')}
                </h3>
                <a
                  href={`tel:${PHONE.replace(/\s/g, '')}`}
                  className="font-sans text-carbon text-[15px] hover:text-terracota transition-colors duration-200"
                >
                  {PHONE}
                </a>
              </div>
            </div>

            {/* Hours */}
            <div className="flex gap-4">
              <div className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-full bg-terracota/10 flex items-center justify-center">
                <Clock size={17} className="text-terracota" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-sans text-xs font-semibold tracking-widest uppercase text-carbon/50 mb-1">
                  {t('horarios')}
                </h3>
                <p className="font-sans text-sm text-carbon/70">
                  {t('horario_valor', { defaultValue: 'Todos los días · 13:00 – 23:00' })}
                </p>
              </div>
            </div>

            {/* CTA reservar */}
            <div className="pt-2">
              <a
                href="#reservas"
                className="inline-flex items-center gap-2 px-6 py-3 bg-terracota hover:bg-terracota-dark text-crema-light font-sans text-sm tracking-wide rounded-full transition-colors duration-200"
              >
                {t('reservar_cta')}
              </a>
            </div>
          </div>

          {/* Map column */}
          <div className="lg:w-3/5 w-full">
            <div className="rounded-xl overflow-hidden border border-border shadow-sm aspect-[4/3]">
              <iframe
                src={MAPS_EMBED_URL}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t('titulo')}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
