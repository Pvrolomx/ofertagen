"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { ensamblarContexto, renderizarBloques } from "@/lib/plantillas/ensamblador";
import PLANTILLA from "@/lib/plantillas/oferta_compra";
import { generarDocxBlob } from "@/lib/docx/generador";
import { generarPdfBlob } from "@/lib/pdf/generador_pdf";

// ============================================================
// DEMO DATA (Dennis Doty → Karin Palutke)
// ============================================================
const DEMO = {partes:{ofertante:{personas:[{nombre:"DENNIS DREISBACH DOTY",genero:"M"}],tipoPersona:"fisica",domicilio:"Calle Paseo del Arque 59, Fraccionamiento Las Ceibas, Ejido Jarretadera, Bahia de Banderas, Nayarit",nacionalidad:"estadounidense",celular:"322 306 8482",email:"claudia@castlesolutions.biz"},propietario:{personas:[{nombre:"KARIN MARGARETE PALUTKE",genero:"F"}],tipoPersona:"fisica",nacionalidad:"canadiense",celular:"322 101 7810",email:"maru@lionsrealestate.properties"}},bloques:{adjudicacion_conyuge:true,ad_corpus:true,escrow:true,inspeccion:true,doc_fideicomiso:true,comision:true,condicion_uso:true,fuerza_mayor:true,factura_complementaria:false,disclosure:false,financiamiento:false,inventario:false,arrendamientos:false,zona_federal:false,litigios_pendientes:false,empleados_condicion:false,obligaciones_vendedor:true,obligaciones_vendedor_agua:false,derecho_deduccion:true,auditoria_hacienda:false,holdback_escrow:false,documentos_integrales:true,proteccion_datos:false,confidencialidad:false,duplicados:true},campos:{inmueble:{descripcion_corta:"Departamento número 43 del Condominio Orquídeas",ubicacion_completa:"en el lote 4-12, dentro del condominio Coto Los Sauces, Condominio Maestro Flamingos Club Residencial, Km 144 carretera Tepic-Puerto Vallarta, Bahía de Banderas, Nayarit",nivel_torre:"tercer nivel de la Torre A",descripcion_interior:"sala, comedor, cocina, cuarto de lavado, terraza, 1 recámara, 1 recámara con balcón, 1 baño, recámara principal con baño",superficie_m2:129.85,superficie_letras:"ciento veintinueve metros ochenta y cinco centímetros",indiviso:"1.6790%"},antecedente:{fecha_escritura:"2018-07-20",numero_escritura:"34,362",notario_anterior:"Lic. Teodoro Ramírez Valenzuela",numero_notaria_anterior:"2",ciudad_notaria_anterior:"Bucerias, Nayarit",libro_rpp:"1406",seccion_rpp:"I",serie_rpp:"A",partida_rpp:"29",cuenta_predial:"U058152"},precio:{precio_total:220000,moneda:"USD",deposito_escrow:22000,dias_deposito:3},escrow:{empresa_escrow:"ARMOUR SECURE ESCROW, S DE RL DE CV"},fechas:{fecha_presentacion:"2023-03-20",ciudad_presentacion:"Bucerias, Nayarit",fecha_vigencia:"2023-03-22",fecha_formalizacion:"cualquier día hábil dentro de las primeras dos semanas del mes de Mayo de 2023",fecha_formalizacion_en:"any business day within the first two weeks of May 2023",fecha_extension:"las primeras dos semanas del mes de Junio 2023",fecha_extension_en:"the first two weeks of June 2023"},notario:{notario_seleccion:"buc_2"},comision:{porcentaje_total:"6%",incluye_iva:true,agencia1_nombre:"Lion's Real Estate Properties",agencia1_porcentaje:"3%",agencia2_nombre:"Pvcastlemx, SAS, de CV",agencia2_porcentaje:"3%"},penalidad:{porcentaje_penalidad:"10%"},jurisdiccion:{ciudad_jurisdiccion:"Bucerias, Nayarit, México"},inspeccion:{dias_inspeccion:4,dias_revision:5}}};

const INIT = {partes:{ofertante:{personas:[{nombre:"",genero:"M"}],tipoPersona:"fisica",domicilio:"",nacionalidad:"",celular:"",email:""},propietario:{personas:[{nombre:"",genero:"F"}],tipoPersona:"fisica",domicilio:"",nacionalidad:"",celular:"",email:""}},bloques:{adjudicacion_conyuge:false,ad_corpus:true,escrow:true,inspeccion:true,doc_fideicomiso:true,comision:true,condicion_uso:true,fuerza_mayor:true,factura_complementaria:false,disclosure:false,financiamiento:false,inventario:false,arrendamientos:false,zona_federal:false,litigios_pendientes:false,empleados_condicion:false,obligaciones_vendedor:true,obligaciones_vendedor_agua:false,derecho_deduccion:true,auditoria_hacienda:false,holdback_escrow:false,documentos_integrales:true,proteccion_datos:false,confidencialidad:false,duplicados:true},campos:{inmueble:{},antecedente:{},precio:{moneda:"USD",precio_total:0,deposito_escrow:0},escrow:{empresa_escrow:"ARMOUR SECURE ESCROW, S DE RL DE CV"},fechas:{ciudad_presentacion:"Bucerias, Nayarit"},notario:{},comision:{porcentaje_total:"6%",incluye_iva:true},penalidad:{porcentaje_penalidad:"10%"},jurisdiccion:{ciudad_jurisdiccion:"Bucerias, Nayarit, México"},inspeccion:{dias_inspeccion:4,dias_revision:5}}};

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
      <h3 className="text-base font-semibold mb-4 pb-2 tracking-wide" style={{color:"var(--og-accent-hi)",borderBottom:"2px solid var(--og-border-hi)",letterSpacing:"0.02em"}}>{title}</h3>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

// Componente para cada condición indispensable con plazos configurables
function CondicionItem({ id, label, sub, checked, onChange, plazos, onPlazoChange, t }) {
  return (
    <div className="rounded-xl transition-all overflow-hidden" style={{background: checked ? "rgba(29,107,184,0.12)" : "var(--og-surface)", border: checked ? "1px solid var(--og-border-hi)" : "1px solid var(--og-border)"}}>
      <div onClick={() => onChange(!checked)} className="flex items-center gap-3 p-3 cursor-pointer">
        <div className="w-10 h-5 rounded-full relative transition-colors flex-shrink-0" style={{background: checked ? "var(--og-accent)" : "var(--og-muted)"}}>
          <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${checked ? "left-5" : "left-0.5"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium" style={{color:"var(--og-primary)"}}>{label}</div>
          {sub && <div className="text-xs text-gray-500">{sub}</div>}
        </div>
        {checked && <span className="text-xs" style={{color:"var(--og-accent)"}}>▼</span>}
      </div>
      {checked && plazos && (
        <div className="px-3 pb-3 pt-2 border-t" style={{borderColor:"var(--og-border)",background:"var(--og-surface)"}}>
          <div className="space-y-3">
            {plazos.map((plazo, idx) => {
              const diasValue = plazo.dias;
              const isOtro = diasValue > 10;
              return (
                <div key={idx} className="space-y-1">
                  <label className="text-xs font-medium block" style={{color:"var(--og-primary)"}}>{plazo.label}</label>
                  <div className="flex items-center gap-2">
                    <select 
                      value={isOtro ? 'otro' : diasValue} 
                      onChange={e => {
                        e.stopPropagation();
                        const val = e.target.value;
                        if (val !== 'otro') {
                          onPlazoChange(plazo.campo + '_dias', parseInt(val));
                        }
                      }}
                      onClick={e => e.stopPropagation()}
                      className="flex-1 px-3 py-2 text-sm border rounded-lg bg-white"
                      style={{borderColor:"var(--og-border)",color:"var(--og-primary)"}}
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'día' : 'días'}</option>
                      ))}
                      <option value="otro">Otro...</option>
                    </select>
                    {isOtro && (
                      <input 
                        type="number" 
                        min="11" 
                        max="90"
                        value={diasValue} 
                        onChange={e => { e.stopPropagation(); onPlazoChange(plazo.campo + '_dias', parseInt(e.target.value) || plazo.default); }}
                        onClick={e => e.stopPropagation()}
                        className="w-16 px-2 py-2 text-sm border rounded-lg text-center bg-white" 
                        style={{borderColor:"var(--og-border)",color:"var(--og-primary)"}}
                      />
                    )}
                    <select 
                      value={plazo.tipo} 
                      onChange={e => { e.stopPropagation(); onPlazoChange(plazo.campo + '_tipo', e.target.value); }}
                      onClick={e => e.stopPropagation()}
                      className="px-3 py-2 text-sm border rounded-lg bg-white"
                      style={{borderColor:"var(--og-border)",color:"var(--og-primary)"}}
                    >
                      <option value="naturales">{t?.naturales || 'naturales'}</option>
                      <option value="habiles">{t?.habiles || 'hábiles'}</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para condición libre con traducción Google Translate
function CondicionLibrePanel({ uiLang, textoEs, textoEn, textoFr, onChangeEs, onChangeEn, onChangeFr, t }) {
  const [traduciendo, setTraduciendo] = useState(false);
  
  // Determinar qué idioma mostrar según la UI
  const textoActual = uiLang === 'es' ? textoEs : uiLang === 'fr' ? textoFr : textoEn;
  const onChangeActual = uiLang === 'es' ? onChangeEs : uiLang === 'fr' ? onChangeFr : onChangeEn;
  const placeholders = {
    es: "Ej: Que el comprador obtenga autorización de remodelación por parte del Consejo de Administración...",
    en: "E.g.: That the buyer obtains remodeling authorization from the Condo Board...",
    fr: "Ex: Que l'acheteur obtienne l'autorisation de rénovation du Conseil d'Administration..."
  };
  const labels = {
    es: "Texto en español",
    en: "Text in English", 
    fr: "Texte en français"
  };
  
  // Traducir usando Google Translate API (gratuita)
  const traducir = async () => {
    if (!textoActual.trim()) return;
    setTraduciendo(true);
    
    try {
      // Determinar idiomas destino
      const sourceLang = uiLang === 'es' ? 'es' : uiLang === 'fr' ? 'fr' : 'en';
      const targetLangs = ['es', 'en', 'fr'].filter(l => l !== sourceLang);
      
      for (const targetLang of targetLangs) {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(textoActual)}`;
        const res = await fetch(url);
        const data = await res.json();
        const traducido = data[0].map(x => x[0]).join('');
        
        if (targetLang === 'es') onChangeEs(traducido);
        else if (targetLang === 'en') onChangeEn(traducido);
        else if (targetLang === 'fr') onChangeFr(traducido);
      }
    } catch (err) {
      console.error('Error traduciendo:', err);
    } finally {
      setTraduciendo(false);
    }
  };
  
  const btnLabel = {
    es: traduciendo ? "Traduciendo..." : "🌐 Traducir a EN/FR",
    en: traduciendo ? "Translating..." : "🌐 Translate to ES/FR",
    fr: traduciendo ? "Traduction..." : "🌐 Traduire en ES/EN"
  };

  return (
    <div className="px-3 pb-3 pt-2 border-t" style={{borderColor:"var(--og-border)",background:"var(--og-surface)"}}>
      <div className="space-y-2">
        <label className="text-xs font-medium block" style={{color:"var(--og-primary)"}}>{labels[uiLang]}</label>
        <textarea 
          value={textoActual} 
          onChange={e => { e.stopPropagation(); onChangeActual(e.target.value); }}
          onClick={e => e.stopPropagation()}
          placeholder={placeholders[uiLang]}
          rows={4}
          className="w-full px-3 py-2 text-sm border rounded-lg resize-y bg-white" 
          style={{borderColor:"var(--og-border)",color:"var(--og-primary)"}}
        />
        <button
          onClick={e => { e.stopPropagation(); traducir(); }}
          disabled={traduciendo || !textoActual.trim()}
          className="w-full px-3 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-50"
          style={{background:"var(--og-accent)",color:"white"}}
        >
          {btnLabel[uiLang]}
        </button>
        {/* Mostrar otros idiomas si tienen contenido */}
        {uiLang !== 'es' && textoEs && (
          <div className="text-xs p-2 rounded" style={{background:"rgba(0,0,0,0.05)"}}>
            <span className="font-medium">ES:</span> {textoEs.substring(0, 100)}{textoEs.length > 100 ? '...' : ''}
          </div>
        )}
        {uiLang !== 'en' && textoEn && (
          <div className="text-xs p-2 rounded" style={{background:"rgba(0,0,0,0.05)"}}>
            <span className="font-medium">EN:</span> {textoEn.substring(0, 100)}{textoEn.length > 100 ? '...' : ''}
          </div>
        )}
        {uiLang !== 'fr' && textoFr && (
          <div className="text-xs p-2 rounded" style={{background:"rgba(0,0,0,0.05)"}}>
            <span className="font-medium">FR:</span> {textoFr.substring(0, 100)}{textoFr.length > 100 ? '...' : ''}
          </div>
        )}
      </div>
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
      coordinador: "Coordinador de cierre",
      clausulas: "Cláusulas opcionales",
      clausulas_adicionales: "Cláusulas adicionales",
      condiciones_indispensables: "Condiciones indispensables",
      condiciones_sub: "Selecciona las condiciones que aplican y configura los plazos",
    },
    condiciones: {
      naturales: "naturales",
      habiles: "hábiles",
      plazo_entregar: "Plazo para entregar",
      plazo_revisar: "Plazo para revisar",
      plazo_inspeccionar: "Plazo para inspeccionar",
      plazo_informar: "Plazo para informar",
      plazo_evaluar: "Plazo para evaluar",
      plazo_aprobacion: "Plazo para aprobación",
      inspeccion: { label: "Inspección física del inmueble", sub: "Inspección profesional y revisión del reporte" },
      doc_fideicomiso: { label: "Documentación de propiedad", sub: "Escritura o fideicomiso, régimen de condominio, actas de asamblea" },
      financiamiento: { label: "Sujeto a financiamiento", sub: "Aprobación de crédito hipotecario" },
      inventario: { label: "Inventario detallado", sub: "Lista de muebles y electrodomésticos incluidos" },
      arrendamientos: { label: "Arrendamientos vigentes", sub: "Contratos de renta existentes" },
      zona_federal: { label: "Zona Federal", sub: "Concesión marítima para propiedades frente al mar" },
      litigios_pendientes: { label: "Litigios pendientes", sub: "Verificación de litigios judiciales o administrativos" },
      empleados_condicion: { label: "Relaciones laborales", sub: "Verificación de empleados y litigios laborales" },
      condicion_libre: { label: "Condición libre", sub: "Permiso de remodelación, autorización de consejo, etc." },
      texto_es: "Texto en español",
      texto_en: "Texto en inglés",
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
      domicilio_inmueble: "Inmueble materia de la presente oferta", label_ofertante: "Ofertante", label_propietario: "Propietario", nacionalidades: [{v:"mexicano", l:"🇲🇽 Mexicano(a)"}, {v:"estadounidense", l:"🇺🇸 Estadounidense"}, {v:"canadiense", l:"🇨🇦 Canadiense"}, {v:"francocanadiense", l:"🇨🇦 Franco-canadiense"}],
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
      formalizacion: "Fecha de formalización",
      extension: "Extensión (si aplica)",
      // Notario
      nombre_notario: "Nombre del notario", no_notaria_dest: "No. notaría",
      ciudad_notaria: "Ciudad",
      // Comisión
      pct_total: "% total", agencia1: "Agencia 1", pct_ag1: "% Ag. 1",
      agencia2: "Agencia 2", pct_ag2: "% Ag. 2",
      // Penalidad
      pct_penalidad: "% penalidad", jurisdiccion: "Jurisdicción",
      jurisdiccion_otro: "Especificar jurisdicción",
      pct_parte_afectada: "% parte afectada", pct_agencia: "% agencia",
      // Coordinador
      nombre_coord: "Nombre", empresa_coord: "Empresa",
      // Financiamiento
      nombre_lender: "Nombre del prestamista / lender",
      dias_due_diligence: "Días due diligence del lender",
      // Inventario
      exclusiones_es: "Exclusiones (ES)", exclusiones_en: "Exclusiones (EN)",
      "moneda": "Moneda",
      "anticipo_gastos": "Anticipo gastos de escrituración",
      "empresa_escrow_label": "Empresa escrow",
      "notario_label": "Notario",
      "iva": "+ IVA 16%",
      "distribuir_penalidad": "Distribuir penalidad con agencia",
      "incluir_testigos": "Incluir líneas de testigos",
      "lugar_aceptacion": "Lugar, fecha y hora de aceptación",
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
      condiciones_indispensables: "Condiciones indispensables",
      condiciones_sub: "Selecciona las condiciones que aplican y configura los plazos",
    },
    condiciones: {
      naturales: "naturales",
      habiles: "hábiles",
      plazo_entregar: "Plazo para entregar",
      plazo_revisar: "Plazo para revisar",
      plazo_inspeccionar: "Plazo para inspeccionar",
      plazo_informar: "Plazo para informar",
      plazo_evaluar: "Plazo para evaluar",
      plazo_aprobacion: "Plazo para aprobación",
      inspeccion: { label: "Inspección física del inmueble", sub: "Inspección profesional y revisión del reporte" },
      doc_fideicomiso: { label: "Documentación de propiedad", sub: "Escritura o fideicomiso, régimen de condominio, actas de asamblea" },
      financiamiento: { label: "Sujeto a financiamiento", sub: "Aprobación de crédito hipotecario" },
      inventario: { label: "Inventario detallado", sub: "Lista de muebles y electrodomésticos incluidos" },
      arrendamientos: { label: "Arrendamientos vigentes", sub: "Contratos de renta existentes" },
      zona_federal: { label: "Zona Federal", sub: "Concesión marítima para propiedades frente al mar" },
      litigios_pendientes: { label: "Litigios pendientes", sub: "Verificación de litigios judiciales o administrativos" },
      empleados_condicion: { label: "Relaciones laborales", sub: "Verificación de empleados y litigios laborales" },
      condicion_libre: { label: "Condición libre", sub: "Permiso de remodelación, autorización de consejo, etc." },
      texto_es: "Texto en español",
      texto_en: "Texto en inglés",
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
      nacionalidades: [{v:"mexicano", l:"🇲🇽 Mexicano(a)"},{v:"estadounidense", l:"🇺🇸 Estadounidense"},{v:"canadiense", l:"🇨🇦 Canadiense"},{v:"francocanadiense", l:"🇨🇦 Franco-canadiense"}],
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
      formalizacion: "Fecha de formalización",
      extension: "Extensión (si aplica)",
      nombre_notario: "Nombre del notario", no_notaria_dest: "No. notaría",
      ciudad_notaria: "Ciudad",
      pct_total: "% total", agencia1: "Agencia 1", pct_ag1: "% Ag. 1",
      agencia2: "Agencia 2", pct_ag2: "% Ag. 2",
      pct_penalidad: "% penalidad", jurisdiccion: "Jurisdicción",
      jurisdiccion_otro: "Especificar jurisdicción",
      pct_parte_afectada: "% parte afectada", pct_agencia: "% agencia",
      nombre_coord: "Nombre", empresa_coord: "Empresa",
      nombre_lender: "Nombre del prestamista / lender",
      dias_due_diligence: "Días due diligence del lender",
      exclusiones_es: "Exclusiones (ES)", exclusiones_en: "Exclusiones (EN)",
      "moneda": "Moneda",
      "anticipo_gastos": "Anticipo gastos de escrituración",
      "empresa_escrow_label": "Empresa escrow",
      "notario_label": "Notario",
      "iva": "+ IVA 16%",
      "distribuir_penalidad": "Distribuir penalidad con agencia",
      "incluir_testigos": "Incluir líneas de testigos",
      "lugar_aceptacion": "Lugar, fecha y hora de aceptación",
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
      condiciones_indispensables: "Indispensable conditions",
      condiciones_sub: "Select applicable conditions and configure deadlines",
    },
    condiciones: {
      naturales: "calendar",
      habiles: "business",
      plazo_entregar: "Deadline to deliver",
      plazo_revisar: "Deadline to review",
      plazo_inspeccionar: "Deadline to inspect",
      plazo_informar: "Deadline to inform",
      plazo_evaluar: "Deadline to evaluate",
      plazo_aprobacion: "Deadline for approval",
      inspeccion: { label: "Physical property inspection", sub: "Professional inspection and report review" },
      doc_fideicomiso: { label: "Property documentation", sub: "Deed or trust, condo regime, assembly minutes" },
      financiamiento: { label: "Subject to financing", sub: "Mortgage approval" },
      inventario: { label: "Detailed inventory", sub: "List of included furniture and appliances" },
      arrendamientos: { label: "Existing leases", sub: "Current rental agreements" },
      zona_federal: { label: "Federal Zone", sub: "Maritime concession for beachfront properties" },
      litigios_pendientes: { label: "Pending litigation", sub: "Verification of legal or administrative disputes" },
      empleados_condicion: { label: "Labor relations", sub: "Employee and labor dispute verification" },
      condicion_libre: { label: "Custom condition", sub: "Remodeling permit, board authorization, etc." },
      texto_es: "Text in Spanish",
      texto_en: "Text in English",
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
      domicilio_inmueble: "Property subject matter of this offer", label_ofertante: "Buyer", label_propietario: "Owner", nacionalidades: [{v:"mexicano", l:"🇲🇽 Mexican"}, {v:"estadounidense", l:"🇺🇸 American"}, {v:"canadiense", l:"🇨🇦 Canadian"}, {v:"francocanadiense", l:"🇨🇦 Franco-Canadian"}],
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
      formalizacion: "Closing date",
      extension: "Extension (if applicable)",
      nombre_notario: "Notary name", no_notaria_dest: "Notary no.",
      ciudad_notaria: "City",
      pct_total: "Total %", agencia1: "Agency 1", pct_ag1: "% Ag. 1",
      agencia2: "Agency 2", pct_ag2: "% Ag. 2",
      pct_penalidad: "Penalty %", jurisdiccion: "Jurisdiction",
      jurisdiccion_otro: "Specify jurisdiction",
      pct_parte_afectada: "% injured party", pct_agencia: "% agency",
      nombre_coord: "Name", empresa_coord: "Company",
      nombre_lender: "Lender name",
      dias_due_diligence: "Lender due diligence days",
      exclusiones_es: "Exclusions (ES)", exclusiones_en: "Exclusions (EN)",
      "moneda": "Currency",
      "anticipo_gastos": "Closing cost advance",
      "empresa_escrow_label": "Escrow company",
      "notario_label": "Notary",
      "iva": "+ VAT 16%",
      "distribuir_penalidad": "Distribute penalty with agency",
      "incluir_testigos": "Include witness lines",
      "lugar_aceptacion": "Place, date and time of acceptance",
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
      condiciones_indispensables: "Conditions indispensables",
      condiciones_sub: "Sélectionnez les conditions applicables et configurez les délais",
    },
    condiciones: {
      naturales: "calendaires",
      habiles: "ouvrables",
      plazo_entregar: "Délai pour livrer",
      plazo_revisar: "Délai pour réviser",
      plazo_inspeccionar: "Délai pour inspecter",
      plazo_informar: "Délai pour informer",
      plazo_evaluar: "Délai pour évaluer",
      plazo_aprobacion: "Délai pour approbation",
      inspeccion: { label: "Inspection physique du bien", sub: "Inspection professionnelle et révision du rapport" },
      doc_fideicomiso: { label: "Documentation de propriété", sub: "Acte ou fidéicommis, régime de copropriété, procès-verbaux" },
      financiamiento: { label: "Sous réserve de financement", sub: "Approbation hypothécaire" },
      inventario: { label: "Inventaire détaillé", sub: "Liste des meubles et appareils inclus" },
      arrendamientos: { label: "Baux en cours", sub: "Contrats de location existants" },
      zona_federal: { label: "Zone fédérale", sub: "Concession maritime pour propriétés en bord de mer" },
      litigios_pendientes: { label: "Litiges en cours", sub: "Vérification des litiges juridiques ou administratifs" },
      empleados_condicion: { label: "Relations de travail", sub: "Vérification des employés et litiges du travail" },
      condicion_libre: { label: "Condition libre", sub: "Permis de rénovation, autorisation du conseil, etc." },
      texto_es: "Texte en espagnol",
      texto_en: "Texte en anglais",
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
      domicilio_inmueble: "Bien immobilier objet de la présente offre", label_ofertante: "Offrant", label_propietario: "Propriétaire", nacionalidades: [{v:"mexicano", l:"🇲🇽 Mexicain(e)"}, {v:"estadounidense", l:"🇺🇸 Américain(e)"}, {v:"canadiense", l:"🇨🇦 Canadien(ne)"}, {v:"francocanadiense", l:"🇨🇦 Franco-canadien(ne)"}],
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
      formalizacion: "Date de clôture",
      extension: "Extension (le cas échéant)",
      nombre_notario: "Nom du notaire", no_notaria_dest: "No. étude",
      ciudad_notaria: "Ville",
      pct_total: "% total", agencia1: "Agence 1", pct_ag1: "% Ag. 1",
      agencia2: "Agence 2", pct_ag2: "% Ag. 2",
      pct_penalidad: "% pénalité", jurisdiccion: "Juridiction",
      jurisdiccion_otro: "Préciser la juridiction",
      pct_parte_afectada: "% partie lésée", pct_agencia: "% agence",
      nombre_coord: "Nom", empresa_coord: "Entreprise",
      nombre_lender: "Nom du prêteur",
      dias_due_diligence: "Jours due diligence prêteur",
      exclusiones_es: "Exclusions (ES)", exclusiones_en: "Exclusions (EN)",
      "moneda": "Devise",
      "anticipo_gastos": "Avance frais de clôture",
      "empresa_escrow_label": "Société de séquestre",
      "notario_label": "Notaire",
      "iva": "+ TVA 16%",
      "distribuir_penalidad": "Répartir la pénalité avec l'agence",
      "incluir_testigos": "Inclure les lignes de témoins",
      "lugar_aceptacion": "Lieu, date et heure d'acceptation",
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
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [pendingDownload, setPendingDownload] = useState(null); // 'word' | 'pdf' | null
  const t = UI[idiomaSecundario] || UI.es; // i18n activo Sprint V-a
  const lang2 = contractLang; // idioma secundario del contrato — independiente de la UI
  const steps = t.steps;

  // Cargar estado de disclaimer desde localStorage
  useEffect(() => {
    try {
      const accepted = localStorage.getItem("ofertagen_disclaimer_accepted");
      if (accepted) setDisclaimerAccepted(true);
    } catch {}
  }, []);

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

  // Función interna para generar Word (después de aceptar disclaimer)
  const doGenerateWord = useCallback(async () => {
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
  }, [bloques, data.partes.ofertante.personas, logoBase64, lang2]);

  // Función interna para generar PDF (después de aceptar disclaimer)
  const doGeneratePdf = useCallback(async () => {
    setGenerating(true);
    try {
      await generarPdfBlob(bloques, PLANTILLA.meta, { 
        idiomaSecundario: lang2,
        logoBase64,
        nombre: data.partes.ofertante.personas[0]?.nombre?.replace(/\s+/g, "_") || "OFERTA"
      });
    } catch (err) {
      console.error("Error generando PDF:", err);
      alert("Error al generar el PDF. Revisa la consola.");
    }
    setGenerating(false);
  }, [bloques, data.partes.ofertante.personas, lang2, logoBase64]);

  const handleGenerate = useCallback(async () => {
    if (!bloques.length) return;
    const result = validarOferta(bloques, lang2);
    if (!result.valid || result.warnings.length > 0) {
      setValidationResult(result);
      return;
    }
    // Si no ha aceptado disclaimer, mostrar modal
    if (!disclaimerAccepted) {
      setPendingDownload('word');
      setShowDisclaimer(true);
      return;
    }
    await doGenerateWord();
  }, [bloques, lang2, disclaimerAccepted, doGenerateWord, validarOferta]);

  const handleGeneratePdf = useCallback(async () => {
    if (!bloques.length) return;
    const result = validarOferta(bloques, lang2);
    if (!result.valid || result.warnings.length > 0) {
      setValidationResult(result);
      return;
    }
    // Si no ha aceptado disclaimer, mostrar modal
    if (!disclaimerAccepted) {
      setPendingDownload('pdf');
      setShowDisclaimer(true);
      return;
    }
    await doGeneratePdf();
  }, [bloques, lang2, disclaimerAccepted, doGeneratePdf, validarOferta]);

  // Manejar aceptación del disclaimer
  const handleAcceptDisclaimer = useCallback(async () => {
    setDisclaimerAccepted(true);
    setShowDisclaimer(false);
    try {
      localStorage.setItem("ofertagen_disclaimer_accepted", new Date().toISOString());
    } catch {}
    // Ejecutar descarga pendiente
    if (pendingDownload === 'word') {
      await doGenerateWord();
    } else if (pendingDownload === 'pdf') {
      await doGeneratePdf();
    }
    setPendingDownload(null);
  }, [pendingDownload, doGenerateWord, doGeneratePdf]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6" style={{minHeight:"100vh",background:"var(--og-bg)"}}>
      {/* Modal de Disclaimer */}
      {showDisclaimer && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{background:"rgba(0,0,0,0.8)"}}>
          <div className="rounded-2xl shadow-2xl max-w-lg w-full p-6" style={{background:"var(--og-card)",border:"1px solid var(--og-border)"}}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{color:"var(--og-primary)"}}>
              <span>⚠️</span> {idiomaSecundario === 'es' ? 'Antes de descargar' : idiomaSecundario === 'fr' ? 'Avant de télécharger' : 'Before downloading'}
            </h2>
            <div className="text-sm mb-5 space-y-3" style={{color:"var(--og-secondary)"}}>
              <p>
                {idiomaSecundario === 'es' 
                  ? 'OfertaGen genera documentos basados en plantillas inmobiliarias para zona restringida mexicana.'
                  : idiomaSecundario === 'fr'
                  ? 'OfertaGen génère des documents basés sur des modèles immobiliers pour la zone restreinte mexicaine.'
                  : 'OfertaGen generates documents based on real estate templates for Mexican restricted zone.'}
              </p>
              <ul className="space-y-2 pl-4">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  {idiomaSecundario === 'es' 
                    ? 'No sustituye asesoría legal personalizada'
                    : idiomaSecundario === 'fr'
                    ? 'Ne remplace pas un conseil juridique personnalisé'
                    : 'Does not substitute personalized legal advice'}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  {idiomaSecundario === 'es' 
                    ? 'Debe ser revisado por un abogado antes de firmar'
                    : idiomaSecundario === 'fr'
                    ? 'Doit être révisé par un avocat avant de signer'
                    : 'Must be reviewed by a lawyer before signing'}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  {idiomaSecundario === 'es' 
                    ? 'El desarrollador no asume responsabilidad por uso sin revisión profesional'
                    : idiomaSecundario === 'fr'
                    ? 'Le développeur n\'assume aucune responsabilité en cas d\'utilisation sans révision professionnelle'
                    : 'The developer assumes no responsibility for use without professional review'}
                </li>
              </ul>
            </div>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => { setShowDisclaimer(false); setPendingDownload(null); }}
                className="px-4 py-2 text-sm rounded-lg transition"
                style={{background:"var(--og-surface)",border:"1px solid var(--og-border)",color:"var(--og-secondary)"}}>
                {idiomaSecundario === 'es' ? 'Cancelar' : idiomaSecundario === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button 
                onClick={handleAcceptDisclaimer}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition"
                style={{background:"var(--og-accent)"}}>
                {idiomaSecundario === 'es' ? 'Entiendo, descargar' : idiomaSecundario === 'fr' ? 'Je comprends, télécharger' : 'I understand, download'}
              </button>
            </div>
          </div>
        </div>
      )}

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
          <p className="text-sm" style={{color:"var(--og-secondary)"}}>Genera oferta trilingüe ES/EN/FR</p>
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
            <Input label={t.fields.clave_catastral} value={data.campos.inmueble?.clave_catastral} onChange={v=>upCampo("inmueble","clave_catastral",v)} placeholder="020-024-01-039-258-000" />
          </Section>
        </>}

        {step === 2 && <>
          <Section title={t.sections.precio}>
            <Input label={t.fields.precio_total} value={data.campos.precio?.precio_total} onChange={v=>upCampo("precio","precio_total",v)} type="number" required />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{color:"var(--og-secondary)"}}>{t.fields.moneda}</label>
              <select value={data.campos.precio?.moneda||"USD"} onChange={e=>upCampo("precio","moneda",e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="USD">USD</option><option value="MXN">MXN</option>
              </select>
            </div>
            <Input label={t.fields.deposito_escrow} value={data.campos.precio?.deposito_escrow} onChange={v=>upCampo("precio","deposito_escrow",v)} type="number" />
            <Input label={t.fields.dias_depositar} value={data.campos.precio?.dias_deposito||3} onChange={v=>upCampo("precio","dias_deposito",v)} type="number" />
            <Input label={t.fields.dias_saldo} value={data.campos.precio?.dias_saldo||5} onChange={v=>upCampo("precio","dias_saldo",v)} type="number" />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{color:"var(--og-secondary)"}}>{t.fields.anticipo_gastos}</label>
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
              <label className="text-xs font-medium" style={{color:"var(--og-secondary)"}}>{t.fields.empresa_escrow_label}</label>
              <select value={data.campos.escrow?.empresa_escrow||"ARMOUR SECURE ESCROW, S DE RL DE CV"} onChange={e=>{upCampo("escrow","empresa_escrow",e.target.value); if(e.target.value!=="otro_escrow") upCampo("escrow","empresa_escrow_manual","")}} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="ARMOUR SECURE ESCROW, S DE RL DE CV">Armour Secure Escrow, S de RL de CV</option>
                <option value="SECURE TITLE LATIN AMERICA INC">Secure Title Latin America Inc</option>
                <option value="TLA LLC">TLA LLC</option>
                <option value="otro_escrow">Otra empresa (captura manual)</option>
              </select>
              {data.campos.escrow?.empresa_escrow === "otro_escrow" && (
                <input type="text" placeholder="Nombre de la empresa escrow"
                  value={data.campos.escrow?.empresa_escrow_manual||""}
                  onChange={e=>upCampo("escrow","empresa_escrow_manual",e.target.value)}
                  className="mt-2 w-full rounded-lg px-3 py-2 text-sm" style={{background:"var(--og-surface)",border:"1px solid var(--og-border-hi)",color:"var(--og-primary)"}} />
              )}
            </div>
            <Input label={t.fields.honorarios_escrow} value={data.campos.escrow?.honorarios_escrow||750} onChange={v=>upCampo("escrow","honorarios_escrow",v)} type="number" />
          </Section>
          <Section title={t.sections.fechas}>
            <Input label={t.fields.fecha_presentacion} value={data.campos.fechas?.fecha_presentacion} onChange={v=>upCampo("fechas","fecha_presentacion",v)} type="date" required />
            <Input label={t.fields.ciudad} value={data.campos.fechas?.ciudad_presentacion} onChange={v=>upCampo("fechas","ciudad_presentacion",v)} required />
            <Input label={t.fields.fecha_vigencia} value={data.campos.fechas?.fecha_vigencia} onChange={v=>upCampo("fechas","fecha_vigencia",v)} type="date" required />
            <Input label={t.fields.hora_vigencia} value={data.campos.fechas?.hora_vigencia||"medianoche"} onChange={v=>upCampo("fechas","hora_vigencia",v)} placeholder="medianoche, 17:00 horas..." />
            <Input label={t.fields.formalizacion} value={data.campos.fechas?.fecha_formalizacion} onChange={v=>upCampo("fechas","fecha_formalizacion",v)} wide placeholder="cualquier día hábil dentro de las primeras dos semanas del mes de Mayo de 2023" />
            <Input label={t.fields.extension} value={data.campos.fechas?.fecha_extension} onChange={v=>upCampo("fechas","fecha_extension",v)} wide placeholder="las primeras dos semanas del mes de Junio 2023" />
          </Section>
          <Section title={t.sections.notario}>
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-xs font-medium" style={{color:"var(--og-secondary)"}}>{t.fields.notario_label} <span style={{color:"var(--og-danger)"}}>*</span></label>
              <select value={data.campos.notario?.notario_seleccion||""} onChange={e=>upCampo("notario","notario_seleccion",e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="">— Seleccionar notario —</option>
                <optgroup label="Puerto Vallarta, Jalisco">
                  <option value="pv_1">Notaría 1 — Lic. Fernando Castro Rubio</option>
                  <option value="pv_2">Notaría 2 — Lic. Juan Alberto Romero García Castellanos</option>
                  <option value="pv_3">Notaría 3 — Lic. Francisco José Ruiz Higuera</option>
                  <option value="pv_5">Notaría 5 — Lic. Karla Lizeth Plascencia Vázquez</option>
                  <option value="pv_6">Notaría 6 — Lic. Sergio Odilón Ramírez Brambila</option>
                  <option value="pv_7">Notaría 7 — Lic. Eduardo Sánchez Acosta</option>
                  <option value="pv_8">Notaría 8 — Lic. José de Jesús Ruiz Higuera</option>
                  <option value="pv_9">Notaría 9 — Lic. Enrique Torres Jacobo</option>
                  <option value="pv_10">Notaría 10 — Lic. Fabiola Estela Prado Medina</option>
                </optgroup>
                <optgroup label="Mascota, Jalisco">
                  <option value="mas_1">Notaría 1 — Lic. Luis Alberto González Valdés</option>
                </optgroup>
                <optgroup label="Bucerías, Nayarit">
                  <option value="buc_2">Notaría 2 — Lic. Teodoro Ramírez Valenzuela</option>
                  <option value="buc_19">Notaría 19 — Lic. Luis Miguel Castro Montero</option>
                  <option value="buc_29">Notaría 29 — Lic. Adán Meza Barajas</option>
                  <option value="buc_31">Notaría 31 — Lic. José Luis Reyes Vázquez</option>
                </optgroup>
                <optgroup label="Nuevo Vallarta, Nayarit">
                  <option value="nv_4">Notaría 4 — Lic. Jorge Rogelio Careaga Pérez</option>
                  <option value="nv_10">Notaría 10 — Lic. Guillermo Loza Ramírez</option>
                  <option value="nv_33">Notaría 33 — Lic. Jorge Armando Bañuelos Chan</option>
                </optgroup>
                <optgroup label="Tepic, Nayarit">
                  <option value="tep_8">Notaría 8 — Lic. Héctor Eduardo Velázquez Gutiérrez</option>
                  <option value="tep_42">Notaría 42 — Lic. Héctor Manuel Benítez Pineda</option>
                </optgroup>
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
              <label className="text-xs" style={{color:"var(--og-secondary)"}}>{t.fields.iva}</label>
            </div>
            <Input label={t.fields.agencia1} value={data.campos.comision?.agencia1_nombre} onChange={v=>upCampo("comision","agencia1_nombre",v)} />
            <Input label={t.fields.pct_ag1} value={data.campos.comision?.agencia1_porcentaje} onChange={v=>upCampo("comision","agencia1_porcentaje",v)} />
            <Input label={t.fields.agencia2} value={data.campos.comision?.agencia2_nombre} onChange={v=>upCampo("comision","agencia2_nombre",v)} />
            <Input label={t.fields.pct_ag2} value={data.campos.comision?.agencia2_porcentaje} onChange={v=>upCampo("comision","agencia2_porcentaje",v)} />
          </Section>
          <Section title={t.sections.penalidad}>
            <Input label={t.fields.pct_penalidad} value={data.campos.penalidad?.porcentaje_penalidad} onChange={v=>upCampo("penalidad","porcentaje_penalidad",v)} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{color:"var(--og-secondary)"}}>{t.fields.jurisdiccion}</label>
              <select value={data.campos.jurisdiccion?.ciudad_jurisdiccion||""} onChange={e=>upCampo("jurisdiccion","ciudad_jurisdiccion",e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="">— Seleccionar —</option>
                <option value="Puerto Vallarta, Jalisco, México">Puerto Vallarta, Jalisco</option>
                <option value="Bucerías, Nayarit, México">Bucerías, Nayarit</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            {data.campos.jurisdiccion?.ciudad_jurisdiccion === "otro" && (
              <Input label={t.fields.jurisdiccion_otro || "Especificar jurisdicción"} value={data.campos.jurisdiccion?.ciudad_jurisdiccion_custom} onChange={v=>upCampo("jurisdiccion","ciudad_jurisdiccion_custom",v)} placeholder="Ciudad, Estado, México" />
            )}
            <div className="col-span-2 flex items-center gap-3 p-3 rounded-lg" style={{background:"var(--og-surface)",border:"1px solid var(--og-border)"}}>
              <input type="checkbox" checked={!!data.campos.penalidad?.distribuir_agencia} onChange={e=>upCampo("penalidad","distribuir_agencia",e.target.checked)} className="rounded" />
              <div>
                <label className="text-sm font-medium" style={{color:"var(--og-primary)"}}>{t.fields.distribuir_penalidad}</label>
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
                <label className="text-sm font-medium" style={{color:"var(--og-primary)"}}>{t.fields.incluir_testigos}</label>
                <p className="text-xs" style={{color:"var(--og-secondary)"}}>Testigo 1 y Testigo 2 en la página de firma</p>
              </div>
            </div>
            <div className="col-span-2 flex items-center gap-3 p-3 rounded-lg" style={{background:"var(--og-surface)",border:"1px solid var(--og-border)"}}>
              <input type="checkbox" checked={data.campos.testigos?.incluir_aceptacion!==false} onChange={e=>upCampo("testigos","incluir_aceptacion",e.target.checked)} className="rounded" />
              <div>
                <label className="text-sm font-medium" style={{color:"var(--og-primary)"}}>{t.fields.lugar_aceptacion}</label>
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
          {/* CONDICIONES INDISPENSABLES */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-1" style={{color:"var(--og-primary)"}}>{t.sections.condiciones_indispensables}</h2>
            <p className="text-xs text-gray-500 mb-4">{t.sections.condiciones_sub}</p>
            <div className="space-y-2">
              <CondicionItem 
                id="inspeccion"
                label={t.condiciones?.inspeccion?.label || "Inspección física del inmueble"}
                sub={t.condiciones?.inspeccion?.sub || "Inspección profesional y revisión del reporte"}
                checked={data.bloques.inspeccion}
                onChange={() => togBloque("inspeccion")}
                plazos={[
                  { label: t.condiciones?.plazo_inspeccionar || "Plazo para inspeccionar", campo: "inspeccion_inspeccionar", dias: data.campos.condiciones_plazos?.inspeccion_inspeccionar_dias || 4, tipo: data.campos.condiciones_plazos?.inspeccion_inspeccionar_tipo || "naturales", default: 4 },
                  { label: t.condiciones?.plazo_revisar || "Plazo para revisar", campo: "inspeccion_revisar", dias: data.campos.condiciones_plazos?.inspeccion_revisar_dias || 5, tipo: data.campos.condiciones_plazos?.inspeccion_revisar_tipo || "naturales", default: 5 },
                ]}
                onPlazoChange={(campo, valor) => upCampo("condiciones_plazos", campo, valor)}
                t={t.condiciones}
              />
              <CondicionItem 
                id="doc_fideicomiso"
                label={t.condiciones?.doc_fideicomiso?.label || "Documentación de propiedad"}
                sub={t.condiciones?.doc_fideicomiso?.sub || "Escritura, régimen de condominio, actas de asamblea"}
                checked={data.bloques.doc_fideicomiso}
                onChange={() => togBloque("doc_fideicomiso")}
                plazos={[
                  { label: t.condiciones?.plazo_entregar || "Plazo para entregar", campo: "doc_fideicomiso_entregar", dias: data.campos.condiciones_plazos?.doc_fideicomiso_entregar_dias || 5, tipo: data.campos.condiciones_plazos?.doc_fideicomiso_entregar_tipo || "habiles", default: 5 },
                  { label: t.condiciones?.plazo_revisar || "Plazo para revisar", campo: "doc_fideicomiso_revisar", dias: data.campos.condiciones_plazos?.doc_fideicomiso_revisar_dias || 10, tipo: data.campos.condiciones_plazos?.doc_fideicomiso_revisar_tipo || "naturales", default: 10 },
                ]}
                onPlazoChange={(campo, valor) => upCampo("condiciones_plazos", campo, valor)}
                t={t.condiciones}
              />
              <CondicionItem 
                id="financiamiento"
                label={t.condiciones?.financiamiento?.label || "Sujeto a financiamiento"}
                sub={t.condiciones?.financiamiento?.sub || "Aprobación de crédito hipotecario"}
                checked={data.bloques.financiamiento}
                onChange={() => togBloque("financiamiento")}
                plazos={[
                  { label: t.condiciones?.plazo_aprobacion || "Plazo para aprobación", campo: "financiamiento_aprobacion", dias: data.campos.condiciones_plazos?.financiamiento_aprobacion_dias || 30, tipo: data.campos.condiciones_plazos?.financiamiento_aprobacion_tipo || "naturales", default: 30 },
                ]}
                onPlazoChange={(campo, valor) => upCampo("condiciones_plazos", campo, valor)}
                t={t.condiciones}
              />
              <CondicionItem 
                id="inventario"
                label={t.condiciones?.inventario?.label || "Inventario detallado"}
                sub={t.condiciones?.inventario?.sub || "Lista de muebles y electrodomésticos incluidos"}
                checked={data.bloques.inventario}
                onChange={() => togBloque("inventario")}
                plazos={[
                  { label: t.condiciones?.plazo_entregar || "Plazo para entregar", campo: "inventario_entregar", dias: data.campos.condiciones_plazos?.inventario_entregar_dias || 5, tipo: data.campos.condiciones_plazos?.inventario_entregar_tipo || "habiles", default: 5 },
                  { label: t.condiciones?.plazo_revisar || "Plazo para revisar", campo: "inventario_revisar", dias: data.campos.condiciones_plazos?.inventario_revisar_dias || 5, tipo: data.campos.condiciones_plazos?.inventario_revisar_tipo || "naturales", default: 5 },
                ]}
                onPlazoChange={(campo, valor) => upCampo("condiciones_plazos", campo, valor)}
                t={t.condiciones}
              />
              <CondicionItem 
                id="arrendamientos"
                label={t.condiciones?.arrendamientos?.label || "Arrendamientos vigentes"}
                sub={t.condiciones?.arrendamientos?.sub || "Contratos de renta existentes"}
                checked={data.bloques.arrendamientos}
                onChange={() => togBloque("arrendamientos")}
                plazos={[
                  { label: t.condiciones?.plazo_informar || "Plazo para informar", campo: "arrendamientos_informar", dias: data.campos.condiciones_plazos?.arrendamientos_informar_dias || 5, tipo: data.campos.condiciones_plazos?.arrendamientos_informar_tipo || "habiles", default: 5 },
                  { label: t.condiciones?.plazo_revisar || "Plazo para revisar", campo: "arrendamientos_revisar", dias: data.campos.condiciones_plazos?.arrendamientos_revisar_dias || 5, tipo: data.campos.condiciones_plazos?.arrendamientos_revisar_tipo || "naturales", default: 5 },
                ]}
                onPlazoChange={(campo, valor) => upCampo("condiciones_plazos", campo, valor)}
                t={t.condiciones}
              />
              <CondicionItem 
                id="zona_federal"
                label={t.condiciones?.zona_federal?.label || "Zona Federal"}
                sub={t.condiciones?.zona_federal?.sub || "Concesión marítima para propiedades frente al mar"}
                checked={data.bloques.zona_federal}
                onChange={() => togBloque("zona_federal")}
                plazos={[
                  { label: t.condiciones?.plazo_entregar || "Plazo para entregar", campo: "zona_federal_entregar", dias: data.campos.condiciones_plazos?.zona_federal_entregar_dias || 5, tipo: data.campos.condiciones_plazos?.zona_federal_entregar_tipo || "habiles", default: 5 },
                  { label: t.condiciones?.plazo_revisar || "Plazo para revisar", campo: "zona_federal_revisar", dias: data.campos.condiciones_plazos?.zona_federal_revisar_dias || 5, tipo: data.campos.condiciones_plazos?.zona_federal_revisar_tipo || "naturales", default: 5 },
                ]}
                onPlazoChange={(campo, valor) => upCampo("condiciones_plazos", campo, valor)}
                t={t.condiciones}
              />
              <CondicionItem 
                id="litigios_pendientes"
                label={t.condiciones?.litigios_pendientes?.label || "Litigios pendientes"}
                sub={t.condiciones?.litigios_pendientes?.sub || "Verificación de litigios judiciales o administrativos"}
                checked={data.bloques.litigios_pendientes}
                onChange={() => togBloque("litigios_pendientes")}
                plazos={[
                  { label: t.condiciones?.plazo_informar || "Plazo para informar", campo: "litigios_informar", dias: data.campos.condiciones_plazos?.litigios_informar_dias || 3, tipo: data.campos.condiciones_plazos?.litigios_informar_tipo || "habiles", default: 3 },
                  { label: t.condiciones?.plazo_evaluar || "Plazo para evaluar", campo: "litigios_evaluar", dias: data.campos.condiciones_plazos?.litigios_evaluar_dias || 5, tipo: data.campos.condiciones_plazos?.litigios_evaluar_tipo || "naturales", default: 5 },
                ]}
                onPlazoChange={(campo, valor) => upCampo("condiciones_plazos", campo, valor)}
                t={t.condiciones}
              />
              <CondicionItem 
                id="empleados_condicion"
                label={t.condiciones?.empleados_condicion?.label || "Relaciones laborales"}
                sub={t.condiciones?.empleados_condicion?.sub || "Verificación de empleados y litigios laborales"}
                checked={data.bloques.empleados_condicion}
                onChange={() => togBloque("empleados_condicion")}
                plazos={[
                  { label: t.condiciones?.plazo_informar || "Plazo para informar", campo: "empleados_informar", dias: data.campos.condiciones_plazos?.empleados_informar_dias || 3, tipo: data.campos.condiciones_plazos?.empleados_informar_tipo || "habiles", default: 3 },
                  { label: t.condiciones?.plazo_evaluar || "Plazo para evaluar", campo: "empleados_evaluar", dias: data.campos.condiciones_plazos?.empleados_evaluar_dias || 5, tipo: data.campos.condiciones_plazos?.empleados_evaluar_tipo || "naturales", default: 5 },
                ]}
                onPlazoChange={(campo, valor) => upCampo("condiciones_plazos", campo, valor)}
                t={t.condiciones}
              />
              {/* CONDICIÓN LIBRE */}
              <div className="rounded-xl transition-all overflow-hidden" style={{background: data.bloques.condicion_libre ? "rgba(29,107,184,0.12)" : "var(--og-surface)", border: data.bloques.condicion_libre ? "1px solid var(--og-border-hi)" : "1px solid var(--og-border)"}}>
                <div onClick={() => togBloque("condicion_libre")} className="flex items-center gap-3 p-3 cursor-pointer">
                  <div className="w-10 h-5 rounded-full relative transition-colors flex-shrink-0" style={{background: data.bloques.condicion_libre ? "var(--og-accent)" : "var(--og-muted)"}}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${data.bloques.condicion_libre ? "left-5" : "left-0.5"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{color:"var(--og-primary)"}}>{t.condiciones?.condicion_libre?.label || "Condición libre"}</div>
                    <div className="text-xs text-gray-500">{t.condiciones?.condicion_libre?.sub || "Permiso de remodelación, autorización de consejo, etc."}</div>
                  </div>
                  {data.bloques.condicion_libre && <span className="text-xs" style={{color:"var(--og-accent)"}}>▼</span>}
                </div>
                {data.bloques.condicion_libre && (
                  <CondicionLibrePanel 
                    uiLang={idiomaSecundario}
                    textoEs={data.campos.condicion_libre?.texto_es || ""}
                    textoEn={data.campos.condicion_libre?.texto_en || ""}
                    textoFr={data.campos.condicion_libre?.texto_fr || ""}
                    onChangeEs={v => upCampo("condicion_libre", "texto_es", v)}
                    onChangeEn={v => upCampo("condicion_libre", "texto_en", v)}
                    onChangeFr={v => upCampo("condicion_libre", "texto_fr", v)}
                    t={t.condiciones}
                  />
                )}
              </div>
            </div>
          </div>

          {/* OTRAS CLÁUSULAS */}
          <h2 className="text-lg font-semibold mb-1" style={{color:"var(--og-primary)"}}>{t.sections.clausulas}</h2>
          <p className="text-xs text-gray-500 mb-4">Activa o desactiva sin romper el contrato.</p>
          <Toggle label="Adjudicación de cónyuge" sub="50% derechos fideicomisarios del esposo fallecido" checked={data.bloques.adjudicacion_conyuge} onChange={()=>togBloque("adjudicacion_conyuge")} />
          <Toggle label="Ad Corpus / As-Is" sub="Compra por cuerpo cierto, superficies aproximadas, estado actual" checked={data.bloques.ad_corpus} onChange={()=>togBloque("ad_corpus")} />
          <Toggle label="Cuenta Escrow" sub="Depósito condicional irrevocable (Stewart Title)" checked={data.bloques.escrow} onChange={()=>togBloque("escrow")} />
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
            <div className="flex items-center gap-2">
              <button onClick={handleGenerate} disabled={generating || !bloques.length}
                className="px-4 py-2 text-white text-sm font-medium rounded-xl transition flex items-center gap-1.5" style={{background:"var(--og-success-hi)"}}>
                <span>📄</span> {generating ? t.preview.generando : "Word"}
              </button>
              <button onClick={handleGeneratePdf} disabled={generating || !bloques.length}
                className="px-4 py-2 text-white text-sm font-medium rounded-xl transition flex items-center gap-1.5" style={{background:"var(--og-danger)"}}>
                <span>📕</span> PDF
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
              // Función para limpiar undefined
              const limpiarTexto = (texto, lang = 'es') => {
                if (!texto) return '';
                const placeholder = lang === 'es' ? '[SIN DEFINIR]' : '[UNDEFINED]';
                return texto.replace(/undefined/g, placeholder);
              };
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
              const textoEs = limpiarTexto(b.es, 'es');
              const textoLang2 = limpiarTexto(b[lang2] || b.en || '', lang2);
              const num = b.numero || b.n;
              return (
                <div key={i} className={`grid grid-cols-2 ${i ? "border-t border-gray-100" : ""}`}>
                  <div className="px-3 py-2.5 border-r border-gray-100">
                    {tEs && <p className="font-bold mb-1">{num ? `${num}.- ` : ""}{tEs}</p>}
                    {textoEs?.split("\n\n").map((p, j) => <p key={j} className="mb-1.5">{p.split("\n").map((l, k) => <span key={k}>{k > 0 && <br />}{l}</span>)}</p>)}
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
      <div className="flex justify-between items-center">
        {step > 0 ? <button onClick={() => setStep(s => s - 1)} className="px-5 py-2 text-sm rounded-xl transition" style={{background:"var(--og-surface)",border:"1px solid var(--og-border)",color:"var(--og-secondary)"}}>{t.nav.anterior}</button> : <div />}
        <div className="flex gap-3">
          {step === 4 && (
            <button onClick={() => {
              // Precargar datos para contraoferta
              const preload = {
                partes: data.partes,
                fecha_oferta: data.campos.fechas?.fecha_presentacion || '',
                descripcion_inmueble: data.campos.inmueble?.descripcion_corta || '',
                precio_original: data.campos.precio?.precio_total || 0,
              };
              localStorage.setItem("contraoferta_preload", JSON.stringify(preload));
              window.location.href = "/contraoferta";
            }} className="px-4 py-2 text-sm font-medium rounded-xl transition" style={{background:"var(--og-surface)",border:"1px solid var(--og-accent)",color:"var(--og-accent-hi)"}}>
              {idiomaSecundario === 'es' ? '¿Contraoferta?' : idiomaSecundario === 'fr' ? 'Contre-offre?' : 'Counter-offer?'}
            </button>
          )}
          {step < 4 ? <button onClick={() => setStep(s => s + 1)} className="px-5 py-2 text-sm font-medium text-white rounded-xl transition" style={{background:"var(--og-accent)",border:"1px solid var(--og-border-hi)"}}>{t.nav.siguiente}</button>
            : <button onClick={handleGenerate} disabled={generating || !bloques.length}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 rounded-xl shadow-sm transition">
                {generating ? t.preview.generando : t.preview.descargar}
              </button>}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 pt-4 border-t flex flex-col gap-2 text-xs" style={{borderTop:"1px solid var(--og-border)",color:"var(--og-muted)"}}>
        <div className="flex items-center justify-between">
          <span>Hecho por Colmena <span onClick={loadDemo} className="cursor-pointer hover:text-blue-400 transition">2026</span></span>
          <button id="install-btn" onClick={() => window.installApp?.()} className="hidden px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition">
            Instalar App
          </button>
        </div>
        <div className="text-center opacity-70" style={{fontSize:"10px"}}>
          {idiomaSecundario === 'es' 
            ? 'Herramienta de apoyo · Revisar con abogado antes de firmar'
            : idiomaSecundario === 'fr'
            ? 'Outil d\'aide · À réviser par un avocat avant signature'
            : 'Support tool · Review with lawyer before signing'}
          {' · '}
          <a href="#" onClick={(e) => { e.preventDefault(); setShowDisclaimer(true); setPendingDownload(null); }} className="underline hover:text-blue-400">
            {idiomaSecundario === 'es' ? 'Términos' : idiomaSecundario === 'fr' ? 'Conditions' : 'Terms'}
          </a>
        </div>
      </footer>
    </div>
  );
}
