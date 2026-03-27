-- ============================================================
-- Casa Julio — Datos reales del restaurante
-- ============================================================

-- Actualizar configuración con datos verificados
update configuracion set valor = 'Carrer de la Previsió, 4, 07001 Palma, Illes Balears'
  where clave = 'direccion';

update configuracion set valor = '+34 971 71 06 70'
  where clave = 'telefono';

-- Restaurante abierto todos los días según Google Maps (no hay día de cierre)
update configuracion set valor = ''
  where clave = 'dias_cerrado';

-- Embed URL del mapa real
update configuracion set valor = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3075.4!2d2.6509005!3d39.5697444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1297924fd6a8fa43%3A0xe1816a3404fd2b35!2sRestaurante%20Casa%20Julio!5e0!3m2!1ses!2ses!4v1711000000000!5m2!1ses!2ses'
  where clave = 'maps_embed_url';
