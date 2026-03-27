import { MapPin, Phone, Clock } from 'lucide-react'

interface ComoLlegarProps {
  direccion?: string
  telefono?: string
  mapsUrl?: string
}

const DEFAULT_MAPS_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3075.4!2d2.6509005!3d39.5697444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1297924fd6a8fa43%3A0xe1816a3404fd2b35!2sRestaurante%20Casa%20Julio!5e0!3m2!1ses!2ses!4v1711000000000!5m2!1ses!2ses'

const HORARIOS_RESUMEN = [
  { dias: 'Lunes – Domingo', horas: '13:00 – 23:00' },
]

export default function ComoLlegar({
  direccion = 'Carrer de la Previsió, 4, 07001 Palma, Illes Balears',
  telefono = '+34 971 71 06 70',
  mapsUrl = DEFAULT_MAPS_URL,
}: ComoLlegarProps) {
  return (
    <section
      id="como-llegar"
      className="bg-crema py-20 md:py-28"
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block mb-4 text-terracota font-sans text-xs tracking-[0.25em] uppercase">
            Visítanos
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-carbon leading-tight">
            Cómo llegar
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
                  Dirección
                </h3>
                <address className="font-sans text-carbon not-italic leading-relaxed text-[15px]">
                  {direccion}
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
                  Teléfono
                </h3>
                <a
                  href={`tel:${telefono.replace(/\s/g, '')}`}
                  className="font-sans text-carbon text-[15px] hover:text-terracota transition-colors duration-200"
                >
                  {telefono}
                </a>
              </div>
            </div>

            {/* Hours */}
            <div className="flex gap-4">
              <div className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-full bg-terracota/10 flex items-center justify-center">
                <Clock size={17} className="text-terracota" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h3 className="font-sans text-xs font-semibold tracking-widest uppercase text-carbon/50 mb-3">
                  Horarios
                </h3>
                <ul className="space-y-2">
                  {HORARIOS_RESUMEN.map(({ dias, horas }) => (
                    <li key={dias} className="flex justify-between gap-4">
                      <span className="font-sans text-sm font-medium text-carbon whitespace-nowrap">
                        {dias}
                      </span>
                      <span className="font-sans text-sm text-carbon/60 text-right">
                        {horas}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Reservations note */}
            <div className="pt-2">
              <a
                href="/#reservas"
                className="inline-flex items-center gap-2 px-6 py-3 bg-terracota hover:bg-terracota-dark text-crema-light font-sans text-sm tracking-wide rounded-full transition-colors duration-200"
              >
                Hacer una reserva
              </a>
            </div>
          </div>

          {/* Map column */}
          <div className="lg:w-3/5 w-full">
            <div className="rounded-xl overflow-hidden border border-border shadow-sm aspect-[4/3]">
              <iframe
                src={mapsUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa de ubicación de Casa Julio"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
