"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import PLANTILLA from "@/lib/plantillas/convenio_muebles";
import { ensamblarContextoConvenio, renderizarBloquesConvenio, PENDIENTE_MARK } from "@/lib/plantillas/ensamblador_convenio";
import { generarDocxBlob } from "@/lib/docx/generador";

// ============================================================
// INIT
// ============================================================
const INIT = {
  partes: {
    enajenante: { personas: [{ nombre: "", genero: "M" }], tipoPersona: "fisica", nacionalidad: "", nacionalidad_en: "" },
    adquirente: { personas: [{ nombre: "", genero: "F" }], tipoPersona: "fisica", nacionalidad: "", nacionalidad_en: "" },
  },
  bloques: {
    vehiculo: false,
    cl_iva: true,
    cl_pago: true,
    cl_penalidad: true,
    cl_condicion_cruzada: false,
    cl_nota_idioma: true,
  },
  campos: {
    inmueble: { identificacion: "" },
    precio: { precio_muebles: 0, precio_vehiculo: 0, moneda: "USD", deposito: 0 },
    iva: { incluido: true, tasa: "16%" },
    plazos: { dias_deposito: 5, dias_saldo: 5 },
    escrow: { empresa_escrow: "" },
    fechas: { ciudad: "Bucerías, Nayarit", fecha_firma: "" },
    jurisdiccion: { ciudad: "Bucerías, Nayarit" },
    penalidad: { porcentaje: "10%" },
  },
};

const NACIONALIDADES = [
  { v: "", l: "—", en: "" },
  { v: "mexicano", l: "🇲🇽 Mexicano(a)", en: "Mexican" },
  { v: "estadounidense", l: "🇺🇸 Estadounidense", en: "American" },
  { v: "canadiense", l: "🇨🇦 Canadiense", en: "Canadian" },
];

const ESCROW = [
  "", "ARMOUR SECURE ESCROW, S DE RL DE CV", "SECURE TITLE LATIN AMERICA INC",
  "STEWART TITLE LATIN AMERICA", "TLA — TITLE LATIN AMERICA",
];

// ============================================================
// HELPERS
// ============================================================
function ensamblar(data) {
  try { return ensamblarContextoConvenio(PLANTILLA, data); }
  catch (e) { console.error("ensamblar convenio:", e.message); return null; }
}
function renderBlks(ctx) {
  if (!ctx) return [];
  try { return renderizarBloquesConvenio(PLANTILLA, ctx); }
  catch (e) { console.error("render convenio:", e.message); return []; }
}

function Input({ label, value, onChange, type = "text", placeholder = "", wide, rows, hint }) {
  return (
    <div className={`flex flex-col gap-1 ${wide ? "col-span-2" : ""}`}>
      <label className="text-xs font-medium" style={{ color: "var(--og-secondary)" }}>{label}</label>
      {rows ? (
        <textarea value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
          className="border rounded-lg px-3 py-2 text-sm outline-none resize-y" />
      ) : (
        <input type={type} value={value ?? ""} onChange={e => onChange(type === "number" ? +e.target.value : e.target.value)}
          placeholder={placeholder} step={type === "number" ? "any" : undefined}
          className="border rounded-lg px-3 py-2 text-sm outline-none" />
      )}
      {hint && <p className="text-xs" style={{ color: "var(--og-secondary)" }}>{hint}</p>}
    </div>
  );
}

function Toggle({ label, sub, checked, onChange, warn }) {
  return (
    <div onClick={() => onChange(!checked)}
      className="col-span-2 flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all"
      style={{ background: "var(--og-surface)", border: `1px solid ${warn && checked ? "#d97706" : "var(--og-border)"}` }}>
      <div className="w-10 h-5 rounded-full relative transition-colors mt-0.5 shrink-0"
        style={{ background: checked ? (warn ? "#d97706" : "var(--og-primary)") : "var(--og-muted)" }}>
        <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${checked ? "left-5" : "left-0.5"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium" style={{ color: "var(--og-primary)" }}>{label}</div>
        {sub && <p className="text-xs mt-0.5" style={{ color: warn && checked ? "#b45309" : "var(--og-secondary)" }}>{sub}</p>}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold mb-4 pb-2 tracking-wide cog-section-title">{title}</h3>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================
export default function ConvenioMuebles() {
  const [data, setData] = useState(INIT);
  const [generating, setGenerating] = useState(false);
  const [lang2, setLang2] = useState("en");

  // Precarga desde OfertaGen (mismo mecanismo que ContraOfertaGen).
  useEffect(() => {
    try {
      const pre = localStorage.getItem("convenio_preload");
      if (pre) {
        const p = JSON.parse(pre);
        setData(d => ({
          ...d,
          partes: {
            enajenante: { ...d.partes.enajenante, ...(p.partes?.enajenante || {}) },
            adquirente: { ...d.partes.adquirente, ...(p.partes?.adquirente || {}) },
          },
          campos: {
            ...d.campos,
            inmueble: { ...d.campos.inmueble, ...(p.campos?.inmueble || {}) },
            precio: { ...d.campos.precio, ...(p.campos?.precio || {}) },
            escrow: { ...d.campos.escrow, ...(p.campos?.escrow || {}) },
            fechas: { ...d.campos.fechas, ...(p.campos?.fechas || {}) },
            jurisdiccion: { ...d.campos.jurisdiccion, ...(p.campos?.jurisdiccion || {}) },
          },
        }));
        localStorage.removeItem("convenio_preload");
        return;
      }
      const s = localStorage.getItem("convenio_draft");
      if (s) setData(JSON.parse(s));
    } catch {}
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { try { localStorage.setItem("convenio_draft", JSON.stringify(data)); } catch {} }, 800);
    return () => clearTimeout(t);
  }, [data]);

  const upParte = (id, k, v) => setData(d => ({ ...d, partes: { ...d.partes, [id]: { ...d.partes[id], [k]: v } } }));
  const upPersona = (id, k, v) => setData(d => ({
    ...d, partes: { ...d.partes, [id]: { ...d.partes[id], personas: [{ ...d.partes[id].personas[0], [k]: v }] } },
  }));
  const upCampo = (sec, k, v) => setData(d => ({ ...d, campos: { ...d.campos, [sec]: { ...d.campos[sec], [k]: v } } }));
  const togBloque = (id) => setData(d => ({ ...d, bloques: { ...d.bloques, [id]: !d.bloques[id] } }));

  const ctx = useMemo(() => ensamblar(data), [data]);
  const bloques = useMemo(() => renderBlks(ctx), [ctx]);

  const pendientes = useMemo(
    () => bloques.some(b => (b.es || "").includes(PENDIENTE_MARK)),
    [bloques]
  );

  const descargar = useCallback(async () => {
    setGenerating(true);
    try {
      const blob = await generarDocxBlob(bloques, PLANTILLA.meta, {
        idiomaSecundario: lang2,
        borrador: { version: "1.0", exportedAt: new Date().toISOString(), step: 0, data },
      });
      const nombre = data.partes.adquirente.personas[0]?.nombre?.replace(/\s+/g, "_") || "CONVENIO";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CONVENIO_MUEBLES_${nombre}_${new Date().toISOString().slice(0, 10)}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Error al generar el documento: " + e.message);
    } finally { setGenerating(false); }
  }, [bloques, data, lang2]);

  const parteFields = (id, etiqueta) => (
    <Section key={id} title={etiqueta}>
      <Input label="Nombre completo" wide value={data.partes[id].personas[0]?.nombre}
        onChange={v => upPersona(id, "nombre", v)} />
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--og-secondary)" }}>Género</label>
        <select value={data.partes[id].personas[0]?.genero || "M"} onChange={e => upPersona(id, "genero", e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white">
          <option value="M">Masculino</option><option value="F">Femenino</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--og-secondary)" }}>Nacionalidad</label>
        <select value={data.partes[id].nacionalidad || ""}
          onChange={e => {
            const n = NACIONALIDADES.find(x => x.v === e.target.value);
            upParte(id, "nacionalidad", e.target.value);
            upParte(id, "nacionalidad_en", n?.en || "");
          }}
          className="border rounded-lg px-3 py-2 text-sm bg-white">
          {NACIONALIDADES.map(n => <option key={n.v} value={n.v}>{n.l}</option>)}
        </select>
      </div>
    </Section>
  );

  return (
    <div style={{ minHeight: "100vh" }}>
      <header className="px-6 py-4 flex items-center justify-between flex-wrap gap-3"
        style={{ borderBottom: "1px solid var(--og-border)" }}>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--og-primary)" }}>ConvenioGen</h1>
          <p className="text-xs" style={{ color: "var(--og-secondary)" }}>
            Convenio Privado de Enajenación de Bienes Muebles · complemento de OfertaGen
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/" className="px-3 py-1.5 text-xs rounded-lg"
            style={{ background: "var(--og-surface)", border: "1px solid var(--og-border)", color: "var(--og-primary)" }}>
            ← OfertaGen
          </a>
          <select value={lang2} onChange={e => setLang2(e.target.value)}
            className="border rounded-lg px-2 py-1.5 text-xs bg-white">
            <option value="en">ES / EN</option>
            <option value="es">Solo español</option>
          </select>
          <button onClick={descargar} disabled={generating}
            className="px-4 py-1.5 text-xs rounded-lg font-medium text-white"
            style={{ background: "var(--og-primary)", opacity: generating ? 0.6 : 1 }}>
            {generating ? "Generando…" : "Descargar .docx"}
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-6 p-6">
        {/* ---------- FORMULARIO ---------- */}
        <div>
          {parteFields("enajenante", "Enajenante (quien vende los muebles)")}
          {parteFields("adquirente", "Adquirente (quien los compra)")}

          <Section title="Ubicación de los bienes">
            <Input wide rows={3} label="Identificación del inmueble donde se encuentran"
              placeholder="el Departamento 204 del Condominio…, Bahía de Banderas, Nayarit"
              hint="Se usa para ubicar los muebles en las declaraciones y en el Anexo A. Empieza en minúscula: el texto la inserta a media frase."
              value={data.campos.inmueble.identificacion}
              onChange={v => upCampo("inmueble", "identificacion", v)} />
          </Section>

          <Section title="Precio">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: "var(--og-secondary)" }}>Moneda</label>
              <select value={data.campos.precio.moneda} onChange={e => upCampo("precio", "moneda", e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm bg-white">
                <option value="USD">USD</option><option value="MXN">MXN</option><option value="EUR">EUR</option>
              </select>
            </div>
            <Input label={`Precio de los muebles (${data.campos.precio.moneda})`} type="number"
              value={data.campos.precio.precio_muebles} onChange={v => upCampo("precio", "precio_muebles", v)} />
            <Toggle label="Incluye vehículo"
              sub="Agrega el Anexo B, la declaración II y la cláusula de traslado de dominio vehicular."
              checked={data.bloques.vehiculo} onChange={() => togBloque("vehiculo")} />
            {data.bloques.vehiculo && (
              <Input label={`Precio del vehículo (${data.campos.precio.moneda})`} type="number"
                value={data.campos.precio.precio_vehiculo} onChange={v => upCampo("precio", "precio_vehiculo", v)} />
            )}
            <div className="col-span-2 px-1 py-2 text-sm font-medium" style={{ color: "var(--og-secondary)" }}>
              Total del convenio: {((+data.campos.precio.precio_muebles || 0) + (data.bloques.vehiculo ? (+data.campos.precio.precio_vehiculo || 0) : 0)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {data.campos.precio.moneda}
            </div>
          </Section>

          <Section title="IVA">
            <Toggle label="Incluir cláusula de IVA"
              sub="La enajenación de muebles causa IVA. Sin esta cláusula, el impuesto queda sin asignar y suele acabar absorbiéndolo el vendedor."
              checked={data.bloques.cl_iva} onChange={() => togBloque("cl_iva")} />
            {data.bloques.cl_iva && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium" style={{ color: "var(--og-secondary)" }}>El precio pactado…</label>
                  <select value={data.campos.iva.incluido ? "si" : "no"}
                    onChange={e => upCampo("iva", "incluido", e.target.value === "si")}
                    className="border rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="si">…ya incluye el IVA</option>
                    <option value="no">…no incluye el IVA (se traslada aparte)</option>
                  </select>
                </div>
                <Input label="Tasa" value={data.campos.iva.tasa} onChange={v => upCampo("iva", "tasa", v)} />
              </>
            )}
          </Section>

          <Section title="Pago y escrow">
            <Toggle label="Pago a través de escrow" checked={data.bloques.cl_pago} onChange={() => togBloque("cl_pago")} />
            {data.bloques.cl_pago && (
              <>
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-xs font-medium" style={{ color: "var(--og-secondary)" }}>Empresa depositaria</label>
                  <select value={data.campos.escrow.empresa_escrow} onChange={e => upCampo("escrow", "empresa_escrow", e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm bg-white">
                    {ESCROW.map(e => <option key={e} value={e}>{e || "— Selecciona —"}</option>)}
                  </select>
                </div>
                <Input label={`Depósito en garantía (${data.campos.precio.moneda})`} type="number"
                  hint="Déjalo en 0 si el precio se paga en una sola exhibición."
                  value={data.campos.precio.deposito} onChange={v => upCampo("precio", "deposito", v)} />
                <Input label="Días hábiles para el depósito" type="number"
                  value={data.campos.plazos.dias_deposito} onChange={v => upCampo("plazos", "dias_deposito", v)} />
                <Input label="Días hábiles antes del cierre para el saldo" type="number"
                  value={data.campos.plazos.dias_saldo} onChange={v => upCampo("plazos", "dias_saldo", v)} />
              </>
            )}
          </Section>

          <Section title="Cláusulas opcionales">
            <Toggle label="Pena convencional por incumplimiento"
              checked={data.bloques.cl_penalidad} onChange={() => togBloque("cl_penalidad")} />
            {data.bloques.cl_penalidad && (
              <Input label="Porcentaje de la pena" value={data.campos.penalidad.porcentaje}
                hint="Se calcula sobre el total del convenio."
                onChange={v => upCampo("penalidad", "porcentaje", v)} />
            )}
            <Toggle warn label="Condición suspensiva cruzada con la compraventa del inmueble"
              sub="⚠️ Protege el negocio: si se cae la escrituración, se cae el convenio. Pero al atar ambas operaciones refuerza el argumento de que fue UNA sola enajenación, lo que debilita la separación de precios frente al SAT. Actívala con ese costo a la vista."
              checked={data.bloques.cl_condicion_cruzada} onChange={() => togBloque("cl_condicion_cruzada")} />
          </Section>

          <Section title="Lugar, fecha y jurisdicción">
            <Input label="Ciudad de firma" value={data.campos.fechas.ciudad} onChange={v => upCampo("fechas", "ciudad", v)} />
            <Input label="Fecha de firma" type="date" value={data.campos.fechas.fecha_firma}
              onChange={v => upCampo("fechas", "fecha_firma", v)} />
            <Input wide label="Jurisdicción (tribunales competentes)" value={data.campos.jurisdiccion.ciudad}
              onChange={v => upCampo("jurisdiccion", "ciudad", v)} />
            <Toggle label="Nota de prevalencia del idioma español"
              checked={data.bloques.cl_nota_idioma} onChange={() => togBloque("cl_nota_idioma")} />
          </Section>

          <div className="p-3 rounded-xl text-xs" style={{ background: "var(--og-surface)", border: "1px solid var(--og-border)", color: "var(--og-secondary)" }}>
            <strong>Anexo A (inventario):</strong> se elabora aparte, a mano. El convenio solo lo identifica y remite a él;
            hay que adjuntarlo firmado, con la descripción y el valor asignado a cada partida.
          </div>
        </div>

        {/* ---------- PREVIEW ---------- */}
        <div>
          <div className="sticky top-4">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-base font-semibold" style={{ color: "var(--og-primary)" }}>Vista previa</h3>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: pendientes ? "#fef3c7" : "#dcfce7", color: pendientes ? "#92400e" : "#166534" }}>
                {pendientes ? "Faltan datos" : "✓ Sin pendientes"}
              </span>
            </div>
            <div className="rounded-xl overflow-hidden text-xs max-h-[75vh] overflow-y-auto"
              style={{ border: "1px solid var(--og-border)", background: "var(--og-surface)" }}>
              {bloques.map((b, i) => (
                <div key={i} className="grid" style={{ gridTemplateColumns: lang2 === "es" ? "1fr" : "1fr 1fr", borderBottom: "1px solid var(--og-border)" }}>
                  <div className="px-3 py-2.5">
                    {b.titulo?.es && <p className="font-bold mb-1">{b.titulo.es}</p>}
                    {(b.es || "").split("\n\n").map((p, j) => <p key={j} className="mb-1.5">{p}</p>)}
                    {b.firmas && <p className="italic opacity-60">[firmas: {b.firmas.map(f => f.rol_es).join(" · ")}]</p>}
                  </div>
                  {lang2 !== "es" && (
                    <div className="px-3 py-2.5" style={{ color: "var(--og-secondary)", borderLeft: "1px solid var(--og-border)" }}>
                      {b.titulo?.en && <p className="font-bold mb-1">{b.titulo.en}</p>}
                      {(b.en || "").split("\n\n").map((p, j) => <p key={j} className="mb-1.5">{p}</p>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
