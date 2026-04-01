"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { ensamblarContextoContraoferta, renderizarBloquesContraoferta } from "@/lib/plantillas/ensamblador_contraoferta";
import PLANTILLA from "@/lib/plantillas/contraoferta";
import { generarDocxBlobContraoferta } from "@/lib/docx/generador_contraoferta";

// ============================================================
// INIT DATA
// ============================================================
const INIT = {
  partes: {
    ofertante: { personas: [{ nombre: "", genero: "M" }], tipoPersona: "fisica" },
    propietario: { personas: [{ nombre: "", genero: "F" }], tipoPersona: "fisica" },
  },
  bloques: {
    mod_precio: false,
    mod_fecha: false,
    mod_notario: false,
    mod_coordinador: false,
    mod_vigencia: false,
    mod_deposito: false,
    mod_clausula_libre: false,
  },
  campos: {
    oferta_original: { fecha_oferta: "", descripcion_inmueble: "", precio_original: 0 },
    modificaciones: {},
    aceptacion: { fecha_contraoferta: "", ciudad_contraoferta: "Bucerías, Nayarit", vigencia_horas: 48 },
  },
  quien_presenta: "vendedor",
};

// ============================================================
// i18n UI
// ============================================================
const UI = {
  es: {
    title: "ContraOfertaGen",
    subtitle: "Genera contraoferta trilingüe ES/EN/FR",
    steps: ["Oferta Original", "Modificaciones", "Preview"],
    sections: {
      oferta_original: "Referencia a la oferta original",
      partes: "Partes",
      modificaciones: "¿Qué deseas modificar?",
      aceptacion: "Vigencia de la contraoferta",
      quien_presenta: "¿Quién presenta la contraoferta?",
    },
    fields: {
      fecha_oferta: "Fecha de la oferta original",
      descripcion_inmueble: "Descripción del inmueble",
      precio_original: "Precio original (USD)",
      nombre_ofertante: "Nombre del comprador",
      nombre_propietario: "Nombre del vendedor",
      nuevo_precio: "Nuevo precio (USD)",
      nueva_fecha: "Nueva fecha de formalización",
      nuevo_notario: "Nombre del notario",
      numero_notaria: "Número de notaría",
      ciudad_notaria: "Ciudad",
      nuevo_coordinador: "Nombre del coordinador",
      empresa_coordinador: "Empresa",
      nueva_vigencia: "Nueva fecha de vigencia",
      hora_vigencia: "Hora de vigencia",
      nuevo_deposito: "Nuevo depósito escrow (USD)",
      nueva_empresa_escrow: "Nueva empresa escrow",
      empresa_escrow_manual: "Nombre de empresa (si otra)",
      clausula_es: "Cláusula adicional (ES)",
      clausula_en: "Cláusula adicional (EN)",
      clausula_fr: "Cláusula adicional (FR)",
      fecha_contraoferta: "Fecha de la contraoferta",
      ciudad_contraoferta: "Ciudad",
      vigencia_horas: "Vigencia (horas)",
      vendedor: "Vendedor",
      comprador: "Comprador",
    },
    toggles: {
      mod_precio: "Modificar precio",
      mod_fecha: "Modificar fecha de formalización",
      mod_notario: "Modificar notario",
      mod_coordinador: "Modificar coordinador de cierre",
      mod_vigencia: "Modificar vigencia de la oferta",
      mod_deposito: "Modificar depósito escrow o empresa",
      mod_clausula_libre: "Agregar cláusula adicional",
    },
    nav: { anterior: "Anterior", siguiente: "Siguiente", generar: "Descargar .docx" },
    preview: { title: "Vista previa", idioma: "Idioma secundario" },
    header: { volver: "← Volver a OfertaGen", limpiar: "Limpiar" },
    footer: "Hecho por duendes.app 2026",
  },
  en: {
    title: "ContraOfertaGen",
    subtitle: "Generate trilingual counter-offer ES/EN/FR",
    steps: ["Original Offer", "Modifications", "Preview"],
    sections: {
      oferta_original: "Reference to original offer",
      partes: "Parties",
      modificaciones: "What do you want to modify?",
      aceptacion: "Counter-offer validity",
      quien_presenta: "Who is presenting the counter-offer?",
    },
    fields: {
      fecha_oferta: "Original offer date",
      descripcion_inmueble: "Property description",
      precio_original: "Original price (USD)",
      nombre_ofertante: "Buyer name",
      nombre_propietario: "Seller name",
      nuevo_precio: "New price (USD)",
      nueva_fecha: "New closing date",
      nuevo_notario: "Notary name",
      numero_notaria: "Notary number",
      ciudad_notaria: "City",
      nuevo_coordinador: "Coordinator name",
      empresa_coordinador: "Company",
      nueva_vigencia: "New expiration date",
      hora_vigencia: "Expiration time",
      nuevo_deposito: "New escrow deposit (USD)",
      nueva_empresa_escrow: "New escrow company",
      empresa_escrow_manual: "Company name (if other)",
      clausula_es: "Additional clause (ES)",
      clausula_en: "Additional clause (EN)",
      clausula_fr: "Additional clause (FR)",
      fecha_contraoferta: "Counter-offer date",
      ciudad_contraoferta: "City",
      vigencia_horas: "Validity (hours)",
      vendedor: "Seller",
      comprador: "Buyer",
    },
    toggles: {
      mod_precio: "Modify price",
      mod_fecha: "Modify closing date",
      mod_notario: "Modify notary",
      mod_coordinador: "Modify closing coordinator",
      mod_vigencia: "Modify offer validity",
      mod_deposito: "Modify escrow deposit or company",
      mod_clausula_libre: "Add additional clause",
    },
    nav: { anterior: "Back", siguiente: "Next", generar: "Download .docx" },
    preview: { title: "Preview", idioma: "Secondary language" },
    header: { volver: "← Back to OfertaGen", limpiar: "Clear" },
    footer: "Made by duendes.app 2026",
  },
  fr: {
    title: "ContraOfertaGen",
    subtitle: "Génère une contre-offre trilingue ES/EN/FR",
    steps: ["Offre Originale", "Modifications", "Aperçu"],
    sections: {
      oferta_original: "Référence à l'offre originale",
      partes: "Parties",
      modificaciones: "Que souhaitez-vous modifier?",
      aceptacion: "Validité de la contre-offre",
      quien_presenta: "Qui présente la contre-offre?",
    },
    fields: {
      fecha_oferta: "Date de l'offre originale",
      descripcion_inmueble: "Description du bien",
      precio_original: "Prix original (USD)",
      nombre_ofertante: "Nom de l'acheteur",
      nombre_propietario: "Nom du vendeur",
      nuevo_precio: "Nouveau prix (USD)",
      nueva_fecha: "Nouvelle date de clôture",
      nuevo_notario: "Nom du notaire",
      numero_notaria: "Numéro de notariat",
      ciudad_notaria: "Ville",
      nuevo_coordinador: "Nom du coordinateur",
      empresa_coordinador: "Entreprise",
      nueva_vigencia: "Nouvelle date d'expiration",
      hora_vigencia: "Heure d'expiration",
      nuevo_deposito: "Nouveau dépôt escrow (USD)",
      nueva_empresa_escrow: "Nouvelle société escrow",
      empresa_escrow_manual: "Nom de la société (si autre)",
      clausula_es: "Clause additionnelle (ES)",
      clausula_en: "Clause additionnelle (EN)",
      clausula_fr: "Clause additionnelle (FR)",
      fecha_contraoferta: "Date de la contre-offre",
      ciudad_contraoferta: "Ville",
      vigencia_horas: "Validité (heures)",
      vendedor: "Vendeur",
      comprador: "Acheteur",
    },
    toggles: {
      mod_precio: "Modifier le prix",
      mod_fecha: "Modifier la date de clôture",
      mod_notario: "Modifier le notaire",
      mod_coordinador: "Modifier le coordinateur",
      mod_vigencia: "Modifier la validité",
      mod_deposito: "Modifier le dépôt escrow ou la société",
      mod_clausula_libre: "Ajouter une clause additionnelle",
    },
    nav: { anterior: "Retour", siguiente: "Suivant", generar: "Télécharger .docx" },
    preview: { title: "Aperçu", idioma: "Langue secondaire" },
    header: { volver: "← Retour à OfertaGen", limpiar: "Effacer" },
    footer: "Fait par duendes.app 2026",
  },
};

// ============================================================
// HELPERS
// ============================================================
function ensamblar(data) {
  try { return ensamblarContextoContraoferta(PLANTILLA, data); }
  catch (e) { console.error("ensamblar:", e.message); return null; }
}
function renderBlks(ctx) {
  if (!ctx) return [];
  try { return renderizarBloquesContraoferta(PLANTILLA, ctx); }
  catch (e) { console.error("renderBlks:", e.message); return []; }
}

// ============================================================
// COMPONENTS
// ============================================================
function Input({ label, value, onChange, type = "text", placeholder = "", required, wide, rows }) {
  return (
    <div className={`flex flex-col gap-1 ${wide ? "col-span-2" : ""}`}>
      <label className="text-xs font-medium" style={{ color: "var(--og-secondary)" }}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {rows ? (
        <textarea value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
          className="border rounded-lg px-3 py-2 text-sm outline-none resize-y" />
      ) : (
        <input type={type} value={value || ""} onChange={e => onChange(type === "number" ? +e.target.value : e.target.value)} placeholder={placeholder}
          step={type === "number" ? "any" : undefined}
          className="border rounded-lg px-3 py-2 text-sm outline-none" />
      )}
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <div onClick={() => onChange(!checked)} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
      style={{ background: checked ? "rgba(29,107,184,0.15)" : "var(--og-surface)", border: checked ? "1px solid var(--og-border-hi)" : "1px solid var(--og-border)" }}>
      <div className="w-10 h-5 rounded-full relative transition-colors" style={{ background: checked ? "var(--og-accent)" : "var(--og-muted)" }}>
        <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${checked ? "left-5" : "left-0.5"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium" style={{ color: "var(--og-primary)" }}>{label}</div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold mb-4 pb-2 tracking-wide" style={{ color: "var(--og-accent-hi)", borderBottom: "2px solid var(--og-border-hi)" }}>{title}</h3>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

// ============================================================
// ESCROW COMPANIES CATALOG
// ============================================================
const ESCROW_COMPANIES = [
  { value: "", label: "— Sin cambio / No change —" },
  { value: "ARMOUR SECURE ESCROW, S DE RL DE CV", label: "ARMOUR SECURE ESCROW" },
  { value: "SECURE TITLE LATIN AMERICA INC", label: "SECURE TITLE LATIN AMERICA" },
  { value: "TLA LLC", label: "TLA LLC" },
  { value: "otro_escrow", label: "Otra empresa / Other" },
];

// ============================================================
// MAIN APP
// ============================================================
export default function ContraOfertaGenPage() {
  const [data, setData] = useState(INIT);
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [idiomaUI, setIdiomaUI] = useState("es");
  const [contractLang, setContractLang] = useState("en");
  const t = UI[idiomaUI] || UI.es;
  const steps = t.steps;

  // Check for preloaded data from OfertaGen
  useEffect(() => {
    try {
      const preload = localStorage.getItem("contraoferta_preload");
      if (preload) {
        const parsed = JSON.parse(preload);
        setData(d => ({
          ...d,
          partes: parsed.partes || d.partes,
          campos: {
            ...d.campos,
            oferta_original: {
              fecha_oferta: parsed.fecha_oferta || "",
              descripcion_inmueble: parsed.descripcion_inmueble || "",
              precio_original: parsed.precio_original || 0,
            },
          },
        }));
        localStorage.removeItem("contraoferta_preload");
      }
    } catch { }
  }, []);

  // Auto-save draft
  useEffect(() => {
    try { const s = localStorage.getItem("contraoferta_draft"); if (s) setData(JSON.parse(s)); } catch { }
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => { try { localStorage.setItem("contraoferta_draft", JSON.stringify(data)); } catch { } }, 1000);
    return () => clearTimeout(timer);
  }, [data]);

  const upParte = (pid, k, v) => setData(d => ({ ...d, partes: { ...d.partes, [pid]: { ...d.partes[pid], [k]: v } } }));
  const upPersona = (pid, i, k, v) => setData(d => { const pp = [...d.partes[pid].personas]; pp[i] = { ...pp[i], [k]: v }; return { ...d, partes: { ...d.partes, [pid]: { ...d.partes[pid], personas: pp } } }; });
  const upCampo = (sec, k, v) => setData(d => ({ ...d, campos: { ...d.campos, [sec]: { ...d.campos[sec], [k]: v } } }));
  const togBloque = (id) => setData(d => ({ ...d, bloques: { ...d.bloques, [id]: !d.bloques[id] } }));
  const resetAll = () => { setData(JSON.parse(JSON.stringify(INIT))); setStep(0); localStorage.removeItem("contraoferta_draft"); };

  const ctx = useMemo(() => ensamblar(data), [data]);
  const bloques = useMemo(() => renderBlks(ctx), [ctx]);

  // Generar y descargar DOCX
  const handleGenerate = useCallback(async () => {
    if (generating || !bloques.length) return;
    setGenerating(true);
    try {
      const blob = await generarDocxBlobContraoferta(bloques, PLANTILLA.meta, { idiomaSecundario: contractLang });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const nombre = data.partes?.ofertante?.personas?.[0]?.nombre?.split(" ")[0] || "CONTRAOFERTA";
      const fecha = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `CONTRAOFERTA_${nombre}_${fecha}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generando DOCX:", err);
      alert("Error al generar el documento. Intenta de nuevo.");
    } finally {
      setGenerating(false);
    }
  }, [bloques, contractLang, data.partes, generating]);

  // ── STEP 1: Oferta Original ───────────────────────────────────
  const renderStep1 = () => (
    <>
      <Section title={t.sections.oferta_original}>
        <Input label={t.fields.fecha_oferta} value={data.campos.oferta_original.fecha_oferta} onChange={v => upCampo("oferta_original", "fecha_oferta", v)} type="date" required />
        <Input label={t.fields.precio_original} value={data.campos.oferta_original.precio_original} onChange={v => upCampo("oferta_original", "precio_original", v)} type="number" required />
        <Input label={t.fields.descripcion_inmueble} value={data.campos.oferta_original.descripcion_inmueble} onChange={v => upCampo("oferta_original", "descripcion_inmueble", v)} placeholder="Depto. 5204, La Joya de Mismaloya" required wide />
      </Section>

      <Section title={t.sections.partes}>
        <div className="col-span-2 p-3 rounded-lg" style={{ background: "var(--og-surface)", border: "1px solid var(--og-border)" }}>
          <label className="text-xs font-medium mb-2 block" style={{ color: "var(--og-secondary)" }}>{t.fields.nombre_ofertante}</label>
          <input value={data.partes.ofertante.personas[0].nombre} onChange={e => upPersona("ofertante", 0, "nombre", e.target.value.toUpperCase())}
            placeholder="NOMBRE DEL COMPRADOR" className="rounded-lg px-3 py-2 text-sm outline-none font-medium w-full" />
          <div className="flex gap-2 mt-2">
            {["M", "F"].map(g => (
              <button key={g} onClick={() => upPersona("ofertante", 0, "genero", g)}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${data.partes.ofertante.personas[0].genero === g ? "og-step-active" : "og-genero-off"}`}>{g}</button>
            ))}
          </div>
        </div>

        <div className="col-span-2 p-3 rounded-lg" style={{ background: "var(--og-surface)", border: "1px solid var(--og-border)" }}>
          <label className="text-xs font-medium mb-2 block" style={{ color: "var(--og-secondary)" }}>{t.fields.nombre_propietario}</label>
          <input value={data.partes.propietario.personas[0].nombre} onChange={e => upPersona("propietario", 0, "nombre", e.target.value.toUpperCase())}
            placeholder="NOMBRE DEL VENDEDOR" className="rounded-lg px-3 py-2 text-sm outline-none font-medium w-full" />
          <div className="flex gap-2 mt-2">
            {["M", "F"].map(g => (
              <button key={g} onClick={() => upPersona("propietario", 0, "genero", g)}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${data.partes.propietario.personas[0].genero === g ? "og-step-active" : "og-genero-off"}`}>{g}</button>
            ))}
          </div>
        </div>
      </Section>

      <Section title={t.sections.quien_presenta}>
        <div className="col-span-2 flex gap-3">
          {["vendedor", "comprador"].map(q => (
            <button key={q} onClick={() => setData(d => ({ ...d, quien_presenta: q }))}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${data.quien_presenta === q ? "og-step-active" : "og-genero-off"}`}>
              {t.fields[q]}
            </button>
          ))}
        </div>
      </Section>
    </>
  );

  // ── STEP 2: Modificaciones ────────────────────────────────────
  const renderStep2 = () => (
    <>
      <Section title={t.sections.modificaciones}>
        <div className="col-span-2 flex flex-col gap-3">
          {Object.keys(data.bloques).map(id => (
            <div key={id}>
              <Toggle label={t.toggles[id]} checked={data.bloques[id]} onChange={() => togBloque(id)} />

              {/* Campos condicionales según toggle */}
              {data.bloques[id] && id === "mod_precio" && (
                <div className="mt-2 pl-4 border-l-2" style={{ borderColor: "var(--og-accent)" }}>
                  <Input label={t.fields.nuevo_precio} value={data.campos.modificaciones.nuevo_precio} onChange={v => upCampo("modificaciones", "nuevo_precio", v)} type="number" />
                </div>
              )}

              {data.bloques[id] && id === "mod_fecha" && (
                <div className="mt-2 pl-4 border-l-2" style={{ borderColor: "var(--og-accent)" }}>
                  <Input label={t.fields.nueva_fecha} value={data.campos.modificaciones.nueva_fecha_formalizacion} onChange={v => upCampo("modificaciones", "nueva_fecha_formalizacion", v)} type="date" />
                </div>
              )}

              {data.bloques[id] && id === "mod_notario" && (
                <div className="mt-2 pl-4 border-l-2 grid grid-cols-3 gap-2" style={{ borderColor: "var(--og-accent)" }}>
                  <Input label={t.fields.nuevo_notario} value={data.campos.modificaciones.nuevo_notario_nombre} onChange={v => upCampo("modificaciones", "nuevo_notario_nombre", v)} />
                  <Input label={t.fields.numero_notaria} value={data.campos.modificaciones.nuevo_notario_numero} onChange={v => upCampo("modificaciones", "nuevo_notario_numero", v)} />
                  <Input label={t.fields.ciudad_notaria} value={data.campos.modificaciones.nuevo_notario_ciudad} onChange={v => upCampo("modificaciones", "nuevo_notario_ciudad", v)} />
                </div>
              )}

              {data.bloques[id] && id === "mod_coordinador" && (
                <div className="mt-2 pl-4 border-l-2 grid grid-cols-2 gap-2" style={{ borderColor: "var(--og-accent)" }}>
                  <Input label={t.fields.nuevo_coordinador} value={data.campos.modificaciones.nuevo_coordinador_nombre} onChange={v => upCampo("modificaciones", "nuevo_coordinador_nombre", v)} />
                  <Input label={t.fields.empresa_coordinador} value={data.campos.modificaciones.nuevo_coordinador_empresa} onChange={v => upCampo("modificaciones", "nuevo_coordinador_empresa", v)} />
                </div>
              )}

              {data.bloques[id] && id === "mod_vigencia" && (
                <div className="mt-2 pl-4 border-l-2 grid grid-cols-2 gap-2" style={{ borderColor: "var(--og-accent)" }}>
                  <Input label={t.fields.nueva_vigencia} value={data.campos.modificaciones.nueva_fecha_vigencia} onChange={v => upCampo("modificaciones", "nueva_fecha_vigencia", v)} type="date" />
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium" style={{ color: "var(--og-secondary)" }}>{t.fields.hora_vigencia}</label>
                    <select value={data.campos.modificaciones.nueva_hora_vigencia || "medianoche"} onChange={e => upCampo("modificaciones", "nueva_hora_vigencia", e.target.value)}
                      className="rounded-lg px-3 py-2 text-sm">
                      <option value="medianoche">Medianoche / Midnight</option>
                      <option value="mediodía">Mediodía / Noon</option>
                      <option value="17:00 horas">17:00 hrs</option>
                      <option value="18:00 horas">18:00 hrs</option>
                    </select>
                  </div>
                </div>
              )}

              {data.bloques[id] && id === "mod_deposito" && (
                <div className="mt-2 pl-4 border-l-2 grid grid-cols-2 gap-2" style={{ borderColor: "var(--og-accent)" }}>
                  <Input label={t.fields.nuevo_deposito} value={data.campos.modificaciones.nuevo_deposito} onChange={v => upCampo("modificaciones", "nuevo_deposito", v)} type="number" />
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium" style={{ color: "var(--og-secondary)" }}>{t.fields.nueva_empresa_escrow}</label>
                    <select value={data.campos.modificaciones.nueva_empresa_escrow || ""} onChange={e => upCampo("modificaciones", "nueva_empresa_escrow", e.target.value)}
                      className="rounded-lg px-3 py-2 text-sm">
                      {ESCROW_COMPANIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  {data.campos.modificaciones.nueva_empresa_escrow === "otro_escrow" && (
                    <Input label={t.fields.empresa_escrow_manual} value={data.campos.modificaciones.nueva_empresa_escrow_manual} onChange={v => upCampo("modificaciones", "nueva_empresa_escrow_manual", v)} wide />
                  )}
                </div>
              )}

              {data.bloques[id] && id === "mod_clausula_libre" && (
                <div className="mt-2 pl-4 border-l-2 flex flex-col gap-2" style={{ borderColor: "var(--og-accent)" }}>
                  <Input label={t.fields.clausula_es} value={data.campos.modificaciones.clausula_libre_es} onChange={v => upCampo("modificaciones", "clausula_libre_es", v)} rows={3} wide />
                  <Input label={t.fields.clausula_en} value={data.campos.modificaciones.clausula_libre_en} onChange={v => upCampo("modificaciones", "clausula_libre_en", v)} rows={3} wide />
                  <Input label={t.fields.clausula_fr} value={data.campos.modificaciones.clausula_libre_fr} onChange={v => upCampo("modificaciones", "clausula_libre_fr", v)} rows={3} wide />
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section title={t.sections.aceptacion}>
        <Input label={t.fields.fecha_contraoferta} value={data.campos.aceptacion.fecha_contraoferta} onChange={v => upCampo("aceptacion", "fecha_contraoferta", v)} type="date" required />
        <Input label={t.fields.vigencia_horas} value={data.campos.aceptacion.vigencia_horas} onChange={v => upCampo("aceptacion", "vigencia_horas", v)} type="number" />
        <Input label={t.fields.ciudad_contraoferta} value={data.campos.aceptacion.ciudad_contraoferta} onChange={v => upCampo("aceptacion", "ciudad_contraoferta", v)} />
      </Section>
    </>
  );

  // ── STEP 3: Preview ───────────────────────────────────────────
  const renderStep3 = () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-sm font-medium" style={{ color: "var(--og-secondary)" }}>{t.preview.idioma}:</span>
        {["en", "fr"].map(lang => (
          <button key={lang} onClick={() => setContractLang(lang)}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${contractLang === lang ? "og-step-active" : "og-genero-off"}`}>
            {lang === "en" ? "🇺🇸 EN" : "🇫🇷 FR"}
          </button>
        ))}
      </div>

      <div className="og-card overflow-hidden">
        <div className="grid grid-cols-2 gap-0 text-sm">
          <div className="p-2 font-bold text-center" style={{ background: "var(--og-surface)", borderBottom: "1px solid var(--og-border)" }}>Español</div>
          <div className="p-2 font-bold text-center" style={{ background: "var(--og-surface)", borderBottom: "1px solid var(--og-border)" }}>
            {contractLang === "en" ? "English" : "Français"}
          </div>
          {bloques.map((b, i) => (
            <div key={i} className="contents">
              <div className="p-3 text-sm leading-relaxed" style={{ borderBottom: "1px solid var(--og-border)", whiteSpace: "pre-wrap" }}>
                {b.es}
              </div>
              <div className="p-3 text-sm leading-relaxed" style={{ borderBottom: "1px solid var(--og-border)", whiteSpace: "pre-wrap" }}>
                {contractLang === "en" ? b.en : b.fr}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── RENDER ────────────────────────────────────────────────────
  return (
    <main className="min-h-screen p-4 md:p-8" style={{ background: "var(--og-bg)" }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <a href="/" className="text-xs hover:underline" style={{ color: "var(--og-accent-hi)" }}>{t.header.volver}</a>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--og-primary)" }}>{t.title}</h1>
            <p className="text-sm" style={{ color: "var(--og-secondary)" }}>{t.subtitle}</p>
          </div>
          <div className="flex gap-2">
            {["es", "en", "fr"].map(lang => (
              <button key={lang} onClick={() => setIdiomaUI(lang)}
                className={`px-2 py-1 text-xs font-medium rounded transition-all ${idiomaUI === lang ? "og-step-active" : "og-genero-off"}`}>
                {lang.toUpperCase()}
              </button>
            ))}
            <button onClick={resetAll} className="px-3 py-1.5 text-xs rounded-lg" style={{ background: "var(--og-surface)", border: "1px solid var(--og-border)", color: "var(--og-secondary)" }}>
              {t.header.limpiar}
            </button>
          </div>
        </header>

        {/* Steps indicator */}
        <nav className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${step === i ? "og-step-active" : i < step ? "og-step-done" : "og-step-idle"}`}>
              {i + 1}. {s}
            </button>
          ))}
        </nav>

        {/* Main card */}
        <div className="og-card mb-6">
          {step === 0 && renderStep1()}
          {step === 1 && renderStep2()}
          {step === 2 && renderStep3()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-30"
            style={{ background: "var(--og-surface)", border: "1px solid var(--og-border)", color: "var(--og-primary)" }}>
            {t.nav.anterior}
          </button>

          {step < steps.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)}
              className="px-6 py-2 text-sm font-medium rounded-lg transition-all"
              style={{ background: "var(--og-accent)", color: "#fff" }}>
              {t.nav.siguiente}
            </button>
          ) : (
            <button onClick={handleGenerate} disabled={generating || !bloques.length}
              className="px-6 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-50"
              style={{ background: "var(--og-success)", color: "#fff" }}>
              {generating ? "..." : t.nav.generar}
            </button>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs" style={{ color: "var(--og-muted)" }}>
          {t.footer}
        </footer>
      </div>
    </main>
  );
}
