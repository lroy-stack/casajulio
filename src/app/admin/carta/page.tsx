'use client';

import { useEffect, useState, useCallback } from 'react';
import { Loader2, Plus, Pencil, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ALERGENOS, FRANJAS_HORARIAS } from '@/lib/types';
import type { Categoria, Plato, MenuDia, CodigoAlergeno } from '@/lib/types';

type CategoriaConPlatos = Categoria & { platos: Plato[] };

const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
const ALERGENO_ENTRIES = Object.entries(ALERGENOS) as [CodigoAlergeno, { nombre: string; emoji: string }][];

/* ══════════════════════════════════════════════════════════════════════════ */
/* Data helpers                                                               */
/* ══════════════════════════════════════════════════════════════════════════ */

async function fetchCarta(): Promise<CategoriaConPlatos[]> {
  const { data, error } = await supabase
    .from('categorias')
    .select('*, platos(*)')
    .order('orden', { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((cat) => ({
    ...cat,
    platos: ((cat.platos as Plato[]) ?? []).slice().sort((a, b) => a.orden - b.orden),
  }));
}

async function fetchMenus(): Promise<MenuDia[]> {
  const { data, error } = await supabase.from('menus_dia').select('*');
  if (error) throw new Error(error.message);
  return data ?? [];
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* Page                                                                       */
/* ══════════════════════════════════════════════════════════════════════════ */

export default function AdminCartaPage() {
  const [categorias, setCategorias] = useState<CategoriaConPlatos[]>([]);
  const [menus, setMenus] = useState<MenuDia[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [cats, mens] = await Promise.all([fetchCarta(), fetchMenus()]);
      setCategorias(cats);
      setMenus(mens);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar la carta');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-8 animate-spin text-terracota" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="font-heading text-2xl md:text-3xl text-carbon">Editor de carta</h1>

      <Tabs defaultValue="carta">
        <TabsList className="bg-crema border border-border">
          <TabsTrigger value="carta" className="data-[state=active]:bg-terracota data-[state=active]:text-white">
            Carta
          </TabsTrigger>
          <TabsTrigger value="menu" className="data-[state=active]:bg-terracota data-[state=active]:text-white">
            Menú del día
          </TabsTrigger>
        </TabsList>

        <TabsContent value="carta" className="mt-6 space-y-4">
          <CartaTab categorias={categorias} setCategorias={setCategorias} reload={loadData} />
        </TabsContent>

        <TabsContent value="menu" className="mt-6 space-y-4">
          <MenuTab menus={menus} setMenus={setMenus} reload={loadData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* Carta Tab                                                                  */
/* ══════════════════════════════════════════════════════════════════════════ */

interface CartaTabProps {
  categorias: CategoriaConPlatos[];
  setCategorias: React.Dispatch<React.SetStateAction<CategoriaConPlatos[]>>;
  reload: () => Promise<void>;
}

function CartaTab({ categorias, reload }: CartaTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [catDialog, setCatDialog] = useState<{ open: boolean; cat?: Categoria }>({ open: false });
  const [platoDialog, setPlatoDialog] = useState<{ open: boolean; plato?: Plato; categoriaId?: string }>({ open: false });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: 'categoria' | 'plato'; id: string; nombre: string } | null>(null);

  async function handleToggleCategoria(cat: CategoriaConPlatos) {
    const { error } = await supabase
      .from('categorias')
      .update({ activo: !cat.activo })
      .eq('id', cat.id);
    if (error) { toast.error('Error al actualizar'); return; }
    toast.success(cat.activo ? 'Categoría desactivada' : 'Categoría activada');
    await reload();
  }

  async function handleTogglePlato(plato: Plato) {
    const { error } = await supabase
      .from('platos')
      .update({ disponible: !plato.disponible })
      .eq('id', plato.id);
    if (error) { toast.error('Error al actualizar'); return; }
    toast.success(plato.disponible ? 'Plato marcado como agotado' : 'Plato disponible');
    await reload();
  }

  async function handleReorderCategoria(catId: string, direction: 'up' | 'down') {
    const idx = categorias.findIndex((c) => c.id === catId);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === categorias.length - 1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const a = categorias[idx];
    const b = categorias[swapIdx];

    await Promise.all([
      supabase.from('categorias').update({ orden: b.orden }).eq('id', a.id),
      supabase.from('categorias').update({ orden: a.orden }).eq('id', b.id),
    ]);
    await reload();
  }

  async function handleDelete() {
    if (!deleteDialog) return;
    const table = deleteDialog.type === 'categoria' ? 'categorias' : 'platos';
    const { error } = await supabase.from(table).delete().eq('id', deleteDialog.id);
    if (error) { toast.error('Error al eliminar'); return; }
    toast.success(`${deleteDialog.type === 'categoria' ? 'Categoría' : 'Plato'} eliminado`);
    setDeleteDialog(null);
    await reload();
  }

  return (
    <>
      <div className="flex justify-end">
        <Button
          onClick={() => setCatDialog({ open: true })}
          className="gap-2 bg-terracota hover:bg-terracota-dark text-white"
        >
          <Plus className="size-4" />
          Nueva categoría
        </Button>
      </div>

      <div className="space-y-3">
        {categorias.length === 0 && (
          <p className="text-sm text-carbon/40 text-center py-8">No hay categorías. Añade la primera.</p>
        )}
        {categorias.map((cat, idx) => (
          <div key={cat.id} className="rounded-xl border border-border bg-white overflow-hidden">
            {/* Category header */}
            <div className="flex items-center gap-3 p-4">
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === cat.id ? null : cat.id)}
                className="flex-1 flex items-center gap-3 text-left min-w-0"
              >
                <ChevronsUpDown className="size-4 text-carbon/30 shrink-0" />
                <div className="min-w-0">
                  <p className="font-heading text-base text-carbon truncate">{cat.nombre}</p>
                  {cat.descripcion && (
                    <p className="text-xs text-carbon/50 truncate">{cat.descripcion}</p>
                  )}
                </div>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {cat.platos.length} platos
                </Badge>
              </button>

              <div className="flex items-center gap-1 shrink-0">
                <Switch
                  checked={cat.activo}
                  onCheckedChange={() => handleToggleCategoria(cat)}
                  aria-label="Activa"
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleReorderCategoria(cat.id, 'up')}
                  disabled={idx === 0}
                >
                  <ChevronUp className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleReorderCategoria(cat.id, 'down')}
                  disabled={idx === categorias.length - 1}
                >
                  <ChevronDown className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setCatDialog({ open: true, cat })}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteDialog({ open: true, type: 'categoria', id: cat.id, nombre: cat.nombre })}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>

            {/* Platos accordion */}
            {expandedId === cat.id && (
              <div className="border-t border-border bg-crema/30 p-4 space-y-2">
                {cat.platos.length === 0 && (
                  <p className="text-xs text-carbon/40 text-center py-2">Sin platos en esta categoría.</p>
                )}
                {cat.platos.map((plato) => (
                  <div key={plato.id} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-border">
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm font-medium text-carbon truncate">{plato.nombre}</p>
                      <p className="text-xs text-carbon/50">
                        {plato.precio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      </p>
                    </div>
                    <Switch
                      checked={plato.disponible}
                      onCheckedChange={() => handleTogglePlato(plato)}
                      aria-label="Disponible"
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setPlatoDialog({ open: true, plato, categoriaId: cat.id })}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteDialog({ open: true, type: 'plato', id: plato.id, nombre: plato.nombre })}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 mt-2"
                  onClick={() => setPlatoDialog({ open: true, categoriaId: cat.id })}
                >
                  <Plus className="size-3.5" />
                  Nuevo plato
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Category dialog */}
      <CategoriaDialog
        open={catDialog.open}
        categoria={catDialog.cat}
        maxOrden={categorias.length}
        onClose={() => setCatDialog({ open: false })}
        onSave={async () => { setCatDialog({ open: false }); await reload(); }}
      />

      {/* Plato dialog */}
      <PlatoDialog
        open={platoDialog.open}
        plato={platoDialog.plato}
        categoriaId={platoDialog.categoriaId}
        categorias={categorias}
        onClose={() => setPlatoDialog({ open: false })}
        onSave={async () => { setPlatoDialog({ open: false }); await reload(); }}
      />

      {/* Delete confirmation */}
      <Dialog open={!!deleteDialog} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar {deleteDialog?.type === 'categoria' ? 'categoría' : 'plato'}</DialogTitle>
            <DialogDescription>
              ¿Seguro que quieres eliminar <strong>{deleteDialog?.nombre}</strong>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ── Categoria Dialog ──────────────────────────────────────────────────── */

interface CategoriaDialogProps {
  open: boolean;
  categoria?: Categoria;
  maxOrden: number;
  onClose: () => void;
  onSave: () => Promise<void>;
}

function CategoriaDialog({ open, categoria, maxOrden, onClose, onSave }: CategoriaDialogProps) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setNombre(categoria?.nombre ?? '');
      setDescripcion(categoria?.descripcion ?? '');
      setImagenUrl(categoria?.imagen_url ?? '');
    }
  }, [open, categoria]);

  async function handleSave() {
    if (!nombre.trim()) { toast.error('El nombre es obligatorio'); return; }
    setSaving(true);
    try {
      if (categoria) {
        const { error } = await supabase
          .from('categorias')
          .update({ nombre: nombre.trim(), descripcion: descripcion.trim() || null, imagen_url: imagenUrl.trim() || null })
          .eq('id', categoria.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categorias')
          .insert({ nombre: nombre.trim(), descripcion: descripcion.trim() || null, imagen_url: imagenUrl.trim() || null, orden: maxOrden });
        if (error) throw error;
      }
      toast.success(categoria ? 'Categoría actualizada' : 'Categoría creada');
      await onSave();
    } catch {
      toast.error('Error al guardar la categoría');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{categoria ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nombre *</Label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Entrantes" />
          </div>
          <div className="space-y-1.5">
            <Label>Descripción</Label>
            <Textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} placeholder="Descripción breve de la categoría" />
          </div>
          <div className="space-y-1.5">
            <Label>Imagen URL</Label>
            <Input value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} placeholder="https://images.unsplash.com/..." />
            <p className="text-xs text-carbon/40">URL de imagen para el hero de la carta. Recomendado: Unsplash.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-terracota hover:bg-terracota-dark text-white">
            {saving ? <Loader2 className="size-4 animate-spin" /> : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Plato Dialog ──────────────────────────────────────────────────────── */

interface PlatoDialogProps {
  open: boolean;
  plato?: Plato;
  categoriaId?: string;
  categorias: CategoriaConPlatos[];
  onClose: () => void;
  onSave: () => Promise<void>;
}

function PlatoDialog({ open, plato, categoriaId, categorias, onClose, onSave }: PlatoDialogProps) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [catId, setCatId] = useState('');
  const [alergenos, setAlergenos] = useState<CodigoAlergeno[]>([]);
  const [disponible, setDisponible] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setNombre(plato?.nombre ?? '');
      setDescripcion(plato?.descripcion ?? '');
      setPrecio(plato?.precio !== undefined ? String(plato.precio) : '');
      setCatId(plato?.categoria_id ?? categoriaId ?? categorias[0]?.id ?? '');
      setAlergenos(plato ? [...plato.alergenos] : []);
      setDisponible(plato?.disponible ?? true);
    }
  }, [open, plato, categoriaId, categorias]);

  function toggleAlergeno(codigo: CodigoAlergeno, checked: boolean) {
    setAlergenos((prev) =>
      checked ? [...prev, codigo] : prev.filter((a) => a !== codigo)
    );
  }

  async function handleSave() {
    if (!nombre.trim()) { toast.error('El nombre es obligatorio'); return; }
    const precioNum = parseFloat(precio.replace(',', '.'));
    if (isNaN(precioNum) || precioNum < 0) { toast.error('Introduce un precio válido'); return; }

    setSaving(true);
    try {
      const payload = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        precio: precioNum,
        categoria_id: catId,
        alergenos,
        disponible,
      };

      if (plato) {
        const { error } = await supabase.from('platos').update(payload).eq('id', plato.id);
        if (error) throw error;
      } else {
        const catPlatos = categorias.find((c) => c.id === catId)?.platos ?? [];
        const { error } = await supabase.from('platos').insert({ ...payload, orden: catPlatos.length });
        if (error) throw error;
      }
      toast.success(plato ? 'Plato actualizado' : 'Plato creado');
      await onSave();
    } catch {
      toast.error('Error al guardar el plato');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{plato ? 'Editar plato' : 'Nuevo plato'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Nombre *</Label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Paella de marisco" />
            </div>
            <div className="space-y-1.5">
              <Label>Precio (€) *</Label>
              <Input value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="12.50" type="number" step="0.01" min="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Disponible</Label>
              <div className="flex items-center gap-2 h-8">
                <Switch checked={disponible} onCheckedChange={setDisponible} />
                <span className="text-sm text-carbon/60">{disponible ? 'Sí' : 'Agotado'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Descripción</Label>
            <Textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} placeholder="Ingredientes principales..." />
          </div>

          {categorias.length > 1 && (
            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <select
                value={catId}
                onChange={(e) => setCatId(e.target.value)}
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
              >
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Alérgenos</Label>
            <div className="grid grid-cols-2 gap-2">
              {ALERGENO_ENTRIES.map(([codigo, { nombre: label, emoji }]) => (
                <label key={codigo} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <Checkbox
                    checked={alergenos.includes(codigo)}
                    onCheckedChange={(c) => toggleAlergeno(codigo, c === true)}
                  />
                  <span>{emoji} {label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-terracota hover:bg-terracota-dark text-white">
            {saving ? <Loader2 className="size-4 animate-spin" /> : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* Menu del Día Tab                                                           */
/* ══════════════════════════════════════════════════════════════════════════ */

interface MenuTabProps {
  menus: MenuDia[];
  setMenus: React.Dispatch<React.SetStateAction<MenuDia[]>>;
  reload: () => Promise<void>;
}

function MenuTab({ menus, reload }: MenuTabProps) {
  const [menuDialog, setMenuDialog] = useState<{ open: boolean; menu?: MenuDia }>({ open: false });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function handleToggle(menu: MenuDia) {
    const { error } = await supabase.from('menus_dia').update({ activo: !menu.activo }).eq('id', menu.id);
    if (error) { toast.error('Error al actualizar'); return; }
    toast.success(menu.activo ? 'Menú desactivado' : 'Menú activado');
    await reload();
  }

  async function handleDelete() {
    if (!deleteId) return;
    const { error } = await supabase.from('menus_dia').delete().eq('id', deleteId);
    if (error) { toast.error('Error al eliminar'); return; }
    toast.success('Menú eliminado');
    setDeleteId(null);
    await reload();
  }

  return (
    <>
      <div className="flex justify-end">
        <Button
          onClick={() => setMenuDialog({ open: true })}
          className="gap-2 bg-terracota hover:bg-terracota-dark text-white"
        >
          <Plus className="size-4" />
          Nuevo menú
        </Button>
      </div>

      <div className="space-y-3">
        {menus.length === 0 && (
          <p className="text-sm text-carbon/40 text-center py-8">No hay menús configurados.</p>
        )}
        {menus.map((menu) => (
          <div key={menu.id} className="flex items-center gap-3 bg-white rounded-xl border border-border p-4">
            <div className="flex-1 min-w-0">
              <p className="font-heading text-base text-carbon">{menu.nombre}</p>
              <p className="text-sm text-terracota font-semibold">
                {menu.precio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
              </p>
              {menu.descripcion && (
                <p className="text-xs text-carbon/50 mt-1">{menu.descripcion}</p>
              )}
              <p className="text-xs text-carbon/40 mt-1">
                {menu.dias_semana.join(' · ')}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Switch checked={menu.activo} onCheckedChange={() => handleToggle(menu)} />
              <Button variant="ghost" size="icon-sm" onClick={() => setMenuDialog({ open: true, menu })}>
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteId(menu.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <MenuDialog
        open={menuDialog.open}
        menu={menuDialog.menu}
        onClose={() => setMenuDialog({ open: false })}
        onSave={async () => { setMenuDialog({ open: false }); await reload(); }}
      />

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar menú</DialogTitle>
            <DialogDescription>¿Seguro que quieres eliminar este menú? Esta acción no se puede deshacer.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ── Menu Dialog ──────────────────────────────────────────────────────── */

interface MenuDialogProps {
  open: boolean;
  menu?: MenuDia;
  onClose: () => void;
  onSave: () => Promise<void>;
}

function MenuDialog({ open, menu, onClose, onSave }: MenuDialogProps) {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [dias, setDias] = useState<string[]>(DIAS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setNombre(menu?.nombre ?? '');
      setPrecio(menu?.precio !== undefined ? String(menu.precio) : '');
      setDescripcion(menu?.descripcion ?? '');
      setDias(menu?.dias_semana ? [...menu.dias_semana] : [...DIAS]);
    }
  }, [open, menu]);

  function toggleDia(dia: string, checked: boolean) {
    setDias((prev) => checked ? [...prev, dia] : prev.filter((d) => d !== dia));
  }

  async function handleSave() {
    if (!nombre.trim()) { toast.error('El nombre es obligatorio'); return; }
    const precioNum = parseFloat(precio.replace(',', '.'));
    if (isNaN(precioNum) || precioNum < 0) { toast.error('Introduce un precio válido'); return; }

    setSaving(true);
    try {
      const payload = {
        nombre: nombre.trim(),
        precio: precioNum,
        descripcion: descripcion.trim() || null,
        dias_semana: dias,
      };

      if (menu) {
        const { error } = await supabase.from('menus_dia').update(payload).eq('id', menu.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('menus_dia').insert({ ...payload, activo: true });
        if (error) throw error;
      }
      toast.success(menu ? 'Menú actualizado' : 'Menú creado');
      await onSave();
    } catch {
      toast.error('Error al guardar el menú');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{menu ? 'Editar menú' : 'Nuevo menú del día'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Nombre *</Label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Menú 16€" />
            </div>
            <div className="space-y-1.5">
              <Label>Precio (€) *</Label>
              <Input value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="16.00" type="number" step="0.50" min="0" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Descripción</Label>
            <Textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} placeholder="Primero, segundo, postre y bebida incluidos..." />
          </div>
          <div className="space-y-2">
            <Label>Días disponible</Label>
            <div className="grid grid-cols-2 gap-2">
              {DIAS.map((dia) => (
                <label key={dia} className="flex items-center gap-2 text-sm capitalize cursor-pointer">
                  <Checkbox
                    checked={dias.includes(dia)}
                    onCheckedChange={(c) => toggleDia(dia, c === true)}
                  />
                  {dia}
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-terracota hover:bg-terracota-dark text-white">
            {saving ? <Loader2 className="size-4 animate-spin" /> : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
