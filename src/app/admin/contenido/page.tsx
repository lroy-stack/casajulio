'use client';

import { useEffect, useState, useCallback } from 'react';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

type ConfigMap = Record<string, string>;

async function fetchConfig(): Promise<ConfigMap> {
  const { data, error } = await supabase.from('configuracion').select('clave, valor');
  if (error) throw new Error(error.message);
  return Object.fromEntries((data ?? []).map((row) => [row.clave, row.valor]));
}

async function saveKeys(updates: ConfigMap): Promise<void> {
  const rows = Object.entries(updates).map(([clave, valor]) => ({
    clave,
    valor,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase
    .from('configuracion')
    .upsert(rows, { onConflict: 'clave' });
  if (error) throw new Error(error.message);
}

/* ══════════════════════════════════════════════════════════════════════════ */

export default function AdminContenidoPage() {
  const [config, setConfig] = useState<ConfigMap>({});
  const [loading, setLoading] = useState(true);

  const loadConfig = useCallback(async () => {
    try {
      const data = await fetchConfig();
      setConfig(data);
    } catch {
      toast.error('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  function get(key: string, fallback = '') {
    return config[key] ?? fallback;
  }

  function set(key: string, value: string) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  async function save(keys: string[]) {
    const updates = Object.fromEntries(keys.map((k) => [k, config[k] ?? '']));
    try {
      await saveKeys(updates);
      toast.success('Cambios guardados');
    } catch {
      toast.error('Error al guardar');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-8 animate-spin text-terracota" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-10">
      <h1 className="font-heading text-2xl md:text-3xl text-carbon">Editor de contenido</h1>

      {/* General */}
      <Section
        title="General"
        keys={['tagline']}
        onSave={save}
      >
        <Field label="Tagline del hero">
          <Input
            value={get('tagline')}
            onChange={(e) => set('tagline', e.target.value)}
            placeholder="Cocina de siempre, en el corazón de Palma"
          />
        </Field>
      </Section>

      <Separator />

      {/* Sobre nosotros */}
      <Section
        title="Sobre nosotros"
        keys={['sobre_nosotros']}
        onSave={save}
      >
        <Field label="Texto (separa párrafos con línea en blanco)">
          <Textarea
            value={get('sobre_nosotros')}
            onChange={(e) => set('sobre_nosotros', e.target.value)}
            rows={8}
            placeholder="Casa Julio nació hace más de treinta años..."
          />
          <p className="text-xs text-carbon/40 mt-1">Máximo 3 párrafos recomendado.</p>
        </Field>
      </Section>

      <Separator />

      {/* Contacto */}
      <Section
        title="Contacto y ubicación"
        keys={['telefono', 'direccion', 'email', 'maps_embed_url']}
        onSave={save}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Teléfono">
            <Input
              value={get('telefono')}
              onChange={(e) => set('telefono', e.target.value)}
              placeholder="+34 971 71 06 70"
            />
          </Field>
          <Field label="Email">
            <Input
              value={get('email')}
              onChange={(e) => set('email', e.target.value)}
              placeholder="hola@casajulio.es"
              type="email"
            />
          </Field>
        </div>
        <Field label="Dirección">
          <Input
            value={get('direccion')}
            onChange={(e) => set('direccion', e.target.value)}
            placeholder="Carrer de la Previsió, 4, 07001 Palma"
          />
        </Field>
        <Field label="Google Maps embed URL">
          <Input
            value={get('maps_embed_url')}
            onChange={(e) => set('maps_embed_url', e.target.value)}
            placeholder="https://www.google.com/maps/embed?pb=..."
          />
          <p className="text-xs text-carbon/40 mt-1">
            En Google Maps: Compartir → Insertar mapa → copiar la URL del src del iframe.
          </p>
        </Field>
      </Section>

      <Separator />

      {/* Redes sociales */}
      <Section
        title="Redes sociales"
        keys={['instagram_url', 'facebook_url', 'tripadvisor_url']}
        onSave={save}
      >
        <div className="space-y-3">
          <Field label="Instagram">
            <Input
              value={get('instagram_url')}
              onChange={(e) => set('instagram_url', e.target.value)}
              placeholder="https://instagram.com/casajuliopalma"
            />
          </Field>
          <Field label="Facebook">
            <Input
              value={get('facebook_url')}
              onChange={(e) => set('facebook_url', e.target.value)}
              placeholder="https://facebook.com/casajuliopalma"
            />
          </Field>
          <Field label="TripAdvisor">
            <Input
              value={get('tripadvisor_url')}
              onChange={(e) => set('tripadvisor_url', e.target.value)}
              placeholder="https://tripadvisor.com/..."
            />
          </Field>
        </div>
      </Section>

      <Separator />

      {/* Reservas */}
      <Section
        title="Configuración de reservas"
        keys={['max_mesas_por_franja', 'dias_cerrado']}
        onSave={save}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Máximo de mesas por franja horaria">
            <Input
              value={get('max_mesas_por_franja', '4')}
              onChange={(e) => set('max_mesas_por_franja', e.target.value)}
              type="number"
              min="1"
              max="20"
              placeholder="4"
            />
            <p className="text-xs text-carbon/40 mt-1">
              Cuando se alcance este número, la franja aparecerá como completa.
            </p>
          </Field>
          <Field label="Día(s) cerrado">
            <Input
              value={get('dias_cerrado', 'martes')}
              onChange={(e) => set('dias_cerrado', e.target.value)}
              placeholder="martes"
            />
            <p className="text-xs text-carbon/40 mt-1">
              Escribe el día en minúsculas. Ej: &ldquo;martes&rdquo; o &ldquo;lunes,martes&rdquo;.
            </p>
          </Field>
        </div>
      </Section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* Helper components                                                          */
/* ══════════════════════════════════════════════════════════════════════════ */

interface SectionProps {
  title: string;
  keys: string[];
  onSave: (keys: string[]) => Promise<void>;
  children: React.ReactNode;
}

function Section({ title, keys, onSave, children }: SectionProps) {
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(keys);
    setSaving(false);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg text-carbon">{title}</h2>
        <Button
          onClick={handleSave}
          disabled={saving}
          size="sm"
          className="gap-2 bg-terracota hover:bg-terracota-dark text-white"
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          Guardar
        </Button>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-carbon/70">{label}</Label>
      {children}
    </div>
  );
}
