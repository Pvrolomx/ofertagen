"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { ensamblarContexto, renderizarBloques } from "@/lib/plantillas/ensamblador";
import PLANTILLA from "@/lib/plantillas/oferta_compra";
import { generarDocxBlob } from "@/lib/docx/generador";

// ============================================================
// DEMO DATA (Dennis Doty → Karin Palutke)
// ============================================================
const DEMO = {partes:{ofertante:{personas:[{nombre:"DENNIS DREISBACH DOTY",genero:"M"}],tipoPersona:"fisica",domicilio:"Calle Paseo del Arque 59, Fraccionamiento Las Ceibas, Ejido Jarretadera, Bahia de Banderas, Nayarit",nacionalidad:"estadounidense",celular:"322 306 8482",email:"claudia@castlesolutions.biz"},propietario:{personas:[{nombre:"KARIN MARGARETE PALUTKE",genero:"F"}],tipoPersona:"fisica",nacionalidad:"canadiense",celular:"322 101 7810",email:"maru@lionsrealestate.properties"}},bloques:{adjudicacion_conyuge:true,escrow:true,inspeccion:true,doc_fideicomiso:true,comision:true,condicion_uso:true,fuerza_mayor:true,factura_complementaria:false,disclosure:false},campos:{inmueble:{descripcion_corta:"Departamento número 43 del Condominio Orquídeas",ubicacion_completa:"en el lote 4-12, dentro del condominio Coto Los Sauces, Condominio Maestro Flamingos Club Residencial, Km 144 carretera Tepic-Puerto Vallarta, Bahía de Banderas, Nayarit",nivel_torre:"tercer nivel de la Torre A",descripcion_interior:"sala, comedor, cocina, cuarto de lavado, terraza, 1 recámara, 1 recámara con balcón, 1 baño, recámara principal con baño",superficie_m2:129.85,superficie_letras:"ciento veintinueve metros ochenta y cinco centímetros",indiviso:"1.6790%"},antecedente:{fecha_escritura:"2018-07-20",numero_escritura:"34,362",notario_anterior:"Lic. Teodoro Ramírez Valenzuela",numero_notaria_anterior:"2",ciudad_notaria_anterior:"Bucerias, Nayarit",libro_rpp:"1406",seccion_rpp:"I",serie_rpp:"A",partida_rpp:"29",cuenta_predial:"U058152"},precio:{precio_total:220000,moneda:"USD",deposito_escrow:22000,dias_deposito:3},escrow:{empresa_escrow:"STEWART TITLE LATIN AMERICA"},fechas:{fecha_presentacion:"2023-03-20",ciudad_presentacion:"Bucerias, Nayarit",fecha_vigencia:"2023-03-22",fecha_formalizacion:"cualquier día hábil dentro de las primeras dos semanas del mes de Mayo de 2023",fecha_formalizacion_en:"any business day within the first two weeks of May 2023",fecha_extension:"las primeras dos semanas del mes de Junio 2023",fecha_extension_en:"the first two weeks of June 2023"},notario:{notario_seleccion:"ramirez_2"},comision:{porcentaje_total:"6%",incluye_iva:true,agencia1_nombre:"Lion's Real Estate Properties",agencia1_porcentaje:"3%",agencia2_nombre:"Pvcastlemx, SAS, de CV",agencia2_porcentaje:"3%"},penalidad:{porcentaje_penalidad:"10%"},jurisdiccion:{ciudad_jurisdiccion:"Bucerias, Nayarit, México"},inspeccion:{dias_inspeccion:4,dias_revision:5}}};

const INIT = {partes:{ofertante:{personas:[{nombre:"",genero:"M"}],tipoPersona:"fisica",domicilio:"",nacionalidad:"",celular:"",email:""},propietario:{personas:[{nombre:"",genero:"F"}],tipoPersona:"fisica",domicilio:"",nacionalidad:"",celular:"",email:""}},bloques:{adjudicacion_conyuge:false,escrow:true,inspeccion:true,doc_fideicomiso:true,comision:true,condicion_uso:true,fuerza_mayor:true,factura_complementaria:false,disclosure:false},campos:{inmueble:{},antecedente:{},precio:{moneda:"USD",precio_total:0,deposito_escrow:0},escrow:{empresa_escrow:"STEWART TITLE LATIN AMERICA"},fechas:{ciudad_presentacion:"Bucerias, Nayarit"},notario:{},comision:{porcentaje_total:"6%",incluye_iva:true},penalidad:{porcentaje_penalidad:"10%"},jurisdiccion:{ciudad_jurisdiccion:"Bucerias, Nayarit, México"},inspeccion:{dias_inspeccion:4,dias_revision:5}}};

// ============================================================
// HELPERS
// ============================================================
function ensamblar(data) { try { return ensamblarContexto(PLANTILLA, data); } catch { return null; } }
function renderBlks(ctx) { if (!ctx) return []; try { return renderizarBloques(PLANTILLA, ctx); } catch { return []; } }

// ============================================================
// COMPONENTS
// ============================================================
function Input({ label, value, onChange, type = "text", placeholder = "", required, wide, rows }) {
  return (
    <div className={`flex flex-col gap-1 ${wide ? "col-span-2" : ""}`}>
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {rows ? (
        <textarea value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
          className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none resize-y" />
      ) : (
        <input type={type} value={value || ""} onChange={e => onChange(type === "number" ? +e.target.value : e.target.value)} placeholder={placeholder}
          step={type === "number" ? "any" : undefined}
          className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none" />
      )}
    </div>
  );
}

function Toggle({ label, sub, checked, onChange }) {
  return (
    <div onClick={() => onChange(!checked)} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${checked ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"}`}>
      <div className={`w-10 h-5 rounded-full relative transition-colors ${checked ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}`}>
        <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${checked ? "left-5" : "left-0.5"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {sub && <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{sub}</div>}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">{title}</h3>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function PartePanel({ data, pid, label, upParte, upPersona, addPersona, rmPersona }) {
  const p = data.partes[pid];
  return (
    <Section title={label}>
      {p.personas.map((per, i) => (
        <div key={i} className="col-span-2 flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400">Persona {i + 1}</span>
            {p.personas.length > 1 && <button onClick={() => rmPersona(pid, i)} className="ml-auto text-xs text-red-500 hover:text-red-700">Quitar</button>}
          </div>
          <input value={per.nombre} onChange={e => upPersona(pid, i, "nombre", e.target.value.toUpperCase())} placeholder="NOMBRE COMPLETO"
            className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-400 outline-none font-medium" />
          <div className="flex gap-2">
            {["M", "F"].map(g => (
              <button key={g} onClick={() => upPersona(pid, i, "genero", g)}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${per.genero === g ? "bg-blue-500 text-white" : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300"}`}>{g}</button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={() => addPersona(pid)} className="col-span-2 text-xs text-blue-500 hover:text-blue-700 py-1">+ Agregar persona</button>
      <Input label="Nacionalidad" value={p.nacionalidad} onChange={v => upParte(pid, "nacionalidad", v)} placeholder="canadiense, estadounidense..." />
      <Input label="Celular/WhatsApp" value={p.celular} onChange={v => upParte(pid, "celular", v)} type="tel" required />
      <Input label="Email" value={p.email} onChange={v => upParte(pid, "email", v)} type="email" required />
      <Input label="Domicilio" value={p.domicilio} onChange={v => upParte(pid, "domicilio", v)} wide rows={2} />
    </Section>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function OfertaGenPage() {
  const [data, setData] = useState(INIT);
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const steps = ["Partes", "Inmueble", "Operación", "Cláusulas", "Preview"];

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

  const ctx = useMemo(() => ensamblar(data), [data]);
  const bloques = useMemo(() => renderBlks(ctx), [ctx]);

  const handleGenerate = useCallback(async () => {
    if (!bloques.length) return;
    setGenerating(true);
    try {
      const blob = await generarDocxBlob(bloques, PLANTILLA.meta);
      const nombre = data.partes.ofertante.personas[0]?.nombre?.replace(/\s+/g, "_") || "OFERTA";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `OFERTA_${nombre}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generando DOCX:", err);
      alert("Error al generar el documento. Revisa la consola.");
    }
    setGenerating(false);
  }, [bloques, data.partes.ofertante.personas]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">OfertaGen</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Expat Advisor MX</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadDemo} className="px-3 py-1.5 text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-100 transition">Demo</button>
          <button onClick={resetAll} className="px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 transition">Limpiar</button>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex gap-1 mb-6">
        {steps.map((s, i) => (
          <button key={s} onClick={() => setStep(i)}
            className={`flex-1 py-2.5 text-xs font-medium rounded-lg transition-all ${i === step ? "bg-blue-500 text-white shadow-sm" : i < step ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700"}`}>
            {i + 1}. {s}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-4 min-h-[400px]">

        {step === 0 && <>
          <PartePanel data={data} pid="ofertante" label="Ofertante / Buyer" upParte={upParte} upPersona={upPersona} addPersona={addPersona} rmPersona={rmPersona} />
          <PartePanel data={data} pid="propietario" label="Propietario / Owner" upParte={upParte} upPersona={upPersona} addPersona={addPersona} rmPersona={rmPersona} />
        </>}

        {step === 1 && <>
          <Section title="Datos del inmueble">
            <Input label="Descripción corta" value={data.campos.inmueble?.descripcion_corta} onChange={v=>upCampo("inmueble","descripcion_corta",v)} placeholder="Departamento 43 del Condo Orquídeas" required wide />
            <Input label="Ubicación completa" value={data.campos.inmueble?.ubicacion_completa} onChange={v=>upCampo("inmueble","ubicacion_completa",v)} wide rows={3} required />
            <Input label="Nivel/Torre" value={data.campos.inmueble?.nivel_torre} onChange={v=>upCampo("inmueble","nivel_torre",v)} />
            <Input label="Interior" value={data.campos.inmueble?.descripcion_interior} onChange={v=>upCampo("inmueble","descripcion_interior",v)} />
            <Input label="Superficie m²" value={data.campos.inmueble?.superficie_m2} onChange={v=>upCampo("inmueble","superficie_m2",v)} type="number" required />
            <Input label="Superficie en letras" value={data.campos.inmueble?.superficie_letras} onChange={v=>upCampo("inmueble","superficie_letras",v)} required />
            <Input label="Indiviso %" value={data.campos.inmueble?.indiviso} onChange={v=>upCampo("inmueble","indiviso",v)} />
            <Input label="Clave catastral" value={data.campos.inmueble?.clave_catastral} onChange={v=>upCampo("inmueble","clave_catastral",v)} placeholder="020-024-01-039-258-000" />
            <div className="col-span-2 flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <input type="checkbox" checked={!!data.campos.inmueble?.tiene_uso_exclusivo} onChange={e=>upCampo("inmueble","tiene_uso_exclusivo",e.target.checked)} className="rounded" />
              <div>
                <label className="text-sm font-medium">Incluir notas de uso exclusivo</label>
                <p className="text-xs text-gray-400">Estacionamiento, bodega, servidumbre, terraza privada...</p>
              </div>
            </div>
            {data.campos.inmueble?.tiene_uso_exclusivo && <>
              <Input label="Notas uso exclusivo (ES)" value={data.campos.inmueble?.notas_uso_exclusivo} onChange={v=>upCampo("inmueble","notas_uso_exclusivo",v)} wide rows={2} placeholder="un estacionamiento con superficie descubierta de 14.40 m² y una bodega de 2.80 m²" />
              <Input label="Notas uso exclusivo (EN)" value={data.campos.inmueble?.notas_uso_exclusivo_en} onChange={v=>upCampo("inmueble","notas_uso_exclusivo_en",v)} wide rows={2} placeholder="a parking space of 14.40 sq m and a storage room of 2.80 sq m" />
            </>}
          </Section>
          <Section title="Antecedente registral">
            <Input label="Fecha escritura" value={data.campos.antecedente?.fecha_escritura} onChange={v=>upCampo("antecedente","fecha_escritura",v)} type="date" required />
            <Input label="No. escritura" value={data.campos.antecedente?.numero_escritura} onChange={v=>upCampo("antecedente","numero_escritura",v)} required />
            <Input label="Notario" value={data.campos.antecedente?.notario_anterior} onChange={v=>upCampo("antecedente","notario_anterior",v)} required />
            <Input label="No. notaría" value={data.campos.antecedente?.numero_notaria_anterior} onChange={v=>upCampo("antecedente","numero_notaria_anterior",v)} required />
            <Input label="Ciudad" value={data.campos.antecedente?.ciudad_notaria_anterior} onChange={v=>upCampo("antecedente","ciudad_notaria_anterior",v)} required />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Estado del RPP</label>
              <select value={data.campos.antecedente?.estado_registro||"nayarit"} onChange={e=>upCampo("antecedente","estado_registro",e.target.value)} className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800">
                <option value="nayarit">Nayarit (Bahía de Banderas, Bucerías)</option>
                <option value="jalisco">Jalisco (Puerto Vallarta)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Tipo de inscripción</label>
              <select value={data.campos.antecedente?.tipo_registro||"folio_real"} onChange={e=>upCampo("antecedente","tipo_registro",e.target.value)} className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800">
                <option value="folio_real">{(data.campos.antecedente?.estado_registro||"nayarit") === "nayarit" ? "Folio Real Electrónico" : "Folio Real"}</option>
                <option value="legacy">Inscripción tradicional (legacy)</option>
              </select>
            </div>
            {(data.campos.antecedente?.tipo_registro||"folio_real") === "folio_real" ? (
              <Input label={(data.campos.antecedente?.estado_registro||"nayarit") === "nayarit" ? "Folio Real Electrónico" : "Folio Real"} value={data.campos.antecedente?.folio_real} onChange={v=>upCampo("antecedente","folio_real",v)} placeholder="Ej: 54832" />
            ) : (data.campos.antecedente?.estado_registro||"nayarit") === "nayarit" ? (<>
              <Input label="Libro" value={data.campos.antecedente?.libro_rpp} onChange={v=>upCampo("antecedente","libro_rpp",v)} />
              <Input label="Sección" value={data.campos.antecedente?.seccion_rpp} onChange={v=>upCampo("antecedente","seccion_rpp",v)} />
              <Input label="Serie" value={data.campos.antecedente?.serie_rpp} onChange={v=>upCampo("antecedente","serie_rpp",v)} />
              <Input label="Partida" value={data.campos.antecedente?.partida_rpp} onChange={v=>upCampo("antecedente","partida_rpp",v)} />
            </>) : (<>
              <Input label="Documento" value={data.campos.antecedente?.documento_rpp} onChange={v=>upCampo("antecedente","documento_rpp",v)} />
              <Input label="Folios" value={data.campos.antecedente?.folios_rpp} onChange={v=>upCampo("antecedente","folios_rpp",v)} />
              <Input label="Libro" value={data.campos.antecedente?.libro_jal} onChange={v=>upCampo("antecedente","libro_jal",v)} />
              <Input label="Sección" value={data.campos.antecedente?.seccion_jal} onChange={v=>upCampo("antecedente","seccion_jal",v)} />
            </>)}
            <Input label="Cuenta predial" value={data.campos.antecedente?.cuenta_predial} onChange={v=>upCampo("antecedente","cuenta_predial",v)} />
          </Section>
        </>}

        {step === 2 && <>
          <Section title="Precio y pagos">
            <Input label="Precio total" value={data.campos.precio?.precio_total} onChange={v=>upCampo("precio","precio_total",v)} type="number" required />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Moneda</label>
              <select value={data.campos.precio?.moneda||"USD"} onChange={e=>upCampo("precio","moneda",e.target.value)} className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800">
                <option value="USD">USD</option><option value="MXN">MXN</option>
              </select>
            </div>
            <Input label="Depósito escrow" value={data.campos.precio?.deposito_escrow} onChange={v=>upCampo("precio","deposito_escrow",v)} type="number" />
            <Input label="Días hábiles para depositar" value={data.campos.precio?.dias_deposito||3} onChange={v=>upCampo("precio","dias_deposito",v)} type="number" />
            <Input label="Días hábiles saldo (antes del cierre)" value={data.campos.precio?.dias_saldo||5} onChange={v=>upCampo("precio","dias_saldo",v)} type="number" />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Anticipo gastos de escrituración</label>
              <select value={data.campos.precio?.anticipo_gastos||"0"} onChange={e=>upCampo("precio","anticipo_gastos",e.target.value)} className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800">
                <option value="0">Sin anticipo</option>
                <option value="1000">$1,000 USD</option>
                <option value="2000">$2,000 USD</option>
                <option value="3000">$3,000 USD</option>
                <option value="5000">$5,000 USD</option>
                <option value="7500">$7,500 USD</option>
                <option value="10000">$10,000 USD</option>
              </select>
            </div>
            {ctx && <div className="col-span-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs space-y-1 border border-blue-100 dark:border-blue-800">
              <div><span className="text-gray-500">Total:</span> <span className="font-medium">{ctx.precio?.completo}</span></div>
              <div><span className="text-gray-500">Depósito:</span> <span className="font-medium">{ctx.deposito?.completo}</span></div>
              <div><span className="text-gray-500">Saldo:</span> <span className="font-medium">{ctx.saldo?.completo}</span></div>
            </div>}
          </Section>
          <Section title="Escrow">
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-xs font-medium text-gray-500">Empresa escrow</label>
              <select value={data.campos.escrow?.empresa_escrow||"STEWART TITLE LATIN AMERICA"} onChange={e=>upCampo("escrow","empresa_escrow",e.target.value)} className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800">
                <option value="STEWART TITLE LATIN AMERICA">Stewart Title Latin America (STLA)</option>
                <option value="ARMOUR SETTLEMENT SERVICES">Armour Settlement Services</option>
                <option value="TITLE LATIN AMERICA (TLA)">Title Latin America (TLA)</option>
              </select>
            </div>
            <Input label="Honorarios escrow (USD)" value={data.campos.escrow?.honorarios_escrow||750} onChange={v=>upCampo("escrow","honorarios_escrow",v)} type="number" />
          </Section>
          <Section title="Fechas y plazos">
            <Input label="Fecha presentación" value={data.campos.fechas?.fecha_presentacion} onChange={v=>upCampo("fechas","fecha_presentacion",v)} type="date" required />
            <Input label="Ciudad" value={data.campos.fechas?.ciudad_presentacion} onChange={v=>upCampo("fechas","ciudad_presentacion",v)} required />
            <Input label="Fecha de vencimiento" value={data.campos.fechas?.fecha_vigencia} onChange={v=>upCampo("fechas","fecha_vigencia",v)} type="date" required />
            <Input label="Hora de vencimiento" value={data.campos.fechas?.hora_vigencia||"medianoche"} onChange={v=>upCampo("fechas","hora_vigencia",v)} placeholder="medianoche, 17:00 horas..." />
            <Input label="Formalización (ES)" value={data.campos.fechas?.fecha_formalizacion} onChange={v=>upCampo("fechas","fecha_formalizacion",v)} wide />
            <Input label="Formalización (EN)" value={data.campos.fechas?.fecha_formalizacion_en} onChange={v=>upCampo("fechas","fecha_formalizacion_en",v)} wide />
            <Input label="Extensión (ES)" value={data.campos.fechas?.fecha_extension} onChange={v=>upCampo("fechas","fecha_extension",v)} />
            <Input label="Extensión (EN)" value={data.campos.fechas?.fecha_extension_en} onChange={v=>upCampo("fechas","fecha_extension_en",v)} />
          </Section>
          <Section title="Notario designado">
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-xs font-medium text-gray-500">Notario <span className="text-red-500">*</span></label>
              <select value={data.campos.notario?.notario_seleccion||""} onChange={e=>upCampo("notario","notario_seleccion",e.target.value)} className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800">
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
              <Input label="Nombre del notario" value={data.campos.notario?.nombre_notario} onChange={v=>upCampo("notario","nombre_notario",v)} required />
              <Input label="No. notaría" value={data.campos.notario?.numero_notaria} onChange={v=>upCampo("notario","numero_notaria",v)} required />
              <Input label="Ciudad" value={data.campos.notario?.ciudad_notaria} onChange={v=>upCampo("notario","ciudad_notaria",v)} required />
            </>}
          </Section>
          <Section title="Comisión inmobiliaria">
            <Input label="% total" value={data.campos.comision?.porcentaje_total} onChange={v=>upCampo("comision","porcentaje_total",v)} />
            <div className="flex items-center gap-2 self-end pb-2">
              <input type="checkbox" checked={!!data.campos.comision?.incluye_iva} onChange={e=>upCampo("comision","incluye_iva",e.target.checked)} className="rounded" />
              <label className="text-xs text-gray-500">+ IVA 16%</label>
            </div>
            <Input label="Agencia 1" value={data.campos.comision?.agencia1_nombre} onChange={v=>upCampo("comision","agencia1_nombre",v)} />
            <Input label="% Ag. 1" value={data.campos.comision?.agencia1_porcentaje} onChange={v=>upCampo("comision","agencia1_porcentaje",v)} />
            <Input label="Agencia 2" value={data.campos.comision?.agencia2_nombre} onChange={v=>upCampo("comision","agencia2_nombre",v)} />
            <Input label="% Ag. 2" value={data.campos.comision?.agencia2_porcentaje} onChange={v=>upCampo("comision","agencia2_porcentaje",v)} />
          </Section>
          <Section title="Penalidad / Jurisdicción">
            <Input label="% penalidad" value={data.campos.penalidad?.porcentaje_penalidad} onChange={v=>upCampo("penalidad","porcentaje_penalidad",v)} />
            <Input label="Jurisdicción" value={data.campos.jurisdiccion?.ciudad_jurisdiccion} onChange={v=>upCampo("jurisdiccion","ciudad_jurisdiccion",v)} />
            <div className="col-span-2 flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <input type="checkbox" checked={!!data.campos.penalidad?.distribuir_agencia} onChange={e=>upCampo("penalidad","distribuir_agencia",e.target.checked)} className="rounded" />
              <div>
                <label className="text-sm font-medium">Distribuir penalidad con agencia</label>
                <p className="text-xs text-gray-400">Parte afectada + agencia de RE</p>
              </div>
            </div>
            {data.campos.penalidad?.distribuir_agencia && <>
              <Input label="% parte afectada" value={data.campos.penalidad?.pct_parte_afectada||"60%"} onChange={v=>upCampo("penalidad","pct_parte_afectada",v)} />
              <Input label="% agencia" value={data.campos.penalidad?.pct_agencia||"40%"} onChange={v=>upCampo("penalidad","pct_agencia",v)} />
            </>}
          </Section>
          <Section title="Testigos y aceptación">
            <div className="col-span-2 flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <input type="checkbox" checked={!!data.campos.testigos?.incluir_testigos} onChange={e=>upCampo("testigos","incluir_testigos",e.target.checked)} className="rounded" />
              <div>
                <label className="text-sm font-medium">Incluir líneas de testigos</label>
                <p className="text-xs text-gray-400">Testigo 1 y Testigo 2 en la página de firma</p>
              </div>
            </div>
            <div className="col-span-2 flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <input type="checkbox" checked={data.campos.testigos?.incluir_aceptacion!==false} onChange={e=>upCampo("testigos","incluir_aceptacion",e.target.checked)} className="rounded" />
              <div>
                <label className="text-sm font-medium">Lugar, fecha y hora de aceptación</label>
                <p className="text-xs text-gray-400">Línea para que el vendedor anote cuándo aceptó</p>
              </div>
            </div>
          </Section>
          <Section title="Coordinador de cierre / Closing coordinator">
            <Input label="Nombre" value={data.campos.coordinador?.nombre_coordinador} onChange={v=>upCampo("coordinador","nombre_coordinador",v)} placeholder="Lic. Rolando Romero García" />
            <Input label="Empresa" value={data.campos.coordinador?.empresa_coordinador} onChange={v=>upCampo("coordinador","empresa_coordinador",v)} placeholder="Expat Advisor MX" />
            <Input label="Celular/WhatsApp" value={data.campos.coordinador?.celular_coordinador} onChange={v=>upCampo("coordinador","celular_coordinador",v)} type="tel" />
            <Input label="Email" value={data.campos.coordinador?.email_coordinador} onChange={v=>upCampo("coordinador","email_coordinador",v)} type="email" />
          </Section>
        </>}

        {step === 3 && <div className="space-y-3">
          <h2 className="text-lg font-semibold mb-1">Cláusulas opcionales</h2>
          <p className="text-xs text-gray-500 mb-4">Activa o desactiva sin romper el contrato.</p>
          <Toggle label="Adjudicación de cónyuge" sub="50% derechos fideicomisarios del esposo fallecido" checked={data.bloques.adjudicacion_conyuge} onChange={()=>togBloque("adjudicacion_conyuge")} />
          <Toggle label="Cuenta Escrow" sub="Depósito condicional irrevocable (Stewart Title)" checked={data.bloques.escrow} onChange={()=>togBloque("escrow")} />
          <Toggle label="Inspección del inmueble" sub="Período de inspección y aprobación del reporte" checked={data.bloques.inspeccion} onChange={()=>togBloque("inspeccion")} />
          <Toggle label="Documentación fideicomiso" sub="Copia del fideicomiso y actas de asamblea" checked={data.bloques.doc_fideicomiso} onChange={()=>togBloque("doc_fideicomiso")} />
          <Toggle label="Comisión inmobiliaria" sub="Pago de comisión a agencias de RE" checked={data.bloques.comision} onChange={()=>togBloque("comision")} />
          <div className="mt-4 mb-2"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cláusulas adicionales</p></div>
          <Toggle label="Condición general y estado de uso" sub="Entrega en misma condición que inspección, desgaste normal" checked={data.bloques.condicion_uso} onChange={()=>togBloque("condicion_uso")} />
          <Toggle label="Caso fortuito y fuerza mayor" sub="Fallecimiento → continúa con beneficiarios; desastre → cancela sin penalidad" checked={data.bloques.fuerza_mayor} onChange={()=>togBloque("fuerza_mayor")} />
          <Toggle label="Factura complementaria" sub="Solo cuando vendedor es persona moral mexicana (PDF+XML)" checked={data.bloques.factura_complementaria} onChange={()=>togBloque("factura_complementaria")} />
          <Toggle label="Disclosure / Deslinde" sub="Notario neutral, agencia no asesora legal/fiscal, hold harmless" checked={data.bloques.disclosure} onChange={()=>togBloque("disclosure")} />
        </div>}

        {step === 4 && <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Vista previa bilingüe</h2>
            <button onClick={handleGenerate} disabled={generating || !bloques.length}
              className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-xl transition shadow-sm disabled:shadow-none">
              {generating ? "Generando..." : "Descargar .docx"}
            </button>
          </div>
          {bloques.length === 0 ? <p className="text-gray-400 text-sm">Completa los datos de las partes para ver la vista previa.</p> :
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden text-xs leading-relaxed">
            <div className="grid grid-cols-2 bg-gray-100 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
              <div className="px-3 py-2 font-semibold text-gray-500 text-[10px] tracking-wider border-r border-gray-200 dark:border-gray-600">ESPAÑOL</div>
              <div className="px-3 py-2 font-semibold text-gray-500 text-[10px] tracking-wider">ENGLISH</div>
            </div>
            {bloques.map((b, i) => {
              if (b.tipo === "firmas") return (
                <div key={i} className="flex justify-around py-10 border-t border-gray-200 dark:border-gray-600">
                  {b.firmas?.map((f, j) => (
                    <div key={j} className="text-center">
                      <div className="w-48 border-b border-gray-900 dark:border-gray-200 mb-2" />
                      <div className="font-bold text-[11px]">{f.nombre}</div>
                      <div className="text-[10px] text-gray-500">{f.rol}</div>
                    </div>
                  ))}
                </div>
              );
              const tEs = b.titulo?.es || b.t?.es; const tEn = b.titulo?.en || b.t?.en;
              const num = b.numero || b.n;
              return (
                <div key={i} className={`grid grid-cols-2 ${i ? "border-t border-gray-100 dark:border-gray-700" : ""}`}>
                  <div className="px-3 py-2.5 border-r border-gray-100 dark:border-gray-700">
                    {tEs && <p className="font-bold mb-1">{num ? `${num}.- ` : ""}{tEs}</p>}
                    {b.es?.split("\n\n").map((p, j) => <p key={j} className="mb-1.5">{p.split("\n").map((l, k) => <span key={k}>{k > 0 && <br />}{l}</span>)}</p>)}
                  </div>
                  <div className="px-3 py-2.5 text-gray-500 dark:text-gray-400">
                    {tEn && <p className="font-bold mb-1 text-gray-600 dark:text-gray-300">{num ? `${num}.- ` : ""}{tEn}</p>}
                    {b.en?.split("\n\n").map((p, j) => <p key={j} className="mb-1.5">{p.split("\n").map((l, k) => <span key={k}>{k > 0 && <br />}{l}</span>)}</p>)}
                  </div>
                </div>
              );
            })}
          </div>}
        </div>}
      </div>

      {/* Nav */}
      <div className="flex justify-between">
        {step > 0 ? <button onClick={() => setStep(s => s - 1)} className="px-5 py-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition">Anterior</button> : <div />}
        {step < 4 ? <button onClick={() => setStep(s => s + 1)} className="px-5 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-xl shadow-sm transition">Siguiente</button>
          : <button onClick={handleGenerate} disabled={generating || !bloques.length}
              className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 rounded-xl shadow-sm transition">
              {generating ? "Generando..." : "Descargar .docx"}
            </button>}
      </div>

      {/* Footer — RDE regla 10 */}
      <footer className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-400">
        <span>Hecho por duendes.app 2026</span>
        <button id="install-btn" onClick={() => window.installApp?.()} className="hidden px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 transition">
          Instalar App
        </button>
      </footer>
    </div>
  );
}
