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
    contraoferta_original: { fecha_contraoferta: "" }, // Para contra-contraoferta
    modificaciones: {},
    aceptacion: { fecha_contraoferta: "", ciudad_contraoferta: "Bucerías, Nayarit", vigencia_horas: 48 },
  },
  quien_presenta: "vendedor",
  tipo_documento: "contraoferta", // "contraoferta" o "contra_contraoferta"
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
      contraoferta_original: "Referencia a la contraoferta original",
      tipo_documento: "Tipo de documento",
      partes: "Partes",
      modificaciones: "¿Qué deseas modificar?",
      aceptacion: "Vigencia de la contraoferta",
      quien_presenta: "¿Quién presenta?",
    },
    tipo_doc: {
      contraoferta: "Contraoferta",
      contraoferta_desc: "Respuesta del vendedor a una oferta",
      contra_contraoferta: "Contra-contraoferta",
      contra_contraoferta_desc: "Respuesta del comprador a una contraoferta",
    },
    fields: {
      fecha_oferta: "Fecha de la oferta original",
      fecha_contraoferta_orig: "Fecha de la contraoferta original",
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
    header: { volver: "← Volver a OfertaGen", limpiar: "Limpiar", cargar: "Cargar", guardar: "Guardar" },
    footer: "Hecho por Colmena 2026",
  },
  en: {
    title: "ContraOfertaGen",
    subtitle: "Generate trilingual counter-offer ES/EN/FR",
    steps: ["Original Offer", "Modifications", "Preview"],
    sections: {
      oferta_original: "Reference to original offer",
      contraoferta_original: "Reference to original counter-offer",
      tipo_documento: "Document type",
      partes: "Parties",
      modificaciones: "What do you want to modify?",
      aceptacion: "Counter-offer validity",
      quien_presenta: "Who is presenting?",
    },
    tipo_doc: {
      contraoferta: "Counter-offer",
      contraoferta_desc: "Seller's response to an offer",
      contra_contraoferta: "Counter-counter-offer",
      contra_contraoferta_desc: "Buyer's response to a counter-offer",
    },
    fields: {
      fecha_oferta: "Original offer date",
      fecha_contraoferta_orig: "Original counter-offer date",
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
    header: { volver: "← Back to OfertaGen", limpiar: "Clear", cargar: "Load", guardar: "Save" },
    footer: "Made by Colmena 2026",
  },
  fr: {
    title: "ContraOfertaGen",
    subtitle: "Génère une contre-offre trilingue ES/EN/FR",
    steps: ["Offre Originale", "Modifications", "Aperçu"],
    sections: {
      oferta_original: "Référence à l'offre originale",
      contraoferta_original: "Référence à la contre-offre originale",
      tipo_documento: "Type de document",
      partes: "Parties",
      modificaciones: "Que souhaitez-vous modifier?",
      aceptacion: "Validité de la contre-offre",
      quien_presenta: "Qui présente?",
    },
    tipo_doc: {
      contraoferta: "Contre-offre",
      contraoferta_desc: "Réponse du vendeur à une offre",
      contra_contraoferta: "Contre-contre-offre",
      contra_contraoferta_desc: "Réponse de l'acheteur à une contre-offre",
    },
    fields: {
      fecha_oferta: "Date de l'offre originale",
      fecha_contraoferta_orig: "Date de la contre-offre originale",
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
    header: { volver: "← Retour à OfertaGen", limpiar: "Effacer", cargar: "Charger", guardar: "Sauver" },
    footer: "Fait par Colmena 2026",
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
    <div onClick={() => onChange(!checked)} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${checked ? "cog-toggle-on" : ""}`}
      style={{ background: checked ? undefined : "var(--og-surface)", border: checked ? undefined : "1px solid var(--og-border)" }}>
      <div className="w-10 h-5 rounded-full relative transition-colors" style={{ background: checked ? "var(--cog-accent)" : "var(--og-muted)" }}>
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
      <h3 className="text-base font-semibold mb-4 pb-2 tracking-wide cog-section-title">{title}</h3>
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
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoBase64, setLogoBase64] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const t = UI[idiomaUI] || UI.es;
  const steps = t.steps;

  // Cargar estado de disclaimer desde localStorage
  useEffect(() => {
    try {
      const accepted = localStorage.getItem("ofertagen_disclaimer_accepted");
      if (accepted) setDisclaimerAccepted(true);
    } catch {}
  }, []);

  // Logo upload handler
  const handleLogoUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/jpg";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result;
        if (typeof dataUrl === "string") {
          setLogoPreview(dataUrl);
          const base64 = dataUrl.split(",")[1];
          setLogoBase64(base64);
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }, []);
  const clearLogo = () => { setLogoPreview(null); setLogoBase64(null); };

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

  // Import/Export draft
  const exportDraft = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contraoferta_draft_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const importDraft = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        setData(parsed);
      } catch { alert("Error al cargar archivo"); }
    };
    input.click();
  };

  // Demo data (easter egg)
  const loadDemo = () => {
    setData({
      ...INIT,
      partes: {
        ofertante: { personas: [{ nombre: "DENNIS DREISBACH DOTY", genero: "M" }] },
        propietario: { personas: [{ nombre: "KIMBERLY MARIE PARKER", genero: "F" }] },
      },
      campos: {
        ...INIT.campos,
        oferta_original: { fecha_oferta: "2026-03-15", precio_original: 280000, descripcion_inmueble: "Unidad 5204, Condominio La Joya de Mismaloya" },
        quien_presenta: "vendedor",
        modificaciones: { nuevo_precio: 295000, nueva_fecha_formalizacion: "2026-06-15" },
        aceptacion: { horas_vigencia: 48 },
      },
      bloques: { ...INIT.bloques, mod_precio: true, mod_fecha: true },
    });
    setStep(2);
  };

  const ctx = useMemo(() => ensamblar(data), [data]);
  const bloques = useMemo(() => renderBlks(ctx), [ctx]);

  // Función interna para generar (después de aceptar disclaimer)
  const doGenerate = useCallback(async () => {
    setGenerating(true);
    try {
      const blob = await generarDocxBlobContraoferta(bloques, PLANTILLA.meta, { idiomaSecundario: contractLang });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const nombre = data.partes?.ofertante?.personas?.[0]?.nombre?.split(" ")[0] || "DOC";
      const fecha = new Date().toISOString().slice(0, 10);
      const prefijo = data.tipo_documento === "contra_contraoferta" ? "CONTRA_CONTRAOFERTA" : "CONTRAOFERTA";
      a.href = url;
      a.download = `${prefijo}_${nombre}_${fecha}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generando DOCX:", err);
      alert("Error al generar el documento. Intenta de nuevo.");
    } finally {
      setGenerating(false);
    }
  }, [bloques, contractLang, data.partes, data.tipo_documento]);

  // Generar y descargar DOCX (con verificación de disclaimer)
  const handleGenerate = useCallback(async () => {
    if (generating || !bloques.length) return;
    // Si no ha aceptado disclaimer, mostrar modal
    if (!disclaimerAccepted) {
      setShowDisclaimer(true);
      return;
    }
    await doGenerate();
  }, [bloques, generating, disclaimerAccepted, doGenerate]);

  // Manejar aceptación del disclaimer
  const handleAcceptDisclaimer = useCallback(async () => {
    setDisclaimerAccepted(true);
    setShowDisclaimer(false);
    try {
      localStorage.setItem("ofertagen_disclaimer_accepted", new Date().toISOString());
    } catch {}
    await doGenerate();
  }, [doGenerate]);

  // ── STEP 1: Oferta Original ───────────────────────────────────
  const renderStep1 = () => (
    <>
      {/* Tipo de documento */}
      <Section title={t.sections.tipo_documento}>
        <div className="col-span-2 flex gap-3">
          {["contraoferta", "contra_contraoferta"].map(tipo => (
            <button key={tipo} onClick={() => setData(d => ({ ...d, tipo_documento: tipo }))}
              className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${data.tipo_documento === tipo ? "cog-step-active" : "og-genero-off"}`}>
              <div>{t.tipo_doc[tipo]}</div>
              <div className="text-[10px] opacity-70 mt-0.5">{t.tipo_doc[`${tipo}_desc`]}</div>
            </button>
          ))}
        </div>
      </Section>

      <Section title={t.sections.oferta_original}>
        <Input label={t.fields.fecha_oferta} value={data.campos.oferta_original.fecha_oferta} onChange={v => upCampo("oferta_original", "fecha_oferta", v)} type="date" required />
        <Input label={t.fields.precio_original} value={data.campos.oferta_original.precio_original} onChange={v => upCampo("oferta_original", "precio_original", v)} type="number" required />
        <Input label={t.fields.descripcion_inmueble} value={data.campos.oferta_original.descripcion_inmueble} onChange={v => upCampo("oferta_original", "descripcion_inmueble", v)} placeholder="Depto. 5204, La Joya de Mismaloya" required wide />
      </Section>

      {/* Fecha de contraoferta original - solo si es contra-contraoferta */}
      {data.tipo_documento === "contra_contraoferta" && (
        <Section title={t.sections.contraoferta_original}>
          <Input label={t.fields.fecha_contraoferta_orig} value={data.campos.contraoferta_original?.fecha_contraoferta || ""} onChange={v => upCampo("contraoferta_original", "fecha_contraoferta", v)} type="date" required />
        </Section>
      )}

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
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${data.quien_presenta === q ? "cog-step-active" : "og-genero-off"}`}>
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
                <div className="mt-2 pl-4 border-l-2" style={{ borderColor: "var(--cog-accent)" }}>
                  <Input label={t.fields.nuevo_precio} value={data.campos.modificaciones.nuevo_precio} onChange={v => upCampo("modificaciones", "nuevo_precio", v)} type="number" />
                </div>
              )}

              {data.bloques[id] && id === "mod_fecha" && (
                <div className="mt-2 pl-4 border-l-2" style={{ borderColor: "var(--cog-accent)" }}>
                  <Input label={t.fields.nueva_fecha} value={data.campos.modificaciones.nueva_fecha_formalizacion} onChange={v => upCampo("modificaciones", "nueva_fecha_formalizacion", v)} type="date" />
                </div>
              )}

              {data.bloques[id] && id === "mod_notario" && (
                <div className="mt-2 pl-4 border-l-2 grid grid-cols-3 gap-2" style={{ borderColor: "var(--cog-accent)" }}>
                  <Input label={t.fields.nuevo_notario} value={data.campos.modificaciones.nuevo_notario_nombre} onChange={v => upCampo("modificaciones", "nuevo_notario_nombre", v)} />
                  <Input label={t.fields.numero_notaria} value={data.campos.modificaciones.nuevo_notario_numero} onChange={v => upCampo("modificaciones", "nuevo_notario_numero", v)} />
                  <Input label={t.fields.ciudad_notaria} value={data.campos.modificaciones.nuevo_notario_ciudad} onChange={v => upCampo("modificaciones", "nuevo_notario_ciudad", v)} />
                </div>
              )}

              {data.bloques[id] && id === "mod_coordinador" && (
                <div className="mt-2 pl-4 border-l-2 grid grid-cols-2 gap-2" style={{ borderColor: "var(--cog-accent)" }}>
                  <Input label={t.fields.nuevo_coordinador} value={data.campos.modificaciones.nuevo_coordinador_nombre} onChange={v => upCampo("modificaciones", "nuevo_coordinador_nombre", v)} />
                  <Input label={t.fields.empresa_coordinador} value={data.campos.modificaciones.nuevo_coordinador_empresa} onChange={v => upCampo("modificaciones", "nuevo_coordinador_empresa", v)} />
                </div>
              )}

              {data.bloques[id] && id === "mod_vigencia" && (
                <div className="mt-2 pl-4 border-l-2 grid grid-cols-2 gap-2" style={{ borderColor: "var(--cog-accent)" }}>
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
                <div className="mt-2 pl-4 border-l-2 grid grid-cols-2 gap-2" style={{ borderColor: "var(--cog-accent)" }}>
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
                <div className="mt-2 pl-4 border-l-2 flex flex-col gap-2" style={{ borderColor: "var(--cog-accent)" }}>
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
  const renderStep3 = () => {
    // Función para limpiar undefined en texto
    const limpiarTexto = (texto, lang = 'es') => {
      if (!texto) return '';
      const placeholder = lang === 'es' ? '[SIN DEFINIR]' : '[UNDEFINED]';
      return texto
        .replace(/undefined/g, placeholder)
        .replace(/\[FECHA\]/g, placeholder)
        .replace(/\[DATE\]/g, placeholder)
        .replace(/\[INMUEBLE\]/g, placeholder);
    };

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm font-medium" style={{ color: "var(--og-secondary)" }}>{t.preview.idioma}:</span>
          {["en", "fr"].map(lang => (
            <button key={lang} onClick={() => setContractLang(lang)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${contractLang === lang ? "cog-step-active" : "og-genero-off"}`}>
              {lang === "en" ? "🇺🇸 EN" : "🇫🇷 FR"}
            </button>
          ))}
        </div>

        {bloques.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--og-secondary)" }}>
            {idiomaUI === 'es' ? 'Completa los datos para ver la vista previa.' : 
             idiomaUI === 'fr' ? 'Remplissez les données pour voir l\'aperçu.' :
             'Complete the data to see the preview.'}
          </p>
        ) : (
          <div className="rounded-xl overflow-hidden text-xs leading-relaxed" style={{ border: "1px solid var(--og-border)" }}>
            {/* Header */}
            <div className="grid grid-cols-2" style={{ background: "var(--og-surface)", borderBottom: "1px solid var(--og-border)" }}>
              <div className="px-3 py-2 font-semibold text-[10px] tracking-wider border-r" style={{ color: "var(--og-secondary)", borderColor: "var(--og-border)" }}>ESPAÑOL</div>
              <div className="px-3 py-2 font-semibold text-[10px] tracking-wider" style={{ color: "var(--og-secondary)" }}>{contractLang === 'fr' ? 'FRANÇAIS' : 'ENGLISH'}</div>
            </div>

            {/* Bloques */}
            {bloques.map((b, i) => {
              // Firmas
              if (b.tipo === "firmas" && b.firmas) {
                return (
                  <div key={i} className="flex justify-around py-10" style={{ borderTop: "1px solid var(--og-border)" }}>
                    {b.firmas.map((f, j) => (
                      <div key={j} className="text-center">
                        <div className="w-48 border-b mb-2" style={{ borderColor: "var(--og-primary)" }} />
                        <div className="font-bold text-[11px]" style={{ color: "var(--og-primary)" }}>{f.nombre || '[NOMBRE]'}</div>
                        <div className="text-[10px]" style={{ color: "var(--og-secondary)" }}>{f.etiqueta_es || ''}</div>
                      </div>
                    ))}
                  </div>
                );
              }

              // Bloques normales
              const textoEs = limpiarTexto(b.es, 'es');
              const textoLang2 = limpiarTexto(contractLang === 'fr' ? b.fr : b.en, contractLang);

              return (
                <div key={i} className="grid grid-cols-2" style={{ borderTop: i ? "1px solid var(--og-border)" : "none" }}>
                  <div className="px-3 py-2.5 border-r" style={{ borderColor: "var(--og-border)" }}>
                    {textoEs.split("\n\n").map((p, j) => (
                      <p key={j} className="mb-1.5" style={{ color: "var(--og-primary)" }}>
                        {p.split("\n").map((l, k) => <span key={k}>{k > 0 && <br />}{l}</span>)}
                      </p>
                    ))}
                  </div>
                  <div className="px-3 py-2.5">
                    {textoLang2.split("\n\n").map((p, j) => (
                      <p key={j} className="mb-1.5" style={{ color: "var(--og-secondary)" }}>
                        {p.split("\n").map((l, k) => <span key={k}>{k > 0 && <br />}{l}</span>)}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ── RENDER ────────────────────────────────────────────────────
  return (
    <main className="min-h-screen p-4 md:p-8" style={{ background: "var(--og-bg)" }}>
      <div className="max-w-3xl mx-auto">

        {/* Modal de Disclaimer */}
        {showDisclaimer && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{background:"rgba(0,0,0,0.8)"}}>
            <div className="rounded-2xl shadow-2xl max-w-lg w-full p-6" style={{background:"var(--og-card)",border:"1px solid var(--og-border)"}}>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{color:"var(--cog-accent)"}}>
                <span>⚠️</span> {idiomaUI === 'es' ? 'Antes de descargar' : idiomaUI === 'fr' ? 'Avant de télécharger' : 'Before downloading'}
              </h2>
              <div className="text-sm mb-5 space-y-3" style={{color:"var(--og-secondary)"}}>
                <p>
                  {idiomaUI === 'es' 
                    ? 'ContraOfertaGen genera documentos basados en plantillas inmobiliarias para zona restringida mexicana.'
                    : idiomaUI === 'fr'
                    ? 'ContraOfertaGen génère des documents basés sur des modèles immobiliers pour la zone restreinte mexicaine.'
                    : 'ContraOfertaGen generates documents based on real estate templates for Mexican restricted zone.'}
                </p>
                <ul className="space-y-2 pl-4">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500">•</span>
                    {idiomaUI === 'es' 
                      ? 'No sustituye asesoría legal personalizada'
                      : idiomaUI === 'fr'
                      ? 'Ne remplace pas un conseil juridique personnalisé'
                      : 'Does not substitute personalized legal advice'}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500">•</span>
                    {idiomaUI === 'es' 
                      ? 'Debe ser revisado por un abogado antes de firmar'
                      : idiomaUI === 'fr'
                      ? 'Doit être révisé par un avocat avant de signer'
                      : 'Must be reviewed by a lawyer before signing'}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500">•</span>
                    {idiomaUI === 'es' 
                      ? 'El desarrollador no asume responsabilidad por uso sin revisión profesional'
                      : idiomaUI === 'fr'
                      ? 'Le développeur n\'assume aucune responsabilité en cas d\'utilisation sans révision professionnelle'
                      : 'The developer assumes no responsibility for use without professional review'}
                  </li>
                </ul>
              </div>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setShowDisclaimer(false)}
                  className="px-4 py-2 text-sm rounded-lg transition"
                  style={{background:"var(--og-surface)",border:"1px solid var(--og-border)",color:"var(--og-secondary)"}}>
                  {idiomaUI === 'es' ? 'Cancelar' : idiomaUI === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button 
                  onClick={handleAcceptDisclaimer}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg transition"
                  style={{background:"var(--cog-accent)"}}>
                  {idiomaUI === 'es' ? 'Entiendo, descargar' : idiomaUI === 'fr' ? 'Je comprends, télécharger' : 'I understand, download'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <a href="/" className="text-xs hover:underline" style={{ color: "var(--cog-accent-hi)" }}>{t.header.volver}</a>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--og-primary)" }}>{t.title}</h1>
            <p className="text-sm" style={{ color: "var(--og-secondary)" }}>{t.subtitle}</p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {/* Logo upload */}
            {logoPreview ? (
              <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 border border-purple-200 rounded-lg">
                <img src={logoPreview} alt="Logo" className="h-6 max-w-16 object-contain" />
                <button onClick={clearLogo} className="text-purple-500 hover:text-purple-700 text-xs ml-1" title="Quitar logo">✕</button>
              </div>
            ) : (
              <button onClick={handleLogoUpload} className="px-3 py-1.5 text-xs rounded-lg transition flex items-center gap-1" style={{ background: "var(--og-surface)", border: "1px solid var(--og-border)", color: "var(--og-secondary)" }}>
                <span>🖼️</span> Logo
              </button>
            )}
            <button onClick={importDraft} className="px-3 py-1.5 text-xs rounded-lg transition flex items-center gap-1" style={{ background: "var(--og-surface)", border: "1px solid var(--og-border)", color: "var(--og-secondary)" }}>
              <span>📂</span> {t.header.cargar}
            </button>
            <button onClick={exportDraft} className="px-3 py-1.5 text-xs rounded-lg transition flex items-center gap-1" style={{ background: "var(--og-surface)", border: "1px solid var(--og-border)", color: "var(--og-secondary)" }}>
              <span>💾</span> {t.header.guardar}
            </button>
            <button onClick={resetAll} className="px-3 py-1.5 text-xs rounded-lg" style={{ background: "var(--og-surface)", border: "1px solid var(--og-border)", color: "var(--og-secondary)" }}>
              {t.header.limpiar}
            </button>
            {/* Toggle idioma UI */}
            <div className="flex rounded-lg border overflow-hidden text-xs font-medium" style={{ borderColor: "var(--og-border)" }}>
              {["es", "en", "fr"].map(lang => (
                <button key={lang} onClick={() => setIdiomaUI(lang)}
                  className={`px-2.5 py-1.5 transition ${idiomaUI === lang ? "cog-step-active" : ""}`}>
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Steps indicator */}
        <nav className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${step === i ? "cog-step-active" : i < step ? "og-step-done" : "og-step-idle"}`}>
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
              style={{ background: "var(--cog-accent)", color: "#fff" }}>
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
        <footer className="mt-8 text-center text-xs space-y-1" style={{ color: "var(--og-muted)" }}>
          <div>Hecho por Colmena <span onClick={loadDemo} className="cursor-pointer hover:text-green-400 transition">2026</span></div>
          <div style={{fontSize:"10px",opacity:0.7}}>
            {idiomaUI === 'es' 
              ? 'Herramienta de apoyo · Revisar con abogado antes de firmar'
              : idiomaUI === 'fr'
              ? 'Outil d\'aide · À réviser par un avocat avant signature'
              : 'Support tool · Review with lawyer before signing'}
            {' · '}
            <a href="#" onClick={(e) => { e.preventDefault(); setShowDisclaimer(true); }} className="underline hover:text-green-400">
              {idiomaUI === 'es' ? 'Términos' : idiomaUI === 'fr' ? 'Conditions' : 'Terms'}
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
