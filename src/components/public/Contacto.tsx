import { MapPin, Phone, Mail } from 'lucide-react'

const ADDRESS = 'Carrer de la Previsió, 4, 07001 Palma, Illes Balears'
const PHONE = '+34 971 71 06 70'
const EMAIL = 'hola@casajulio.es'

const MAPS_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3075.4!2d2.6509005!3d39.5697444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1297924fd6a8fa43%3A0xe1816a3404fd2b35!2sRestaurante%20Casa%20Julio!5e0!3m2!1ses!2ses!4v1711000000000!5m2!1ses!2ses'

const CONTACT_ITEMS = [
  {
    icon: MapPin,
    label: 'Direccion',
    content: ADDRESS,
    href: `https://maps.google.com/?q=${encodeURIComponent(ADDRESS)}`,
  },
  {
    icon: Phone,
    label: 'Telefono',
    content: PHONE,
    href: `tel:${PHONE.replace(/\s/g, '')}`,
  },
  {
    icon: Mail,
    label: 'Email',
    content: EMAIL,
    href: `mailto:${EMAIL}`,
  },
] as const

export default function Contacto() {
  return (
    <section id="contacto" className="bg-crema py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="font-heading text-4xl md:text-5xl text-carbon leading-tight">
            Como llegar
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* Info column */}
          <div className="lg:w-2/5 space-y-8 shrink-0">
            {CONTACT_ITEMS.map(({ icon: Icon, label, content, href }) => (
              <div key={label} className="flex gap-4">
                <div className="mt-0.5 flex-shrink-0 w-10 h-10 rounded-full bg-terracota/10 flex items-center justify-center">
                  <Icon
                    size={18}
                    className="text-terracota"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <h3 className="font-sans text-xs font-semibold tracking-widest uppercase text-carbon/50 mb-1">
                    {label}
                  </h3>
                  <a
                    href={href}
                    target={href.startsWith('https') ? '_blank' : undefined}
                    rel={
                      href.startsWith('https')
                        ? 'noopener noreferrer'
                        : undefined
                    }
                    className="font-sans text-carbon text-[15px] hover:text-terracota transition-colors duration-200"
                  >
                    {content}
                  </a>
                </div>
              </div>
            ))}
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
                title="Mapa de ubicacion de Casa Julio"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
