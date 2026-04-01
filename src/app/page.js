"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { ensamblarContexto, renderizarBloques } from "@/lib/plantillas/ensamblador";
import PLANTILLA from "@/lib/plantillas/oferta_compra";
import { generarDocxBlob } from "@/lib/docx/generador";

// ============================================================
// DEMO DATA (Dennis Doty → Karin Palutke)
// ============================================================
const DEMO = {partes:{ofertante:{personas:[{nombre:"DENNIS DREISBACH DOTY",genero:"M"}],tipoPersona:"fisica",domicilio:"Calle Paseo del Arque 59, Fraccionamiento Las Ceibas, Ejido Jarretadera, Bahia de Banderas, Nayarit",nacionalidad:"estadounidense",celular:"322 306 8482",email:"claudia@castlesolutions.biz"},propietario:{personas:[{nombre:"KARIN MARGARETE PALUTKE",genero:"F"}],tipoPersona:"fisica",nacionalidad:"canadiense",celular:"322 101 7810",email:"maru@lionsrealestate.properties"}},bloques:{adjudicacion_conyuge:true,ad_corpus:true,escrow:true,inspeccion:true,doc_fideicomiso:true,comision:true,condicion_uso:true,fuerza_mayor:true,factura_complementaria:false,disclosure:false,financiamiento:false,inventario:false,arrendamientos:false,zona_federal:false,litigios_pendientes:false,empleados_condicion:false,obligaciones_vendedor:true,obligaciones_vendedor_agua:false,derecho_deduccion:true,auditoria_hacienda:false,holdback_escrow:false,documentos_integrales:true,proteccion_datos:false,confidencialidad:false,duplicados:true},campos:{inmueble:{descripcion_corta:"Departamento número 43 del Condominio Orquídeas",ubicacion_completa:"en el lote 4-12, dentro del condominio Coto Los Sauces, Condominio Maestro Flamingos Club Residencial, Km 144 carretera Tepic-Puerto Vallarta, Bahía de Banderas, Nayarit",nivel_torre:"tercer nivel de la Torre A",descripcion_interior:"sala, comedor, cocina, cuarto de lavado, terraza, 1 recámara, 1 recámara con balcón, 1 baño, recámara principal con baño",superficie_m2:129.85,superficie_letras:"ciento veintinueve metros ochenta y cinco centímetros",indiviso:"1.6790%"},antecedente:{fecha_escritura:"2018-07-20",numero_escritura:"34,362",notario_anterior:"Lic. Teodoro Ramírez Valenzuela",numero_notaria_anterior:"2",ciudad_notaria_anterior:"Bucerias, Nayarit",libro_rpp:"1406",seccion_rpp:"I",serie_rpp:"A",partida_rpp:"29",cuenta_predial:"U058152"},precio:{precio_total:220000,moneda:"USD",deposito_escrow:22000,dias_deposito:3},escrow:{empresa_escrow:"STEWART TITLE LATIN AMERICA"},fechas:{fecha_presentacion:"2023-03-20",ciudad_presentacion:"Bucerias, Nayarit",fecha_vigencia:"2023-03-22",fecha_formalizacion:"cualquier día hábil dentro de las primeras dos semanas del mes de Mayo de 2023",fecha_formalizacion_en:"any business day within the first two weeks of May 2023",fecha_extension:"las primeras dos semanas del mes de Junio 2023",fecha_extension_en:"the first two weeks of June 2023"},notario:{notario_seleccion:"ramirez_2"},comision:{porcentaje_total:"6%",incluye_iva:true,agencia1_nombre:"Lion's Real Estate Properties",agencia1_porcentaje:"3%",agencia2_nombre:"Pvcastlemx, SAS, de CV",agencia2_porcentaje:"3%"},penalidad:{porcentaje_penalidad:"10%"},jurisdiccion:{ciudad_jurisdiccion:"Bucerias, Nayarit, México"},inspeccion:{dias_inspeccion:4,dias_revision:5}}};

const INIT = {partes:{ofertante:{personas:[{nombre:"",genero:"M"}],tipoPersona:"fisica",domicilio:"",nacionalidad:"",celular:"",email:""},propietario:{personas:[{nombre:"",genero:"F"}],tipoPersona:"fisica",domicilio:"",nacionalidad:"",celular:"",email:""}},bloques:{adjudicacion_conyuge:false,ad_corpus:true,escrow:true,inspeccion:true,doc_fideicomiso:true,comision:true,condicion_uso:true,fuerza_mayor:true,factura_complementaria:false,disclosure:false,financiamiento:false,inventario:false,arrendamientos:false,zona_federal:false,litigios_pendientes:false,empleados_condicion:false,obligaciones_vendedor:true,obligaciones_vendedor_agua:false,derecho_deduccion:true,auditoria_hacienda:false,holdback_escrow:false,documentos_integrales:true,proteccion_datos:false,confidencialidad:false,duplicados:true},campos:{inmueble:{},antecedente:{},precio:{moneda:"USD",precio_total:0,deposito_escrow:0},escrow:{empresa_escrow:"STEWART TITLE LATIN AMERICA"},fechas:{ciudad_presentacion:"Bucerias, Nayarit"},notario:{},comision:{porcentaje_total:"6%",incluye_iva:true},penalidad:{porcentaje_penalidad:"10%"},jurisdiccion:{ciudad_jurisdiccion:"Bucerias, Nayarit, México"},inspeccion:{dias_inspeccion:4,dias_revision:5}}};

// ============================================================
// HELPERS
// ============================================================
function ensamblar(data) { 
  try { return ensamblarContexto(PLANTILLA, data); } 
  catch(e) { console.error('ensamblar:', e.message); return null; } 
}
function renderBlks(ctx) { 
  if (!ctx) return [];
  try { return renderizarBloques(PLANTILLA, ctx); } 
  catch(e) { console.error('renderBlks:', e.message); return []; } 
}

// ============================================================
// COMPONENTS
// ============================================================
function Input({ label, value, onChange, type = "text", placeholder = "", required, wide, rows }) {
  return (
    <div className={`flex flex-col gap-1 ${wide ? "col-span-2" : ""}`}>
      <label className="text-xs font-medium text-gray-500">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {rows ? (
        <textarea value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none resize-y" />
      ) : (
        <input type={type} value={value || ""} onChange={e => onChange(type === "number" ? +e.target.value : e.target.value)} placeholder={placeholder}
          step={type === "number" ? "any" : undefined}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none" />
      )}
    </div>
  );
}

function Toggle({ label, sub, checked, onChange }) {
  return (
    <div onClick={() => onChange(!checked)} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all" style={{background: checked ? "rgba(29,107,184,0.15)" : "var(--og-surface)", border: checked ? "1px solid var(--og-border-hi)" : "1px solid var(--og-border)"}}>
      <div className="w-10 h-5 rounded-full relative transition-colors" style={{background: checked ? "var(--og-accent)" : "var(--og-muted)"}}>
        <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${checked ? "left-5" : "left-0.5"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium" style={{color:"var(--og-primary)"}}>{label}</div>
        {sub && <div className="text-xs text-gray-500 truncate">{sub}</div>}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold mb-3 pb-2" style={{color:"var(--og-primary)",borderBottom:"1px solid var(--og-border)"}}>{title}</h3>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function PartePanel({ data, pid, label, upParte, upPersona, addPersona, rmPersona, t }) {
  const p = data.partes[pid];
  return (
    <Section title={label}>
      {p.personas.map((per, i) => (
        <div key={i} className="col-span-2 flex flex-col gap-2 p-3 rounded-lg" style={{background:"var(--og-surface)",border:"1px solid var(--og-border)"}}>
          <div className="flex items-center gap-2">
            {p.personas.length > 1 && <span className="text-xs font-medium text-gray-400">#{i+1}</span>}
            {p.personas.length > 1 && <button onClick={() => rmPersona(pid, i)} className="ml-auto text-xs text-red-500 hover:text-red-700">✕</button>}
          </div>
          <input value={per.nombre} onChange={e => upPersona(pid, i, "nombre", e.target.value.toUpperCase())} placeholder={t?.fields?.nombre_completo || "NOMBRE COMPLETO"}
            className="rounded-lg px-3 py-2 text-sm outline-none font-medium w-full" />
          <div className="flex gap-2">
            {[["M", t?.fields?.genero_m || "M"], ["F", t?.fields?.genero_f || "F"]].map(([g, label]) => (
              <button key={g} onClick={() => upPersona(pid, i, "genero", g)} title={label}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${per.genero === g ? "og-step-active" : "og-genero-off"}`}>{g}</button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={() => addPersona(pid)} className="col-span-2 text-xs py-1" style={{color:"var(--og-accent-hi)"}}>{t?.fields?.agregar_persona || "+ Agregar persona"}</button>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium" style={{color:"var(--og-secondary)"}}>{t.fields.nacionalidad}</label>
        <select value={p.nacionalidad||""} onChange={e => upParte(pid, "nacionalidad", e.target.value)}
          className="rounded-lg px-3 py-2 text-sm" style={{background:"var(--og-surface)",border:"1px solid var(--og-border)",color:"var(--og-primary)"}}>
          <option value="">—</option>
          {(t.fields.nacionalidades||[]).map(n => (
            <option key={n.v} value={n.v}>{n.l}</option>
          ))}
        </select>
      </div>
      <Input label={t.fields.celular} value={p.celular} onChange={v => upParte(pid, "celular", v)} type="tel" required />
      <Input label={t.fields.email} value={p.email} onChange={v => upParte(pid, "email", v)} type="email" required wide />
      <div className="col-span-2 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input type="checkbox"
            checked={p.domicilio === (t.fields.domicilio_inmueble || "Inmueble materia de la presente oferta")}
            onChange={e => upParte(pid, "domicilio", e.target.checked ? (t.fields.domicilio_inmueble || "Inmueble materia de la presente oferta") : "")}
            className="rounded" style={{width:"14px",height:"14px",accentColor:"var(--og-accent-hi)",flexShrink:0}} />
          <label className="text-xs" style={{color:"var(--og-secondary)",opacity:1}}>
            {t.fields.domicilio_inmueble || "Inmueble materia de la presente oferta"}
          </label>
        </div>
        <Input label={t.fields.domicilio} value={p.domicilio} onChange={v => upParte(pid, "domicilio", v)} wide rows={2} />
      </div>
    </Section>
  );
}


// ============================================================
// i18n UI — Sprint V-a
// ============================================================
const UI = {
  es: {
    steps: ["Partes", "Inmueble", "Operación", "Cláusulas", "Preview"],
    sections: {
      idioma: "Idioma del comprador",
      idioma_sub: "¿En qué idioma prefiere su copia el comprador?",
      inmueble: "Datos del inmueble",
      antecedente: "Antecedente registral",
      precio: "Precio y pagos",
      escrow: "Escrow",
      fechas: "Fechas y plazos",
      notario: "Notario designado",
      comision: "Comisión inmobiliaria",
      penalidad: "Penalidad / Jurisdicción",
      testigos: "Testigos y aceptación",
      coordinador: "Coordinador de cierre / Closing coordinator",
      clausulas: "Cláusulas opcionales",
      clausulas_adicionales: "Cláusulas adicionales",
    },
    header: {
      cargar: "Cargar", guardar: "Guardar", limpiar: "Limpiar",
    },
    preview: {
      title: "Vista previa bilingüe",
      descargar: "Descargar .docx",
      generando: "Generando...",
    },
    fields: {
      // Partes
      nombre_completo: "NOMBRE COMPLETO", nacionalidad: "Nacionalidad",
      celular: "Celular/WhatsApp", email: "Email", domicilio: "Domicilio",
      agregar_persona: "+ Agregar persona",
      genero_m: "Masculino", genero_f: "Femenino", placeholder_nacionalidad: "canadiense, estadounidense...",
      domicilio_inmueble: "Inmueble materia de la presente oferta", label_ofertante: "Ofertante", label_propietario: "Propietario", nacionalidades: [{v:"estadounidense", l:"🇺🇸 Estadounidense"}, {v:"canadiense", l:"🇨🇦 Canadiense"}, {v:"francocanadiense", l:"🇨🇦 Franco-canadiense"}],
      // Inmueble
      descripcion_corta: "Descripción corta", ubicacion_completa: "Ubicación completa",
      nivel_torre: "Nivel/Torre", interior: "Interior",
      superficie_m2: "Superficie m²", superficie_letras: "Superficie en letras",
      indiviso: "Indiviso %", clave_catastral: "Clave catastral",
      notas_uso_exclusivo_es: "Notas uso exclusivo (ES)", notas_uso_exclusivo_en: "Notas uso exclusivo (EN)",
      uso_exclusivo_label: "Incluir notas de uso exclusivo",
      uso_exclusivo_sub: "Estacionamiento, bodega, servidumbre, terraza privada...",
      // Antecedente
      fecha_escritura: "Fecha escritura", no_escritura: "No. escritura",
      notario_ant: "Notario", no_notaria: "No. notaría", ciudad: "Ciudad",
      folio_real_electronico: "Folio Real Electrónico", folio_real: "Folio Real",
      libro: "Libro", seccion: "Sección", serie: "Serie", partida: "Partida",
      documento: "Documento", folios: "Folios", cuenta_predial: "Cuenta predial",
      estado_rpp: "Estado del RPP", tipo_inscripcion: "Tipo de inscripción",
      // Precio
      precio_total: "Precio total", deposito_escrow: "Depósito escrow",
      dias_depositar: "Días hábiles para depositar",
      dias_saldo: "Días hábiles saldo (antes del cierre)",
      anticipo_gastos: "Anticipo gastos de escrituración",
      honorarios_escrow: "Honorarios escrow (USD)",
      // Fechas
      fecha_presentacion: "Fecha presentación", ciudad_presentacion: "Ciudad",
      fecha_vigencia: "Fecha de vencimiento", hora_vigencia: "Hora de vencimiento",
      formalizacion_es: "Formalización (ES)", formalizacion_en: "Formalización (EN)",
      extension_es: "Extensión (ES)", extension_en: "Extensión (EN)",
      // Notario
      nombre_notario: "Nombre del notario", no_notaria_dest: "No. notaría",
      ciudad_notaria: "Ciudad",
      // Comisión
      pct_total: "% total", agencia1: "Agencia 1", pct_ag1: "% Ag. 1",
      agencia2: "Agencia 2", pct_ag2: "% Ag. 2",
      // Penalidad
      pct_penalidad: "% penalidad", jurisdiccion: "Jurisdicción",
      pct_parte_afectada: "% parte afectada", pct_agencia: "% agencia",
      // Coordinador
      nombre_coord: "Nombre", empresa_coord: "Empresa",
      // Financiamiento
      nombre_lender: "Nombre del prestamista / lender",
      dias_due_diligence: "Días due diligence del lender",
      // Inventario
      exclusiones_es: "Exclusiones (ES)", exclusiones_en: "Exclusiones (EN)",
    },
    nav: { siguiente: "Siguiente", anterior: "Anterior", generar: "Descargar .docx" },
    validation: {
      errores: "Errores críticos", advertencias: "Advertencias",
      corregir: "Corregir", generar_igual: "Generar de todas formas",
    },
  },
  es: {
    steps: ["Partes", "Inmueble", "Operación", "Cláusulas", "Preview"],
    sections: {
      idioma: "Idioma del comprador",
      idioma_sub: "¿En qué idioma prefiere su copia el comprador?",
      inmueble: "Datos del inmueble",
      antecedente: "Antecedente registral",
      precio: "Precio y pagos",
      escrow: "Escrow",
      fechas: "Fechas y plazos",
      notario: "Notario designado",
      comision: "Comisión inmobiliaria",
      penalidad: "Penalidad / Jurisdicción",
      testigos: "Testigos y aceptación",
      coordinador: "Coordinador de cierre",
      clausulas: "Cláusulas opcionales",
      clausulas_adicionales: "Cláusulas adicionales",
    },
    header: { cargar: "Cargar", guardar: "Guardar", limpiar: "Limpiar" },
    preview: { title: "Vista previa bilingüe", descargar: "Descargar .docx", generando: "Generando..." },
    nav: { siguiente: "Siguiente", anterior: "Anterior", generar: "Descargar .docx" },
    validation: { errores: "Errores críticos", advertencias: "Advertencias", corregir: "Corregir", generar_igual: "Generar de todas formas" },
    fields: {
      nombre_completo: "NOMBRE COMPLETO", nacionalidad: "Nacionalidad",
      celular: "Celular/WhatsApp", email: "Email", domicilio: "Domicilio",
      agregar_persona: "+ Agregar persona",
      genero_m: "Masculino", genero_f: "Femenino", placeholder_nacionalidad: "canadiense, estadounidense...",
      domicilio_inmueble: "Inmueble materia de la presente oferta", label_ofertante: "Ofertante", label_propietario: "Propietario",
      nacionalidades: [{v:"estadounidense", l:"🇺🇸 Estadounidense"},{v:"canadiense", l:"🇨🇦 Canadiense"},{v:"francocanadiense", l:"🇨🇦 Franco-canadiense"}],
      descripcion_corta: "Descripción corta", ubicacion_completa: "Ubicación completa",
      nivel_torre: "Nivel/Torre", interior: "Interior",
      superficie_m2: "Superficie m²", superficie_letras: "Superficie en letras",
      indiviso: "Indiviso %", clave_catastral: "Clave catastral",
      notas_uso_exclusivo_es: "Notas uso exclusivo (ES)", notas_uso_exclusivo_en: "Notas uso exclusivo (EN)",
      uso_exclusivo_label: "Incluir notas de uso exclusivo",
      uso_exclusivo_sub: "Estacionamiento, bodega, servidumbre, terraza privada...",
      fecha_escritura: "Fecha escritura", no_escritura: "No. escritura",
      notario_ant: "Notario", no_notaria: "No. notaría", ciudad: "Ciudad",
      folio_real_electronico: "Folio Real Electrónico", folio_real: "Folio Real",
      libro: "Libro", seccion: "Sección", serie: "Serie", partida: "Partida",
      documento: "Documento", folios: "Folios", cuenta_predial: "Cuenta predial",
      estado_rpp: "Estado del RPP", tipo_inscripcion: "Tipo de inscripción",
      precio_total: "Precio total", deposito_escrow: "Depósito escrow",
      dias_depositar: "Días hábiles para depositar",
      dias_saldo: "Días hábiles saldo (antes del cierre)",
      anticipo_gastos: "Anticipo gastos de escrituración",
      honorarios_escrow: "Honorarios escrow (USD)",
      fecha_presentacion: "Fecha presentación", ciudad_presentacion: "Ciudad",
      fecha_vigencia: "Fecha de vencimiento", hora_vigencia: "Hora de vencimiento",
      formalizacion_es: "Formalización (ES)", formalizacion_en: "Formalización (EN)",
      extension_es: "Extensión (ES)", extension_en: "Extensión (EN)",
      nombre_notario: "Nombre del notario", no_notaria_dest: "No. notaría",
      ciudad_notaria: "Ciudad",
      pct_total: "% total", agencia1: "Agencia 1", pct_ag1: "% Ag. 1",
      agencia2: "Agencia 2", pct_ag2: "% Ag. 2",
      pct_penalidad: "% penalidad", jurisdiccion: "Jurisdicción",
      pct_parte_afectada: "% parte afectada", pct_agencia: "% agencia",
      nombre_coord: "Nombre", empresa_coord: "Empresa",
      nombre_lender: "Nombre del prestamista / lender",
      dias_due_diligence: "Días due diligence del lender",
      exclusiones_es: "Exclusiones (ES)", exclusiones_en: "Exclusiones (EN)",
    },
  },
  en: {
    steps: ["Parties", "Property", "Deal", "Clauses", "Preview"],
    sections: {
      idioma: "Buyer's language",
      idioma_sub: "Buyer's preferred language for their copy",
      inmueble: "Property details",
      antecedente: "Title history",
      precio: "Price & payments",
      escrow: "Escrow",
      fechas: "Dates & deadlines",
      notario: "Designated notary",
      comision: "Real estate commission",
      penalidad: "Penalty / Jurisdiction",
      testigos: "Witnesses & acceptance",
      coordinador: "Closing coordinator",
      clausulas: "Optional clauses",
      clausulas_adicionales: "Additional clauses",
    },
    header: {
      cargar: "Load", guardar: "Save", limpiar: "Clear",
    },
    preview: {
      title: "Bilingual preview",
      descargar: "Download .docx",
      generando: "Generating...",
    },
    fields: {
      nombre_completo: "FULL NAME", nacionalidad: "Nationality",
      celular: "Cell/WhatsApp", email: "Email", domicilio: "Address",
      agregar_persona: "+ Add person",
      genero_m: "Male", genero_f: "Female", placeholder_nacionalidad: "Canadian, American, French...",
      domicilio_inmueble: "Property subject matter of this offer", label_ofertante: "Buyer", label_propietario: "Owner", nacionalidades: [{v:"estadounidense", l:"🇺🇸 American"}, {v:"canadiense", l:"🇨🇦 Canadian"}, {v:"francocanadiense", l:"🇨🇦 Franco-Canadian"}],
      descripcion_corta: "Short description", ubicacion_completa: "Full location",
      nivel_torre: "Level/Tower", interior: "Interior",
      superficie_m2: "Area m²", superficie_letras: "Area in words",
      indiviso: "Undivided %", clave_catastral: "Cadastral key",
      notas_uso_exclusivo_es: "Exclusive use notes (ES)", notas_uso_exclusivo_en: "Exclusive use notes (EN)",
      uso_exclusivo_label: "Include exclusive use notes",
      uso_exclusivo_sub: "Parking, storage, easement, private terrace...",
      fecha_escritura: "Deed date", no_escritura: "Deed no.",
      notario_ant: "Notary", no_notaria: "Notary no.", ciudad: "City",
      folio_real_electronico: "Electronic Land Registry Folio", folio_real: "Land Registry Folio",
      libro: "Book", seccion: "Section", serie: "Series", partida: "Entry",
      documento: "Document", folios: "Folios", cuenta_predial: "Property tax account",
      estado_rpp: "Registry state", tipo_inscripcion: "Registration type",
      precio_total: "Total price", deposito_escrow: "Escrow deposit",
      dias_depositar: "Business days to deposit",
      dias_saldo: "Business days for balance (before closing)",
      anticipo_gastos: "Closing cost advance",
      honorarios_escrow: "Escrow fees (USD)",
      fecha_presentacion: "Presentation date", ciudad_presentacion: "City",
      fecha_vigencia: "Expiration date", hora_vigencia: "Expiration time",
      formalizacion_es: "Closing date (ES)", formalizacion_en: "Closing date (EN)",
      extension_es: "Extension (ES)", extension_en: "Extension (EN)",
      nombre_notario: "Notary name", no_notaria_dest: "Notary no.",
      ciudad_notaria: "City",
      pct_total: "Total %", agencia1: "Agency 1", pct_ag1: "% Ag. 1",
      agencia2: "Agency 2", pct_ag2: "% Ag. 2",
      pct_penalidad: "Penalty %", jurisdiccion: "Jurisdiction",
      pct_parte_afectada: "% injured party", pct_agencia: "% agency",
      nombre_coord: "Name", empresa_coord: "Company",
      nombre_lender: "Lender name",
      dias_due_diligence: "Lender due diligence days",
      exclusiones_es: "Exclusions (ES)", exclusiones_en: "Exclusions (EN)",
    },
    nav: { siguiente: "Next", anterior: "Back", generar: "Download .docx" },
    validation: {
      errores: "Critical errors", advertencias: "Warnings",
      corregir: "Fix errors", generar_igual: "Generate anyway",
    },
  },
  fr: {
    steps: ["Parties", "Propriété", "Contrat", "Clauses", "Aperçu"],
    sections: {
      idioma: "Langue de l'acheteur",
      idioma_sub: "Langue préférée de l'acheteur pour sa copie",
      inmueble: "Détails du bien",
      antecedente: "Historique du titre",
      precio: "Prix et paiements",
      escrow: "Séquestre",
      fechas: "Dates et délais",
      notario: "Notaire désigné",
      comision: "Commission immobilière",
      penalidad: "Pénalité / Juridiction",
      testigos: "Témoins et acceptation",
      coordinador: "Coordinateur de clôture",
      clausulas: "Clauses optionnelles",
      clausulas_adicionales: "Clauses additionnelles",
    },
    header: {
      cargar: "Charger", guardar: "Sauvegarder", limpiar: "Effacer",
    },
    preview: {
      title: "Aperçu bilingue",
      descargar: "Télécharger .docx",
      generando: "Génération...",
    },
    fields: {
      nombre_completo: "NOM COMPLET", nacionalidad: "Nationalité",
      celular: "Cellulaire/WhatsApp", email: "Courriel", domicilio: "Adresse",
      agregar_persona: "+ Ajouter personne",
      genero_m: "Masculin", genero_f: "Féminin", placeholder_nacionalidad: "Canadien, Américain, Français...",
      domicilio_inmueble: "Bien immobilier objet de la présente offre", label_ofertante: "Offrant", label_propietario: "Propriétaire", nacionalidades: [{v:"estadounidense", l:"🇺🇸 Américain(e)"}, {v:"canadiense", l:"🇨🇦 Canadien(ne)"}, {v:"francocanadiense", l:"🇨🇦 Franco-canadien(ne)"}],
      descripcion_corta: "Description courte", ubicacion_completa: "Emplacement complet",
      nivel_torre: "Niveau/Tour", interior: "Intérieur",
      superficie_m2: "Surface m²", superficie_letras: "Surface en lettres",
      indiviso: "Quote-part %", clave_catastral: "Référence cadastrale",
      notas_uso_exclusivo_es: "Notes usage exclusif (ES)", notas_uso_exclusivo_en: "Notes usage exclusif (EN)",
      uso_exclusivo_label: "Inclure notes d'usage exclusif",
      uso_exclusivo_sub: "Stationnement, rangement, servitude, terrasse privée...",
      fecha_escritura: "Date de l'acte", no_escritura: "No. acte",
      notario_ant: "Notaire", no_notaria: "No. étude", ciudad: "Ville",
      folio_real_electronico: "Folio foncier électronique", folio_real: "Folio foncier",
      libro: "Livre", seccion: "Section", serie: "Série", partida: "Entrée",
      documento: "Document", folios: "Folios", cuenta_predial: "Taxe foncière",
      estado_rpp: "État du registre", tipo_inscripcion: "Type d'inscription",
      precio_total: "Prix total", deposito_escrow: "Dépôt de séquestre",
      dias_depositar: "Jours ouvrables pour déposer",
      dias_saldo: "Jours ouvrables solde (avant clôture)",
      anticipo_gastos: "Avance frais de notaire",
      honorarios_escrow: "Honoraires séquestre (USD)",
      fecha_presentacion: "Date de présentation", ciudad_presentacion: "Ville",
      fecha_vigencia: "Date d'expiration", hora_vigencia: "Heure d'expiration",
      formalizacion_es: "Date de clôture (ES)", formalizacion_en: "Date de clôture (EN)",
      extension_es: "Extension (ES)", extension_en: "Extension (EN)",
      nombre_notario: "Nom du notaire", no_notaria_dest: "No. étude",
      ciudad_notaria: "Ville",
      pct_total: "% total", agencia1: "Agence 1", pct_ag1: "% Ag. 1",
      agencia2: "Agence 2", pct_ag2: "% Ag. 2",
      pct_penalidad: "% pénalité", jurisdiccion: "Juridiction",
      pct_parte_afectada: "% partie lésée", pct_agencia: "% agence",
      nombre_coord: "Nom", empresa_coord: "Entreprise",
      nombre_lender: "Nom du prêteur",
      dias_due_diligence: "Jours due diligence prêteur",
      exclusiones_es: "Exclusions (ES)", exclusiones_en: "Exclusions (EN)",
    },
    nav: { siguiente: "Suivant", anterior: "Retour", generar: "Télécharger .docx" },
    validation: {
      errores: "Erreurs critiques", advertencias: "Avertissements",
      corregir: "Corriger", generar_igual: "Générer quand même",
    },
  },
};

// ============================================================
// MAIN APP
// ============================================================
export default function OfertaGenPage() {
  const [data, setData] = useState(INIT);
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [logoBase64, setLogoBase64] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [idiomaSecundario, setIdiomaSecundario] = useState('es'); // 'es', 'en' o 'fr'
  const [contractLang, setContractLang] = useState('en'); // 'en' o 'fr' — idioma secundario del contrato
  const t = UI[idiomaSecundario] || UI.es; // i18n activo Sprint V-a
  const lang2 = contractLang; // idioma secundario del contrato — independiente de la UI
  const steps = t.steps;

  // Auto-save draft
  useEffect(() => {
    try { const s = localStorage.getItem("ofertagen_draft"); if (s) setData(JSON.parse(s)); } catch {}
  }, []);
  useEffect(() => {
    const t = setTimeout(() => { try { localStorage.setItem("ofertagen_draft", JSON.stringify(data)); } catch {} }, 1000);
    return () => clearTimeout(t);
  }, [data]);

  const upParte = (pid, k, v) => setData(d => ({...d, partes:{...d.partes, [pid]:{...d.partes[pid], [k]:v}}}));
  const upPersona = (pid, i, k, v) => setData(d => { const pp=[...d.partes[pid].personas]; pp[i]={...pp[i],[k]:v}; return {...d, partes:{...d.partes, [pid]:{...d.partes[pid], personas:pp}}}; });
  const addPersona = (pid) => setData(d => ({...d, partes:{...d.partes, [pid]:{...d.partes[pid], personas:[...d.partes[pid].personas,{nombre:"",genero:"M"}]}}}));
  const rmPersona = (pid, i) => setData(d => ({...d, partes:{...d.partes, [pid]:{...d.partes[pid], personas:d.partes[pid].personas.filter((_,j)=>j!==i)}}}));
  const upCampo = (sec, k, v) => setData(d => ({...d, campos:{...d.campos, [sec]:{...d.campos[sec], [k]:v}}}));
  const togBloque = (id) => setData(d => ({...d, bloques:{...d.bloques, [id]:!d.bloques[id]}}));
  const loadDemo = () => setData(JSON.parse(JSON.stringify(DEMO)));
  const resetAll = () => { setData(JSON.parse(JSON.stringify(INIT))); setStep(0); localStorage.removeItem("ofertagen_draft"); };

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
          // Guardar preview (data URL completa) y base64 puro (sin prefijo)
          setLogoPreview(dataUrl);
          const base64 = dataUrl.split(",")[1];
          setLogoBase64(base64);
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }, []);

  const clearLogo = useCallback(() => {
    setLogoBase64(null);
    setLogoPreview(null);
  }, []);

  // Export/Import borradores
  const exportDraft = useCallback(() => {
    const nombre = data.partes?.ofertante?.personas?.[0]?.nombre?.split(" ")[0] || "BORRADOR";
    const fecha = new Date().toISOString().slice(0, 10);
    const blob = new Blob([JSON.stringify({ version: "3.0", exportedAt: new Date().toISOString(), step, data }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `OFERTAGEN_${nombre}_${fecha}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data, step]);

  const importDraft = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (parsed.data) {
          setData(parsed.data);
          if (typeof parsed.step === "number") setStep(parsed.step);
        } else {
          // Legacy format (data at root)
          setData(parsed);
        }
      } catch (err) {
        alert("Error al cargar el archivo. Verifica que sea un borrador válido.");
      }
    };
    input.click();
  }, []);

  const ctx = useMemo(() => ensamblar(data), [data]);
  const bloques = useMemo(() => renderBlks(ctx), [ctx]);

  // ── VALIDADOR SPRINT U ──────────────────────────────────────
  const validarOferta = useCallback((bloquesRenderizados, contratLang2 = 'en') => {
    const errors = [];
    const warnings = [];

    // Campos críticos
    const partes = data.partes;
    if (!partes.ofertante.personas[0]?.nombre?.trim())
      errors.push("Nombre del ofertante vacío");
    if (!partes.ofertante.email?.trim())
      errors.push("Email del ofertante vacío");
    if (!partes.propietario.personas[0]?.nombre?.trim())
      errors.push("Nombre del propietario vacío");
    if (!data.campos.precio?.precio_total || data.campos.precio.precio_total <= 0)
      errors.push("Precio de oferta no definido");
    if (!data.campos.fechas?.fecha_vigencia)
      errors.push("Fecha de vigencia no definida");
    if (!data.campos.notario?.notario_seleccion)
      errors.push("Notario no seleccionado");

    // Placeholders no resueltos — revisa ES + idioma secundario
    const PLACEHOLDER_RE = /\[([A-ZÁÉÍÓÚÑ_]{3,})\]/g;
    bloquesRenderizados.forEach((b) => {
      const bLang2 = lang2 === 'fr' ? b.fr : b.en;
      [b.es, bLang2].forEach((txt) => {
        if (!txt) return;
        const matches = [...txt.matchAll(PLACEHOLDER_RE)];
        matches.forEach(([match]) => {
          if (!warnings.includes(`Placeholder sin resolver: ${match}`))
            warnings.push(`Placeholder sin resolver: ${match}`);
        });
      });
    });

    // Ratio ES/idioma2 — posible traducción incompleta
    bloquesRenderizados.forEach((b) => {
      const bLang2 = lang2 === 'fr' ? b.fr : b.en;
      if (!b.es || !lang2) return;
      const ratio = b.es.length / (bLang2||b.es).length;
      if (ratio < 0.4 || ratio > 2.5) {
        const id = b.id || b.t?.es?.slice(0, 20) || '?';
        warnings.push(`Posible traducción incompleta en: "${id}"`);
      }
    });

    return { valid: errors.length === 0, errors, warnings };
  }, [data, contractLang]);

  const handleGenerateForced = useCallback(async () => {
    setValidationResult(null);
    setGenerating(true);
    try {
      const blob = await generarDocxBlob(bloques, PLANTILLA.meta, { logoBase64, idiomaSecundario: lang2 });
      const nombre = data.partes.ofertante.personas[0]?.nombre?.replace(/\s+/g, "_") || "OFERTA";
      const idiomaSufijo = lang2 === 'fr' ? '_FR' : '';
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `OFERTA_${nombre}${idiomaSufijo}.docx`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generando DOCX:", err);
      alert("Error al generar el documento. Revisa la consola.");
    } finally { setGenerating(false); }
  }, [bloques, data, logoBase64, idiomaSecundario]);

  const handleGenerate = useCallback(async () => {
    if (!bloques.length) return;
    // Validar antes de generar
    const result = validarOferta(bloques, lang2);
    if (!result.valid || result.warnings.length > 0) {
      setValidationResult(result);
      return;
    }
    setGenerating(true);
    try {
      const blob = await generarDocxBlob(bloques, PLANTILLA.meta, { logoBase64, idiomaSecundario: lang2 });
      const nombre = data.partes.ofertante.personas[0]?.nombre?.replace(/\s+/g, "_") || "OFERTA";
      const idiomaSufijo = lang2 === 'fr' ? '_FR' : '';
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `OFERTA_${nombre}${idiomaSufijo}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generando DOCX:", err);
      alert("Error al generar el documento. Revisa la consola.");
    }
    setGenerating(false);
  }, [bloques, data.partes.ofertante.personas, logoBase64, idiomaSecundario]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6" style={{minHeight:"100vh",background:"var(--og-bg)"}}>
      {/* Modal de validación Sprint U */}
      {validationResult && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{background:"rgba(0,0,0,0.75)"}}>
          <div className="rounded-2xl shadow-2xl max-w-md w-full p-6" style={{background:"var(--og-card)",border:"1px solid var(--og-border)"}}>
            <h2 className="text-lg font-bold mb-4">
              {validationResult.valid ? "⚠️ Advertencias" : "❌ Errores en el documento"}
            </h2>
            {validationResult.errors.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-red-500 uppercase mb-2">Errores críticos</p>
                <ul className="space-y-1 max-h-40 overflow-y-auto">
                  {validationResult.errors.map((e, i) => (
                    <li key={i} className="text-sm text-red-600 flex gap-2"><span>❌</span>{e}</li>
                  ))}
                </ul>
              </div>
            )}
            {validationResult.warnings.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-yellow-500 uppercase mb-2">Advertencias</p>
                <ul className="space-y-1 max-h-40 overflow-y-auto">
                  {validationResult.warnings.map((w, i) => (
                    <li key={i} className="text-sm text-yellow-600 flex gap-2"><span>⚠️</span>{w}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-3 mt-5">
              <button onClick={() => setValidationResult(null)}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50:bg-gray-800 transition">
                {t.validation.corregir}
              </button>
              {validationResult.valid && (
                <button onClick={handleGenerateForced}
                  className="flex-1 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-xl transition">
                  {t.validation.generar_igual}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{color:"var(--og-primary)"}}>OfertaGen</h1>
          <p className="text-xs mt-0.5" style={{color:"var(--og-secondary)"}}>Expat Advisor MX</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end items-center">
          {/* Logo upload */}
          {logoPreview ? (
            <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 border border-purple-200 rounded-lg">
              <img src={logoPreview} alt="Logo" className="h-6 max-w-16 object-contain" />
              <button onClick={clearLogo} className="text-purple-500 hover:text-purple-700 text-xs ml-1" title="Quitar logo">✕</button>
            </div>
          ) : (
            <button onClick={handleLogoUpload} className="px-3 py-1.5 text-xs rounded-lg transition flex items-center gap-1" style={{background:"var(--og-surface)",border:"1px solid var(--og-border)",color:"var(--og-secondary)"}}>
              <span>🖼️</span> Logo
            </button>
          )}
          <button onClick={importDraft} className="px-3 py-1.5 text-xs rounded-lg transition flex items-center gap-1" style={{background:"var(--og-surface)",border:"1px solid var(--og-border)",color:"var(--og-secondary)"}}>
            <span>📂</span> {t.header.cargar}
          </button>
          <button onClick={exportDraft} className="px-3 py-1.5 text-xs rounded-lg transition flex items-center gap-1" style={{background:"var(--og-surface)",border:"1px solid var(--og-border)",color:"var(--og-secondary)"}}>
            <span>💾</span> {t.header.guardar}
          </button>
          <button onClick={loadDemo} className="px-3 py-1.5 text-xs rounded-lg transition og-btn-demo">Demo</button>
          <button onClick={resetAll} className="px-3 py-1.5 text-xs rounded-lg transition" style={{background:"var(--og-surface)",border:"1px solid var(--og-border)",color:"var(--og-secondary)"}}>{t.header.limpiar}</button>
          {/* Toggle idioma UI — Sprint V-a */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
            {[['es','ES'],['en','EN'],['fr','FR']].map(([lang, label]) => (
              <button key={lang} onClick={() => { setIdiomaSecundario(lang); setContractLang(lang === 'fr' ? 'fr' : 'en'); }}
                className={`px-2.5 py-1.5 transition ${idiomaSecundario === lang ? "og-step-active" : ""}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex gap-1 mb-6">
        {steps.map((s, i) => (
          <button key={s} onClick={() => setStep(i)}
            className={`flex-1 py-2.5 text-xs font-medium rounded-lg transition-all ${i === step ? "og-step-active" : i < step ? "og-step-done" : "og-step-idle"}`}>
            {i + 1}. {s}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl p-6 mb-4 min-h-[400px]" style={{background:"var(--og-card)",border:"1px solid var(--og-border)"}}>

        {step === 0 && <>
          <PartePanel data={data} pid="ofertante" label={t.fields.label_ofertante} upParte={upParte} upPersona={upPersona} addPersona={addPersona} rmPersona={rmPersona} t={t} />
          <PartePanel data={data} pid="propietario" label={t.fields.label_propietario} upParte={upParte} upPersona={upPersona} addPersona={addPersona} rmPersona={rmPersona} t={t} />
          <Section title={t.sections.idioma}>
            <div className="col-span-2 flex flex-col gap-2">
              <p className="text-xs" style={{color:"var(--og-secondary)"}}>{t.sections.idioma_sub}</p>
              <div className="flex gap-2">
                {[['en','🇺🇸 English'],['fr','🇨🇦 Français']].map(([cl, label]) => (
                  <button key={cl} onClick={() => setContractLang(cl)}
                    className="flex-1 px-3 py-2 text-sm rounded-xl transition font-medium"
                    style={{
                      background: contractLang === cl ? "var(--og-accent)" : "var(--og-surface)",
                      border: contractLang === cl ? "1px solid var(--og-accent-hi)" : "1px solid var(--og-border)",
                      color: contractLang === cl ? "#fff" : "var(--og-secondary)"
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </Section>
        </>}

        {step === 1 && <>
          <Section title={t.sections.inmueble}>
            <Input label={t.fields.descripcion_corta} value={data.campos.inmueble?.descripcion_corta} onChange={v=>upCampo("inmueble","descripcion_corta",v)} placeholder="Departamento 43 del Condo Orquídeas" required wide />
            <Input label={t.fields.ubicacion_completa} value={data.campos.inmueble?.ubicacion_completa} onChange={v=>upCampo("inmueble","ubicacion_completa",v)} wide rows={3} required />
            <Input label={t.fields.nivel_torre} value={data.campos.inmueble?.nivel_torre} onChange={v=>upCampo("inmueble","nivel_torre",v)} />
            <Input label={t.fields.interior} value={data.campos.inmueble?.descripcion_interior} onChange={v=>upCampo("inmueble","descripcion_interior",v)} />
            <Input label={t.fields.superficie_m2} value={data.campos.inmueble?.superficie_m2} onChange={v=>upCampo("inmueble","superficie_m2",v)} type="number" required />
            <Input label={t.fields.superficie_letras} value={data.campos.inmueble?.superficie_letras} onChange={v=>upCampo("inmueble","superficie_letras",v)} required />
            <Input label={t.fields.indiviso} value={data.campos.inmueble?.indiviso} onChange={v=>upCampo("inmueble","indiviso",v)} />
            <Input label={t.fields.clave_catastral} value={data.campos.inmueble?.clave_catastral} onChange={v=>upCampo("inmueble","clave_catastral",v)} placeholder="020-024-01-039-258-000" />
            <div className="col-span-2 flex items-center gap-3 p-3 rounded-lg" style={{background:"var(--og-surface)",border:"1px solid var(--og-border)"}}>
              <input type="checkbox" checked={!!data.campos.inmueble?.tiene_uso_exclusivo} onChange={e=>upCampo("inmueble","tiene_uso_exclusivo",e.target.checked)} className="rounded" />
              <div>
                <label className="text-sm font-medium" style={{color:"var(--og-primary)"}}>{t.fields.uso_exclusivo_label}</label>
                <p className="text-xs" style={{color:"var(--og-secondary)"}}>{t.fields.uso_exclusivo_sub}</p>
              </div>
            </div>
            {data.campos.inmueble?.tiene_uso_exclusivo && <>
              <Input label={t.fields.notas_uso_exclusivo_es} value={data.campos.inmueble?.notas_uso_exclusivo} onChange={v=>upCampo("inmueble","notas_uso_exclusivo",v)} wide rows={2} placeholder="un estacionamiento con superficie descubierta de 14.40 m² y una bodega de 2.80 m²" />
              <Input label={t.fields.notas_uso_exclusivo_en} value={data.campos.inmueble?.notas_uso_exclusivo_en} onChange={v=>upCampo("inmueble","notas_uso_exclusivo_en",v)} wide rows={2} placeholder="a parking space of 14.40 sq m and a storage room of 2.80 sq m" />
            </>}
          </Section>
          <Section title={t.sections.antecedente}>
            <Input label={t.fields.fecha_escritura} value={data.campos.antecedente?.fecha_escritura} onChange={v=>upCampo("antecedente","fecha_escritura",v)} type="date" required />
            <Input label={t.fields.no_escritura} value={data.campos.antecedente?.numero_escritura} onChange={v=>upCampo("antecedente","numero_escritura",v)} required />
            <Input label={t.fields.notario_ant} value={data.campos.antecedente?.notario_anterior} onChange={v=>upCampo("antecedente","notario_anterior",v)} required />
            <Input label={t.fields.no_notaria} value={data.campos.antecedente?.numero_notaria_anterior} onChange={v=>upCampo("antecedente","numero_notaria_anterior",v)} required />
            <Input label={t.fields.ciudad} value={data.campos.antecedente?.ciudad_notaria_anterior} onChange={v=>upCampo("antecedente","ciudad_notaria_anterior",v)} required />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Estado del RPP</label>
              <select value={data.campos.antecedente?.estado_registro||"nayarit"} onChange={e=>upCampo("antecedente","estado_registro",e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="nayarit">Nayarit (Bahía de Banderas, Bucerías)</option>
                <option value="jalisco">Jalisco (Puerto Vallarta)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Tipo de inscripción</label>
              <select value={data.campos.antecedente?.tipo_registro||"folio_real"} onChange={e=>upCampo("antecedente","tipo_registro",e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="folio_real">{(data.campos.antecedente?.estado_registro||"nayarit") === "nayarit" ? "Folio Real Electrónico" : "Folio Real"}</option>
                <option value="legacy">Inscripción tradicional (legacy)</option>
              </select>
            </div>
            {(data.campos.antecedente?.tipo_registro||"folio_real") === "folio_real" ? (
              <Input label={(data.campos.antecedente?.estado_registro||"nayarit") === "nayarit" ? "Folio Real Electrónico" : "Folio Real"} value={data.campos.antecedente?.folio_real} onChange={v=>upCampo("antecedente","folio_real",v)} placeholder="Ej: 54832" />
            ) : (data.campos.antecedente?.estado_registro||"nayarit") === "nayarit" ? (<>
              <Input label={t.fields.libro} value={data.campos.antecedente?.libro_rpp} onChange={v=>upCampo("antecedente","libro_rpp",v)} />
              <Input label={t.fields.seccion} value={data.campos.antecedente?.seccion_rpp} onChange={v=>upCampo("antecedente","seccion_rpp",v)} />
              <Input label={t.fields.serie} value={data.campos.antecedente?.serie_rpp} onChange={v=>upCampo("antecedente","serie_rpp",v)} />
              <Input label={t.fields.partida} value={data.campos.antecedente?.partida_rpp} onChange={v=>upCampo("antecedente","partida_rpp",v)} />
            </>) : (<>
              <Input label={t.fields.documento} value={data.campos.antecedente?.documento_rpp} onChange={v=>upCampo("antecedente","documento_rpp",v)} />
              <Input label={t.fields.folios} value={data.campos.antecedente?.folios_rpp} onChange={v=>upCampo("antecedente","folios_rpp",v)} />
              <Input label={t.fields.libro} value={data.campos.antecedente?.libro_jal} onChange={v=>upCampo("antecedente","libro_jal",v)} />
              <Input label={t.fields.seccion} value={data.campos.antecedente?.seccion_jal} onChange={v=>upCampo("antecedente","seccion_jal",v)} />
            </>)}
            <Input label={t.fields.cuenta_predial} value={data.campos.antecedente?.cuenta_predial} onChange={v=>upCampo("antecedente","cuenta_predial",v)} />
          </Section>
        </>}

        {step === 2 && <>
          <Section title={t.sections.precio}>
            <Input label={t.fields.precio_total} value={data.campos.precio?.precio_total} onChange={v=>upCampo("precio","precio_total",v)} type="number" required />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Moneda</label>
              <select value={data.campos.precio?.moneda||"USD"} onChange={e=>upCampo("precio","moneda",e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="USD">USD</option><option value="MXN">MXN</option>
              </select>
            </div>
            <Input label={t.fields.deposito_escrow} value={data.campos.precio?.deposito_escrow} onChange={v=>upCampo("precio","deposito_escrow",v)} type="number" />
            <Input label={t.fields.dias_depositar} value={data.campos.precio?.dias_deposito||3} onChange={v=>upCampo("precio","dias_deposito",v)} type="number" />
            <Input label={t.fields.dias_saldo} value={data.campos.precio?.dias_saldo||5} onChange={v=>upCampo("precio","dias_saldo",v)} type="number" />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Anticipo gastos de escrituración</label>
              <select value={data.campos.precio?.anticipo_gastos||"0"} onChange={e=>upCampo("precio","anticipo_gastos",e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="0">Sin anticipo</option>
                <option value="1000">$1,000 USD</option>
                <option value="2000">$2,000 USD</option>
                <option value="3000">$3,000 USD</option>
                <option value="5000">$5,000 USD</option>
                <option value="7500">$7,500 USD</option>
                <option value="10000">$10,000 USD</option>
              </select>
            </div>
            {ctx && <div className="col-span-2 p-3 rounded-xl text-xs space-y-1" style={{background:"rgba(29,107,184,0.12)",border:"1px solid rgba(56,139,253,0.25)"}}>
              <div><span className="text-gray-500">Total:</span> <span className="font-medium">{ctx.precio?.completo}</span></div>
              <div><span className="text-gray-500">Depósito:</span> <span className="font-medium">{ctx.deposito?.completo}</span></div>
              <div><span className="text-gray-500">Saldo:</span> <span className="font-medium">{ctx.saldo?.completo}</span></div>
            </div>}
          </Section>
          <Section title={t.sections.escrow}>
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-xs font-medium text-gray-500">Empresa escrow</label>
              <select value={data.campos.escrow?.empresa_escrow||"STEWART TITLE LATIN AMERICA"} onChange={e=>upCampo("escrow","empresa_escrow",e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="STEWART TITLE LATIN AMERICA">Stewart Title Latin America (STLA)</option>
                <option value="ARMOUR SETTLEMENT SERVICES">Armour Settlement Services</option>
                <option value="TITLE LATIN AMERICA (TLA)">Title Latin America (TLA)</option>
                <option value="P&A ESCROW">P&A Escrow</option>
              </select>
            </div>
            <Input label={t.fields.honorarios_escrow} value={data.campos.escrow?.honorarios_escrow||750} onChange={v=>upCampo("escrow","honorarios_escrow",v)} type="number" />
          </Section>
          <Section title={t.sections.fechas}>
            <Input label={t.fields.fecha_presentacion} value={data.campos.fechas?.fecha_presentacion} onChange={v=>upCampo("fechas","fecha_presentacion",v)} type="date" required />
            <Input label={t.fields.ciudad} value={data.campos.fechas?.ciudad_presentacion} onChange={v=>upCampo("fechas","ciudad_presentacion",v)} required />
            <Input label={t.fields.fecha_vigencia} value={data.campos.fechas?.fecha_vigencia} onChange={v=>upCampo("fechas","fecha_vigencia",v)} type="date" required />
            <Input label={t.fields.hora_vigencia} value={data.campos.fechas?.hora_vigencia||"medianoche"} onChange={v=>upCampo("fechas","hora_vigencia",v)} placeholder="medianoche, 17:00 horas..." />
            <Input label={t.fields.formalizacion_es} value={data.campos.fechas?.fecha_formalizacion} onChange={v=>upCampo("fechas","fecha_formalizacion",v)} wide />
            <Input label={t.fields.formalizacion_en} value={data.campos.fechas?.fecha_formalizacion_en} onChange={v=>upCampo("fechas","fecha_formalizacion_en",v)} wide />
            <Input label={t.fields.extension_es} value={data.campos.fechas?.fecha_extension} onChange={v=>upCampo("fechas","fecha_extension",v)} />
            <Input label={t.fields.extension_en} value={data.campos.fechas?.fecha_extension_en} onChange={v=>upCampo("fechas","fecha_extension_en",v)} />
          </Section>
          <Section title={t.sections.notario}>
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-xs font-medium text-gray-500">Notario <span className="text-red-500">*</span></label>
              <select value={data.campos.notario?.notario_seleccion||""} onChange={e=>upCampo("notario","notario_seleccion",e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="">Seleccionar notario...</option>
                <option value="careaga_12">Notaría 12 — Lic. Jorge Careaga (PV, Jalisco)</option>
                <option value="meza_29">Notaría 29 — Lic. Adán Meza Barajas (Bucerías, Nay.)</option>
                <option value="ramirez_2">Notaría 2 — Lic. Teodoro Ramírez Valenzuela (Bucerías, Nay.)</option>
                <option value="agraz_3">Notaría 3 — Lic. José Agraz Cabrales (PV, Jalisco)</option>
                <option value="navarrete_1">Notaría 1 — Lic. Rafael Navarrete (Bucerías, Nay.)</option>
                <option value="leon_5">Notaría 5 — Lic. Ricardo León Gutiérrez (PV, Jalisco)</option>
                <option value="otro">Otro notario (captura manual)</option>
              </select>
            </div>
            {data.campos.notario?.notario_seleccion === "otro" && <>
              <Input label={t.fields.nombre_notario} value={data.campos.notario?.nombre_notario} onChange={v=>upCampo("notario","nombre_notario",v)} required />
              <Input label={t.fields.no_notaria} value={data.campos.notario?.numero_notaria} onChange={v=>upCampo("notario","numero_notaria",v)} required />
              <Input label={t.fields.ciudad} value={data.campos.notario?.ciudad_notaria} onChange={v=>upCampo("notario","ciudad_notaria",v)} required />
            </>}
          </Section>
          {data.bloques.financiamiento && <Section title="Sujeto a financiamiento">
            <Input label={t.fields.nombre_lender} value={data.campos.financiamiento?.nombre_lender} onChange={v=>upCampo("financiamiento","nombre_lender",v)} placeholder="MXMORTGAGE, Intercam..." />
            <Input label={t.fields.dias_due_diligence} value={data.campos.financiamiento?.dias_due_diligence||30} onChange={v=>upCampo("financiamiento","dias_due_diligence",v)} type="number" />
          </Section>}
          {data.bloques.inventario && <Section title="Inventario / Inclusion list">
            <Input label={t.fields.exclusiones_es} value={data.campos.inventario?.exclusiones} onChange={v=>upCampo("inventario","exclusiones",v)} wide rows={2} placeholder="obras de arte, artículos personales del vendedor" />
            <Input label={t.fields.exclusiones_en} value={data.campos.inventario?.exclusiones_en} onChange={v=>upCampo("inventario","exclusiones_en",v)} wide rows={2} placeholder="artwork, seller personal items" />
          </Section>}
          {data.bloques.arrendamientos && <Section title="Arrendamientos vigentes">
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-xs font-medium text-gray-500">Vendedor percibe rentas hasta...</label>
              <select value={data.campos.arrendamientos?.renta_hasta||"escrow"} onChange={e=>upCampo("arrendamientos","renta_hasta",e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="escrow">Hasta que el dinero se refleje en escrow</option>
                <option value="cuenta_vendedor">Hasta que el dinero se refleje en cuenta del vendedor</option>
                <option value="cierre">Hasta la fecha de formalización</option>
              </select>
            </div>
          </Section>}
          <Section title={t.sections.comision}>
            <Input label={t.fields.pct_total} value={data.campos.comision?.porcentaje_total} onChange={v=>upCampo("comision","porcentaje_total",v)} />
            <div className="flex items-center gap-2 self-end pb-2">
              <input type="checkbox" checked={!!data.campos.comision?.incluye_iva} onChange={e=>upCampo("comision","incluye_iva",e.target.checked)} className="rounded" />
              <label className="text-xs text-gray-500">+ IVA 16%</label>
            </div>
            <Input label={t.fields.agencia1} value={data.campos.comision?.agencia1_nombre} onChange={v=>upCampo("comision","agencia1_nombre",v)} />
            <Input label={t.fields.pct_ag1} value={data.campos.comision?.agencia1_porcentaje} onChange={v=>upCampo("comision","agencia1_porcentaje",v)} />
            <Input label={t.fields.agencia2} value={data.campos.comision?.agencia2_nombre} onChange={v=>upCampo("comision","agencia2_nombre",v)} />
            <Input label={t.fields.pct_ag2} value={data.campos.comision?.agencia2_porcentaje} onChange={v=>upCampo("comision","agencia2_porcentaje",v)} />
          </Section>
          <Section title={t.sections.penalidad}>
            <Input label={t.fields.pct_penalidad} value={data.campos.penalidad?.porcentaje_penalidad} onChange={v=>upCampo("penalidad","porcentaje_penalidad",v)} />
            <Input label={t.fields.jurisdiccion} value={data.campos.jurisdiccion?.ciudad_jurisdiccion} onChange={v=>upCampo("jurisdiccion","ciudad_jurisdiccion",v)} />
            <div className="col-span-2 flex items-center gap-3 p-3 rounded-lg" style={{background:"var(--og-surface)",border:"1px solid var(--og-border)"}}>
              <input type="checkbox" checked={!!data.campos.penalidad?.distribuir_agencia} onChange={e=>upCampo("penalidad","distribuir_agencia",e.target.checked)} className="rounded" />
              <div>
                <label className="text-sm font-medium" style={{color:"var(--og-primary)"}}>Distribuir penalidad con agencia</label>
                <p className="text-xs" style={{color:"var(--og-secondary)"}}>Parte afectada + agencia de RE</p>
              </div>
            </div>
            {data.campos.penalidad?.distribuir_agencia && <>
              <Input label={t.fields.pct_parte_afectada} value={data.campos.penalidad?.pct_parte_afectada||"60%"} onChange={v=>upCampo("penalidad","pct_parte_afectada",v)} />
              <Input label={t.fields.pct_agencia} value={data.campos.penalidad?.pct_agencia||"40%"} onChange={v=>upCampo("penalidad","pct_agencia",v)} />
            </>}
          </Section>
          <Section title={t.sections.testigos}>
            <div className="col-span-2 flex items-center gap-3 p-3 rounded-lg" style={{background:"var(--og-surface)",border:"1px solid var(--og-border)"}}>
              <input type="checkbox" checked={!!data.campos.testigos?.incluir_testigos} onChange={e=>upCampo("testigos","incluir_testigos",e.target.checked)} className="rounded" />
              <div>
                <label className="text-sm font-medium" style={{color:"var(--og-primary)"}}>Incluir líneas de testigos</label>
                <p className="text-xs" style={{color:"var(--og-secondary)"}}>Testigo 1 y Testigo 2 en la página de firma</p>
              </div>
            </div>
            <div className="col-span-2 flex items-center gap-3 p-3 rounded-lg" style={{background:"var(--og-surface)",border:"1px solid var(--og-border)"}}>
              <input type="checkbox" checked={data.campos.testigos?.incluir_aceptacion!==false} onChange={e=>upCampo("testigos","incluir_aceptacion",e.target.checked)} className="rounded" />
              <div>
                <label className="text-sm font-medium" style={{color:"var(--og-primary)"}}>Lugar, fecha y hora de aceptación</label>
                <p className="text-xs" style={{color:"var(--og-secondary)"}}>Línea para que el vendedor anote cuándo aceptó</p>
              </div>
            </div>
          </Section>
          <Section title={t.sections.coordinador}>
            <Input label={t.fields.nombre_coord} value={data.campos.coordinador?.nombre_coordinador} onChange={v=>upCampo("coordinador","nombre_coordinador",v)} placeholder="Lic. Rolando Romero García" />
            <Input label={t.fields.empresa_coord} value={data.campos.coordinador?.empresa_coordinador} onChange={v=>upCampo("coordinador","empresa_coordinador",v)} placeholder="Expat Advisor MX" />
            <Input label={t.fields.celular} value={data.campos.coordinador?.celular_coordinador} onChange={v=>upCampo("coordinador","celular_coordinador",v)} type="tel" />
            <Input label={t.fields.email} value={data.campos.coordinador?.email_coordinador} onChange={v=>upCampo("coordinador","email_coordinador",v)} type="email" />
          </Section>
        </>}

        {step === 3 && <div className="space-y-3">
          <h2 className="text-lg font-semibold mb-1" style={{color:"var(--og-primary)"}}>{t.sections.clausulas}</h2>
          <p className="text-xs text-gray-500 mb-4">Activa o desactiva sin romper el contrato.</p>
          <Toggle label="Adjudicación de cónyuge" sub="50% derechos fideicomisarios del esposo fallecido" checked={data.bloques.adjudicacion_conyuge} onChange={()=>togBloque("adjudicacion_conyuge")} />
          <Toggle label="Ad Corpus / As-Is" sub="Compra por cuerpo cierto, superficies aproximadas, estado actual" checked={data.bloques.ad_corpus} onChange={()=>togBloque("ad_corpus")} />
          <Toggle label="Cuenta Escrow" sub="Depósito condicional irrevocable (Stewart Title)" checked={data.bloques.escrow} onChange={()=>togBloque("escrow")} />
          <Toggle label="Inspección del inmueble" sub="Período de inspección y aprobación del reporte" checked={data.bloques.inspeccion} onChange={()=>togBloque("inspeccion")} />
          <Toggle label="Documentación fideicomiso" sub="Copia del fideicomiso y actas de asamblea" checked={data.bloques.doc_fideicomiso} onChange={()=>togBloque("doc_fideicomiso")} />
          <Toggle label="Sujeto a financiamiento" sub="Compra con crédito hipotecario — due diligence del lender" checked={data.bloques.financiamiento} onChange={()=>togBloque("financiamiento")} />
          <Toggle label="Inventario / Inclusion list" sub="Lista detallada de muebles, electrodomésticos, exclusiones" checked={data.bloques.inventario} onChange={()=>togBloque("inventario")} />
          <Toggle label="Arrendamientos vigentes" sub="Rentas programadas, cesión de depósitos, decisión al depositar escrow" checked={data.bloques.arrendamientos} onChange={()=>togBloque("arrendamientos")} />
          <Toggle label="Zona Federal" sub="Propiedades frente al mar — concesión, cesión de derechos" checked={data.bloques.zona_federal} onChange={()=>togBloque("zona_federal")} />
          <Toggle label="Litigios pendientes" sub="Vendedor informa litigios con copias en 3 días hábiles; comprador acepta o rechaza en 5 días" checked={data.bloques.litigios_pendientes} onChange={()=>togBloque("litigios_pendientes")} />
          <Toggle label="Litigios laborales" sub="Vendedor informa relaciones y litigios laborales; comprador acepta o rechaza en 5 días" checked={data.bloques.empleados_condicion} onChange={()=>togBloque("empleados_condicion")} />
          <Toggle label="Comisión inmobiliaria" sub="Pago de comisión a agencias de RE" checked={data.bloques.comision} onChange={()=>togBloque("comision")} />
          <div className="mt-4 mb-2"><p className="text-xs font-semibold uppercase tracking-wider" style={{color:"var(--og-muted)"}}>{t.sections.clausulas_adicionales}</p></div>
          <Toggle label="Condición general y estado de uso" sub="Entrega en misma condición que inspección, desgaste normal" checked={data.bloques.condicion_uso} onChange={()=>togBloque("condicion_uso")} />
          <Toggle label="Obligaciones del vendedor" sub="Walk-through, carta no adeudo, prorrateo servicios, cesión CFE/cable" checked={data.bloques.obligaciones_vendedor} onChange={()=>togBloque("obligaciones_vendedor")} />
          {data.bloques.obligaciones_vendedor && <div className="ml-8">
            <Toggle label="Certificado no adeudo de agua" sub="Solo para inmuebles fuera de régimen de condominio" checked={data.bloques.obligaciones_vendedor_agua} onChange={()=>togBloque("obligaciones_vendedor_agua")} />
          </div>}
          <Toggle label="Derecho de deducción del precio" sub="Comprador deduce del precio reclamos no resueltos en 10 días" checked={data.bloques.derecho_deduccion} onChange={()=>togBloque("derecho_deduccion")} />
          <Toggle label="Auditoría de Hacienda" sub="Vendedor informa auditorías fiscales; responsable de adeudos pre-cierre" checked={data.bloques.auditoria_hacienda} onChange={()=>togBloque("auditoria_hacienda")} />
          <Toggle label="Holdback escrow condominio" sub="Retención en escrow por assessments pendientes; carta del administrador requerida" checked={data.bloques.holdback_escrow} onChange={()=>togBloque("holdback_escrow")} />
          <Toggle label="Caso fortuito y fuerza mayor" sub="Fallecimiento → beneficiarios; pandemias/huracanes/guerras → extensión 90 días + consentimiento mutuo" checked={data.bloques.fuerza_mayor} onChange={()=>togBloque("fuerza_mayor")} />
          <Toggle label="Factura complementaria" sub="Solo cuando vendedor es persona moral mexicana (PDF+XML)" checked={data.bloques.factura_complementaria} onChange={()=>togBloque("factura_complementaria")} />
          <Toggle label="Disclosure / Deslinde" sub="Notario neutral, agencia no asesora legal/fiscal, hold harmless" checked={data.bloques.disclosure} onChange={()=>togBloque("disclosure")} />
          <Toggle label="Documentos integrales" sub="Lista de documentos que forman parte de la oferta" checked={data.bloques.documentos_integrales} onChange={()=>togBloque("documentos_integrales")} />
          <Toggle label="Protección de datos personales" sub="Cláusula de privacidad para compradores extranjeros" checked={data.bloques.proteccion_datos} onChange={()=>togBloque("proteccion_datos")} />
          <Toggle label="Confidencialidad (NDA)" sub="Protege precio, términos e identidad del comprador durante y post-negociación" checked={data.bloques.confidencialidad} onChange={()=>togBloque("confidencialidad")} />
          {data.bloques.confidencialidad && <Section title="Confidencialidad — meses post-cierre">
            <label className="text-sm text-gray-600">Vigencia post-cierre / Post-closing term / Durée post-clôture</label>
            <select value={data.campos.confidencialidad?.meses||6} onChange={e=>upCampo("confidencialidad","meses",parseInt(e.target.value))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value={3}>3 meses / months / mois</option>
              <option value={6}>6 meses / months / mois</option>
              <option value={12}>12 meses / months / mois</option>
              <option value={24}>24 meses / months / mois</option>
            </select>
          </Section>}
          <Toggle label="Duplicados / Counterparts" sub="Validez de copias firmadas y comunicaciones electrónicas" checked={data.bloques.duplicados} onChange={()=>togBloque("duplicados")} />
        </div>}

        {step === 4 && <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{color:"var(--og-primary)"}}>{t.preview.title}</h2>
            <div className="flex items-center gap-3">
              <button onClick={handleGenerate} disabled={generating || !bloques.length}
                className="px-5 py-2 text-white text-sm font-medium rounded-xl transition" style={{background:"var(--og-success-hi)"}}>
                {generating ? t.preview.generando : t.preview.descargar}
              </button>
            </div>
          </div>
          {bloques.length === 0 ? <p className="text-sm" style={{color:"var(--og-secondary)"}}>Completa los datos de las partes para ver la vista previa.</p> :
          <div className="rounded-xl overflow-hidden text-xs leading-relaxed" style={{border:"1px solid var(--og-border)"}}>
            <div className="grid grid-cols-2" style={{background:"var(--og-surface)",borderBottom:"1px solid var(--og-border)"}}>
              <div className="px-3 py-2 font-semibold text-[10px] tracking-wider border-r" style={{color:"var(--og-secondary)",borderColor:"var(--og-border)"}}>ESPAÑOL</div>
              <div className="px-3 py-2 font-semibold text-[10px] tracking-wider" style={{color:"var(--og-secondary)"}}>{lang2 === 'fr' ? 'FRANÇAIS' : 'ENGLISH'}</div>
            </div>
            {bloques.map((b, i) => {
              if (b.tipo === "firmas") return (
                <div key={i} className="flex justify-around py-10" style={{borderTop:"1px solid var(--og-border)"}}>
                  {b.firmas?.map((f, j) => (
                    <div key={j} className="text-center">
                      <div className="w-48 border-b border-gray-900 mb-2" />
                      <div className="font-bold text-[11px]">{f.nombre}</div>
                      <div className="text-[10px] text-gray-500">{f.rol}</div>
                    </div>
                  ))}
                </div>
              );
              const tEs = b.titulo?.es || b.t?.es;
              const tLang2 = b.titulo?.[lang2] || b.titulo?.en || b.t?.[lang2] || b.t?.en;
              const textoLang2 = b[lang2] || b.en || '';
              const num = b.numero || b.n;
              return (
                <div key={i} className={`grid grid-cols-2 ${i ? "border-t border-gray-100" : ""}`}>
                  <div className="px-3 py-2.5 border-r border-gray-100">
                    {tEs && <p className="font-bold mb-1">{num ? `${num}.- ` : ""}{tEs}</p>}
                    {b.es?.split("\n\n").map((p, j) => <p key={j} className="mb-1.5">{p.split("\n").map((l, k) => <span key={k}>{k > 0 && <br />}{l}</span>)}</p>)}
                  </div>
                  <div className="px-3 py-2.5 text-gray-500">
                    {tLang2 && <p className="font-bold mb-1 text-gray-600">{num ? `${num}.- ` : ""}{tLang2}</p>}
                    {textoLang2?.split("\n\n").map((p, j) => <p key={j} className="mb-1.5">{p.split("\n").map((l, k) => <span key={k}>{k > 0 && <br />}{l}</span>)}</p>)}
                  </div>
                </div>
              );
            })}
          </div>}
        </div>}
      </div>

      {/* Nav */}
      <div className="flex justify-between">
        {step > 0 ? <button onClick={() => setStep(s => s - 1)} className="px-5 py-2 text-sm rounded-xl transition" style={{background:"var(--og-surface)",border:"1px solid var(--og-border)",color:"var(--og-secondary)"}}>{t.nav.anterior}</button> : <div />}
        {step < 4 ? <button onClick={() => setStep(s => s + 1)} className="px-5 py-2 text-sm font-medium text-white rounded-xl transition" style={{background:"var(--og-accent)",border:"1px solid var(--og-border-hi)"}}>{t.nav.siguiente}</button>
          : <button onClick={handleGenerate} disabled={generating || !bloques.length}
              className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 rounded-xl shadow-sm transition">
              {generating ? t.preview.generando : t.preview.descargar}
            </button>}
      </div>

      {/* Footer — RDE regla 10 */}
      <footer className="mt-8 pt-4 border-t flex items-center justify-between text-xs" style={{borderTop:"1px solid var(--og-border)",color:"var(--og-muted)"}}>
        <span>Hecho por duendes.app 2026</span>
        <button id="install-btn" onClick={() => window.installApp?.()} className="hidden px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition">
          Instalar App
        </button>
      </footer>
    </div>
  );
}
