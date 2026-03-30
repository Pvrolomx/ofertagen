# HANDOFF — Crear Nuevo Tipo de Contrato en OfertaGen

## Para el duende que va a crear el Contrato de Administración (o cualquier otro)

**Fecha:** 31 Marzo 2026  
**Autor:** Claude (sesión con Arquitecto)  
**Contexto:** Claudia necesita contratos de administración de propiedades para Castle Solutions

---

## QUÉ ES OFERTAGEN

Generador de documentos legales bilingües (ES/EN) que produce Word (.docx) con:
- Tabla lado a lado (español izquierda, inglés derecha)
- Motor de concordancia género/número automático
- Bloques condicionales (cláusulas que se activan/desactivan)
- 100% client-side (sin backend, genera en el browser)

**Live:** https://ofertagen.expatadvisormx.com  
**Repo:** https://github.com/Pvrolomx/ofertagen  
**Stack:** Next.js + Tailwind + docx-js + Vercel

---

## ARQUITECTURA (4 capas)

```
┌─────────────────────────────────────────────────────────────┐
│  1. UI (page.js)                                            │
│     Wizard de N pasos, captura datos, toggles de cláusulas  │
└─────────────────────────┬───────────────────────────────────┘
                          │ datos del formulario
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  2. ENSAMBLADOR (ensamblador.js)                            │
│     Toma datos + plantilla → resuelve concordancia,         │
│     precios, fechas → produce CONTEXTO                      │
└─────────────────────────┬───────────────────────────────────┘
                          │ contexto resuelto
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  3. PLANTILLA (ej: oferta_compra.js)                        │
│     Define campos, bloques, renders con { es, en }          │
│     Cada bloque tiene render(ctx) que produce texto bilingüe│
└─────────────────────────┬───────────────────────────────────┘
                          │ bloques renderizados
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  4. GENERADOR DOCX (generador.js)                           │
│     Convierte bloques → documento Word bilingüe             │
│     Headers, footers, firmas, tabla lado a lado             │
└─────────────────────────────────────────────────────────────┘
```

---

## MOTOR CORE (ya está listo, solo úsalo)

Ubicación: `src/lib/core/`

### concordancia.js
```javascript
import { generarContextoParte } from '@/lib/core';

// Genera contexto lingüístico para una parte del contrato
const ctx = generarContextoParte({
  rol: 'propietario',           // administrador, arrendatario, etc.
  personas: [{ nombre: 'CLAUDIA ROMERO', genero: 'F' }],
  tipoPersona: 'fisica',        // o 'moral'
  usarSingularColectivo: true,  // "el propietario" aunque sea mujer
});

// ctx tiene:
// - referencia: "la propietaria" o "el propietario" (singular colectivo)
// - comparecencia: "CLAUDIA ROMERO, mexicana, mayor de edad..."
// - articulos: { el: "la", un: "una", del: "de la" }
// - verbos: { es: "es", tiene: "tiene", ha: "ha" }
// - en: { referencia: "the owner", ... } // versión inglés
```

### num2words.js
```javascript
import { bloquePrecio, montoALetras, superficieALetrasEn } from '@/lib/core';

const precio = bloquePrecio(5000, 'USD');
// precio.formateado = "$5,000.00 USD"
// precio.letras = "cinco mil dólares estadounidenses 00/100 USD"
// precio.completo = "$5,000.00 USD (cinco mil dólares...)"

const superficie = superficieALetrasEn(129.85);
// "one hundred twenty-nine point eighty-five"
```

### fechas.js
```javascript
import { fechaBilingue, plazo, vencimiento } from '@/lib/core';

const fecha = fechaBilingue('2026-04-15');
// fecha.es = "15 de abril de 2026"
// fecha.en = "April 15, 2026"

const pl = plazo(30, 'naturales');
// pl.esFrase = "treinta (30) días naturales"
// pl.enFrase = "thirty (30) calendar days"
```

---

## CÓMO CREAR UN NUEVO CONTRATO

### Paso 1: Crear la plantilla

Crea `src/lib/plantillas/contrato_administracion.js`:

```javascript
/**
 * Plantilla: Contrato de Administración de Inmueble
 * Castle Solutions — Property Management Agreement
 */

const PLANTILLA_ADMIN = {
  meta: {
    id: 'contrato_administracion',
    nombre: 'Contrato de Administración',
    nombre_en: 'Property Management Agreement',
    version: '1.0',
  },

  // ============================================================
  // PARTES DEL CONTRATO
  // ============================================================
  partes: [
    { id: 'propietario', rol: 'propietario', etiqueta: 'Propietario / Owner' },
    { id: 'administrador', rol: 'administrador', etiqueta: 'Administrador / Manager' },
  ],

  // ============================================================
  // CAMPOS POR SECCIÓN
  // ============================================================
  campos: {
    inmueble: {
      titulo: 'Inmueble',
      campos: [
        { id: 'direccion', tipo: 'textarea', requerido: true, etiqueta: 'Dirección completa' },
        { id: 'tipo_inmueble', tipo: 'select', requerido: true, etiqueta: 'Tipo', 
          opciones: ['Casa', 'Departamento', 'Villa', 'Penthouse'] },
        { id: 'recamaras', tipo: 'numero', requerido: true, etiqueta: 'Recámaras' },
        { id: 'descripcion', tipo: 'textarea', requerido: false, etiqueta: 'Descripción adicional' },
      ],
    },
    servicios: {
      titulo: 'Servicios de Administración',
      campos: [
        { id: 'incluye_renta_vacacional', tipo: 'boolean', default: true, etiqueta: 'Renta vacacional' },
        { id: 'incluye_mantenimiento', tipo: 'boolean', default: true, etiqueta: 'Mantenimiento' },
        { id: 'incluye_pagos', tipo: 'boolean', default: true, etiqueta: 'Pago de servicios' },
      ],
    },
    honorarios: {
      titulo: 'Honorarios',
      campos: [
        { id: 'porcentaje_renta', tipo: 'texto', requerido: true, etiqueta: 'Comisión sobre rentas (%)', placeholder: '25%' },
        { id: 'tarifa_mantenimiento', tipo: 'numero', requerido: false, etiqueta: 'Tarifa mensual mantenimiento (USD)' },
      ],
    },
    vigencia: {
      titulo: 'Vigencia',
      campos: [
        { id: 'fecha_inicio', tipo: 'fecha', requerido: true, etiqueta: 'Fecha de inicio' },
        { id: 'duracion_meses', tipo: 'numero', requerido: true, etiqueta: 'Duración (meses)', default: 12 },
        { id: 'renovacion_automatica', tipo: 'boolean', default: true, etiqueta: 'Renovación automática' },
      ],
    },
  },

  // ============================================================
  // BLOQUES DEL CONTRATO
  // ============================================================
  bloques: [
    // --- ENCABEZADO (siempre activo) ---
    {
      id: 'encabezado',
      tipo: 'encabezado',
      render: (ctx) => ({
        es: `En la ciudad de Puerto Vallarta, Jalisco, México, a ${ctx.fechas.fecha_inicio_es}`,
        en: `In the city of Puerto Vallarta, Jalisco, Mexico, on ${ctx.fechas.fecha_inicio_en}`,
      }),
    },

    // --- COMPARECENCIA ---
    {
      id: 'comparecencia',
      numero: 1,
      titulo: { es: 'COMPARECENCIA', en: 'PARTIES' },
      render: (ctx) => ({
        es: `Comparecen por una parte ${ctx.propietario.comparecencia}, a quien en lo sucesivo se le denominará "EL PROPIETARIO"; y por otra parte ${ctx.administrador.comparecencia}, a quien en lo sucesivo se le denominará "EL ADMINISTRADOR".`,
        en: `Appearing on one hand ${ctx.propietario.comparecencia_en}, hereinafter referred to as "THE OWNER"; and on the other hand ${ctx.administrador.comparecencia_en}, hereinafter referred to as "THE MANAGER".`,
      }),
    },

    // --- OBJETO ---
    {
      id: 'objeto',
      numero: 2,
      titulo: { es: 'OBJETO DEL CONTRATO', en: 'PURPOSE OF THE AGREEMENT' },
      render: (ctx) => ({
        es: `${ctx.propietario.referencia.toUpperCase()} encomienda a ${ctx.administrador.referencia.toUpperCase()} la administración integral del inmueble ubicado en: ${ctx.inmueble.direccion}.`,
        en: `${ctx.propietario.en.referencia.toUpperCase()} entrusts ${ctx.administrador.en.referencia.toUpperCase()} with the comprehensive management of the property located at: ${ctx.inmueble.direccion}.`,
      }),
    },

    // --- BLOQUE CONDICIONAL: Renta Vacacional ---
    {
      id: 'renta_vacacional',
      numero: 3,
      titulo: { es: 'SERVICIOS DE RENTA VACACIONAL', en: 'VACATION RENTAL SERVICES' },
      condicional: true,
      default: true,
      render: (ctx) => ({
        es: `${ctx.administrador.referencia.toUpperCase()} se obliga a:\n\na) Publicar el inmueble en plataformas de renta vacacional (Airbnb, VRBO, Booking, etc.)\nb) Gestionar reservaciones y comunicación con huéspedes\nc) Coordinar check-in y check-out\nd) Supervisar limpieza entre huéspedes`,
        en: `${ctx.administrador.en.referencia.toUpperCase()} agrees to:\n\na) List the property on vacation rental platforms (Airbnb, VRBO, Booking, etc.)\nb) Manage reservations and guest communications\nc) Coordinate check-in and check-out\nd) Supervise cleaning between guests`,
      }),
    },

    // --- HONORARIOS ---
    {
      id: 'honorarios',
      numero: 4,
      titulo: { es: 'HONORARIOS', en: 'FEES' },
      render: (ctx) => ({
        es: `${ctx.propietario.referencia.toUpperCase()} pagará a ${ctx.administrador.referencia.toUpperCase()} los siguientes honorarios:\n\n• Comisión sobre rentas: ${ctx.honorarios.porcentaje_renta} del ingreso bruto por rentas${ctx.honorarios.tarifa_mantenimiento ? '\n• Tarifa mensual de mantenimiento: ' + ctx.honorarios.tarifa_completo : ''}`,
        en: `${ctx.propietario.en.referencia.toUpperCase()} shall pay ${ctx.administrador.en.referencia.toUpperCase()} the following fees:\n\n• Commission on rentals: ${ctx.honorarios.porcentaje_renta} of gross rental income${ctx.honorarios.tarifa_mantenimiento ? '\n• Monthly maintenance fee: ' + ctx.honorarios.tarifa_completo : ''}`,
      }),
    },

    // --- FIRMAS ---
    {
      id: 'firmas',
      tipo: 'firmas',
      render: (ctx) => ({
        firmas: [
          { nombre: ctx.propietario.nombres, rol_es: 'EL PROPIETARIO', rol_en: 'THE OWNER' },
          { nombre: ctx.administrador.nombres, rol_es: 'EL ADMINISTRADOR', rol_en: 'THE MANAGER' },
        ],
      }),
    },
  ],
};

export default PLANTILLA_ADMIN;
```

### Paso 2: Actualizar el ensamblador (si necesitas campos nuevos)

En `src/lib/plantillas/ensamblador.js`, agrega resolución de tus campos específicos:

```javascript
// Ejemplo: resolver honorarios con formato de precio
if (datos.campos?.honorarios?.tarifa_mantenimiento) {
  ctx.honorarios = {
    ...datos.campos.honorarios,
    tarifa_completo: bloquePrecio(datos.campos.honorarios.tarifa_mantenimiento, 'USD').completo,
  };
}
```

### Paso 3: Crear la UI (page.js o nueva página)

**Opción A:** Agregar selector de tipo de contrato en `page.js` existente
**Opción B:** Crear nueva app `admin-gen.expatadvisormx.com` (recomendado para Castle)

Para Opción B, copia la estructura de OfertaGen y cambia:
1. La plantilla importada
2. Los pasos del wizard
3. Los campos del formulario

### Paso 4: Registrar nuevo rol (si es necesario)

En `src/lib/core/concordancia.js`:

```javascript
// Ya existen: comprador, vendedor, propietario, arrendatario, etc.
// Si necesitas "administrador", agrégalo:

registrarRol('administrador', {
  es: {
    singular: { m: 'el administrador', f: 'la administradora' },
    plural: { m: 'los administradores', f: 'las administradoras' },
    articulo: { m: 'el', f: 'la' },
  },
  en: {
    singular: 'the manager',
    plural: 'the managers',
  },
});
```

---

## RECETA RÁPIDA (checklist)

```
□ 1. Clonar repo: git clone https://github.com/Pvrolomx/ofertagen
□ 2. Crear plantilla en src/lib/plantillas/[nombre].js
□ 3. Definir partes (quién firma)
□ 4. Definir campos (qué datos capturar)
□ 5. Definir bloques (cláusulas con render ES/EN)
□ 6. Marcar bloques condicionales con { condicional: true, default: false }
□ 7. Agregar resolución en ensamblador.js si hay campos especiales
□ 8. Crear/adaptar UI (wizard de pasos)
□ 9. npm run build → verificar
□ 10. Probar generación de DOCX
□ 11. git push → Vercel auto-deploya
```

---

## ARCHIVOS CLAVE

| Archivo | Propósito | Líneas |
|---------|-----------|--------|
| `src/lib/plantillas/oferta_compra.js` | Ejemplo completo de plantilla | ~970 |
| `src/lib/plantillas/ensamblador.js` | Motor que resuelve contexto | ~340 |
| `src/lib/core/concordancia.js` | Concordancia género/número | ~400 |
| `src/lib/core/num2words.js` | Números a letras | ~280 |
| `src/lib/core/fechas.js` | Fechas bilingües | ~150 |
| `src/lib/docx/generador.js` | Genera el Word | ~540 |
| `src/app/page.js` | UI del wizard | ~520 |

---

## TIPS

1. **Copia un bloque existente** de `oferta_compra.js` y modifícalo — es más fácil que empezar de cero

2. **El singular colectivo** es tu amigo: "el propietario" funciona para hombre, mujer o varios — el motor lo resuelve

3. **Los bloques condicionales** se omiten limpiamente si están OFF — no dejan huecos

4. **Prueba con Demo primero** — carga datos de ejemplo y verifica el DOCX antes de llenar todo manualmente

5. **El generador DOCX es genérico** — no necesitas tocarlo, solo pásale bloques con `{ es, en }`

---

## CONTEXTO DE NEGOCIO

**Castle Solutions** (Claudia) maneja:
- Renta vacacional (Airbnb, VRBO)
- Mantenimiento de propiedades
- Pago de servicios (CFE, agua, internet, HOA)
- Check-in/check-out de huéspedes
- Supervisión de limpieza

El contrato de administración debe cubrir:
- Alcance de servicios (qué incluye, qué no)
- Honorarios (% sobre rentas + tarifa fija opcional)
- Duración y renovación
- Responsabilidades del propietario
- Causales de terminación
- Entrega de llaves/accesos

---

## CREDENCIALES

```
GitHub PAT: [ver canal o TOKENS.md en RPi]
Vercel Token: [ver canal o TOKENS.md en RPi]
```

Deploy: `git push origin main` → Vercel auto-deploya

---

¡Suerte, duende! 🐝

*— Generado por la Colmena, Marzo 2026*
