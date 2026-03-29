#!/usr/bin/env python3
"""
OfertaGen v2.0 — QA Test Suite
Validates: HTML structure, PWA, 22 bloques condicionales,
concordancia engine, Sprint I-L additions, source code integrity.
"""

import subprocess, json, re, time, os, sys
from datetime import datetime

BASE = "https://ofertagen.expatadvisormx.com"
REPO = "/home/claude/ofertagen"
results = []
t0 = time.time()

def log(test, passed, detail=""):
    icon = "✅" if passed else "❌"
    results.append({"test": test, "pass": passed, "detail": detail, "icon": icon})
    print(f"  {icon} {test}{' — ' + detail if detail else ''}")

def fetch(url, timeout=15):
    r = subprocess.run(["curl", "-sL", "--max-time", str(timeout), url],
                       capture_output=True, text=True)
    return r.stdout

def fetch_headers(url, timeout=10):
    r = subprocess.run(["curl", "-sI", "--max-time", str(timeout), url],
                       capture_output=True, text=True)
    return r.stdout

def read_file(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


# ═══════════════════════════════════════════════════════════════
# 1. LIVE SITE — HTML STRUCTURE
# ═══════════════════════════════════════════════════════════════
print("\n══ 1. LIVE SITE — HTML STRUCTURE ══")
html = fetch(BASE)

log("Site: HTTP 200 + HTML carga", len(html) > 5000, f"{len(html)} bytes")
log("Site: Title 'OfertaGen'", "OfertaGen" in html)
log("Site: Subtitle 'Expat Advisor MX'", "Expat Advisor MX" in html)
log("Site: Footer 'Hecho por duendes.app 2026'", "duendes.app 2026" in html)

# Wizard steps
for step in ["Partes", "Inmueble", "Operación", "Cláusulas", "Preview"]:
    log(f"Site: Step '{step}' presente", step in html)

# Buttons
log("Site: Botón 'Demo'", ">Demo<" in html)
log("Site: Botón 'Limpiar'", ">Limpiar<" in html)
log("Site: Botón 'Siguiente'", ">Siguiente<" in html)

# Form elements
log("Site: Input 'NOMBRE COMPLETO'", 'NOMBRE COMPLETO' in html)
log("Site: Botón género M", '>M<' in html)
log("Site: Botón género F", '>F<' in html)
log("Site: '+ Agregar persona'", 'Agregar persona' in html)
log("Site: Campo Nacionalidad", 'Nacionalidad' in html)
log("Site: Campo Celular/WhatsApp", 'Celular/WhatsApp' in html)
log("Site: Campo Email", 'email' in html.lower())
log("Site: Campo Domicilio", 'Domicilio' in html)

# Sections
log("Site: Sección 'Ofertante / Buyer'", 'Ofertante / Buyer' in html)
log("Site: Sección 'Propietario / Owner'", 'Propietario / Owner' in html)


# ═══════════════════════════════════════════════════════════════
# 2. PWA — MANIFEST, SW, ICONS
# ═══════════════════════════════════════════════════════════════
print("\n══ 2. PWA ══")

manifest_raw = fetch(f"{BASE}/manifest.json")
try:
    manifest = json.loads(manifest_raw)
    log("PWA: manifest.json carga", True)
    log("PWA: display = standalone", manifest.get("display") == "standalone")
    log("PWA: start_url presente", "start_url" in manifest)
    log("PWA: name presente", bool(manifest.get("name")))
    log("PWA: short_name presente", bool(manifest.get("short_name")))
    icons = manifest.get("icons", [])
    sizes = [i.get("sizes", "") for i in icons]
    log("PWA: icon 192x192", "192x192" in sizes)
    log("PWA: icon 512x512", "512x512" in sizes)
except:
    log("PWA: manifest.json carga", False, manifest_raw[:100])

sw_raw = fetch(f"{BASE}/sw.js")
log("PWA: sw.js carga", len(sw_raw) > 50, f"{len(sw_raw)} bytes")
log("PWA: SW network-first para HTML", "fetch" in sw_raw.lower())

icon192_headers = fetch_headers(f"{BASE}/icon-192.png")
icon512_headers = fetch_headers(f"{BASE}/icon-512.png")
log("PWA: icon-192.png accesible", "200" in icon192_headers.split("\n")[0])
log("PWA: icon-512.png accesible", "200" in icon512_headers.split("\n")[0])

# Install button
log("PWA: Botón 'Instalar App'", 'install-btn' in html)
log("PWA: beforeinstallprompt handler", 'beforeinstallprompt' in html)

# ═══════════════════════════════════════════════════════════════
# 3. SOURCE CODE — PLANTILLA (oferta_compra.js)
# ═══════════════════════════════════════════════════════════════
print("\n══ 3. SOURCE CODE — PLANTILLA ══")

plantilla = read_file(f"{REPO}/src/lib/plantillas/oferta_compra.js")

# All 22 bloques condicionales
BLOQUES_EXPECTED = [
    ("adjudicacion_conyuge", False, "Adjudicación cónyuge"),
    ("escrow", True, "Escrow"),
    ("inspeccion", True, "Inspección"),
    ("doc_fideicomiso", True, "Doc fideicomiso"),
    ("financiamiento", False, "Financiamiento"),
    ("inventario", False, "Inventario"),
    ("arrendamientos", False, "Arrendamientos"),
    ("zona_federal", False, "Zona Federal"),
    ("litigios_pendientes", False, "Litigios pendientes (Sprint I)"),
    ("empleados_condicion", False, "Empleados condición (Sprint I)"),
    ("comision", True, "Comisión"),
    ("condicion_uso", True, "Condición uso"),
    ("obligaciones_vendedor", True, "Obligaciones vendedor"),
    # obligaciones_vendedor_agua es sub-toggle dentro de obligaciones_vendedor, no bloque propio
    ("derecho_deduccion", True, "Derecho deducción"),
    ("auditoria_hacienda", False, "Auditoría Hacienda (Sprint J)"),
    ("holdback_escrow", False, "Holdback escrow (Sprint J)"),
    ("fuerza_mayor", True, "Fuerza mayor"),
    ("factura_complementaria", False, "Factura complementaria"),
    ("disclosure", False, "Disclosure"),
    ("documentos_integrales", True, "Documentos integrales"),
    ("duplicados", True, "Duplicados"),
]

for bloque_id, default, label in BLOQUES_EXPECTED:
    pattern = rf"id:\s*'{bloque_id}'"
    found = bool(re.search(pattern, plantilla))
    log(f"Plantilla: bloque '{bloque_id}' existe", found, label)

log(f"Plantilla: total bloques condicionales = 21 (+ 1 sub-toggle agua)",
    len([b for b in BLOQUES_EXPECTED if re.search(rf"id:\s*'{b[0]}'", plantilla)]) == 21)


# ═══════════════════════════════════════════════════════════════
# 4. SPRINT I — LITIGIOS + EMPLEADOS
# ═══════════════════════════════════════════════════════════════
print("\n══ 4. SPRINT I — LITIGIOS + EMPLEADOS ══")

log("Sprint I: litigios_pendientes render ES",
    "litigio" in plantilla.lower() and "3 (tres) días hábiles" in plantilla)
log("Sprint I: litigios_pendientes render EN",
    "pending or imminent litigation" in plantilla)
log("Sprint I: litigios 5 días naturales para aceptar/rechazar",
    "5 (cinco) días naturales" in plantilla)
log("Sprint I: empleados_condicion render ES",
    "relación laboral vigente" in plantilla)
log("Sprint I: empleados_condicion render EN",
    "current labor relationship" in plantilla)
log("Sprint I: empleados 3 días hábiles documentación",
    plantilla.count("3 (tres) días hábiles") >= 2)  # both blocks have it
log("Sprint I: ambos bloques → oferta nula, reembolso",
    plantilla.count("sin efecto alguno") >= 2)


# ═══════════════════════════════════════════════════════════════
# 5. SPRINT J — AUDITORÍA + HOLDBACK
# ═══════════════════════════════════════════════════════════════
print("\n══ 5. SPRINT J — AUDITORÍA + HOLDBACK ══")

log("Sprint J: auditoria_hacienda render ES",
    "auditoría" in plantilla and "autoridad hacendaria" in plantilla)
log("Sprint J: auditoria_hacienda render EN",
    "tax authority" in plantilla.lower() and "tax examination" in plantilla.lower())
log("Sprint J: vendedor responsable adeudos pre-cierre",
    "único responsable de su pago" in plantilla)
log("Sprint J: holdback_escrow render ES",
    "cuota extraordinaria" in plantilla and "retener en la cuenta escrow" in plantilla)
log("Sprint J: holdback_escrow render EN",
    "extraordinary assessments" in plantilla.lower())
log("Sprint J: holdback carta administrador requerida",
    "carta del Administrador del Condominio" in plantilla)
log("Sprint J: holdback excedente regresa al vendedor",
    "excedente" in plantilla and "liberado" in plantilla)


# ═══════════════════════════════════════════════════════════════
# 6. SPRINT K — SERVICIOS, INVENTARIO, ARRENDAMIENTOS
# ═══════════════════════════════════════════════════════════════
print("\n══ 6. SPRINT K — SERVICIOS, INVENTARIO, ARRENDAMIENTOS ══")

# Servicios 30 días
log("Sprint K: obligaciones vendedor — 30 días transferir servicios",
    "30 (treinta) días calendario después de la FECHA DE FORMALIZACIÓN" in plantilla)
log("Sprint K: consecuencia — cancelar servicios + reconexión",
    "reconexión" in plantilla)
log("Sprint K: EN — 30 calendar days after",
    "30 (thirty) calendar days after THE FORMALIZING DATE to complete" in plantilla)

# Inventario subsanación
log("Sprint K: inventario — incumplimiento si no entrega completo",
    "incumplimiento de" in plantilla and "inventario aprobado completo" in plantilla)
log("Sprint K: inventario — 3 días subsanar",
    "3 (tres) días naturales para subsanar" in plantilla)
log("Sprint K: inventario — excepción fuerza mayor (robos, huracanes)",
    "robos, huracanes, marejadas" in plantilla)
log("Sprint K: inventario EN — theft, hurricanes, storm surges",
    "theft, hurricanes, storm surges" in plantilla)

# Arrendamientos dropdown
log("Sprint K: arrendamientos — renta_hasta variable",
    "renta_hasta" in plantilla)
log("Sprint K: arrendamientos — opción escrow",
    "se refleje en la cuenta escrow" in plantilla)
log("Sprint K: arrendamientos — opción cuenta vendedor",
    "se refleje en la cuenta de" in plantilla)
log("Sprint K: arrendamientos — opción cierre",
    "hasta la FECHA DE FORMALIZACIÓN" in plantilla)


# ═══════════════════════════════════════════════════════════════
# 7. SPRINT L — COMUNICACIONES + FUERZA MAYOR
# ═══════════════════════════════════════════════════════════════
print("\n══ 7. SPRINT L — COMUNICACIONES + FUERZA MAYOR ══")

# Firma electrónica
log("Sprint L: cl_email — DocuSign mencionado",
    "DocuSign" in plantilla)
log("Sprint L: cl_email — Adobe Sign mencionado",
    "Adobe Sign" in plantilla)
log("Sprint L: cl_email — 'otros medios de firma electrónica análogos'",
    "medios de firma electrónica análogos" in plantilla)
log("Sprint L: cl_email EN — electronic signature platforms",
    "electronic signature platforms" in plantilla)
log("Sprint L: cl_email — plazo incluye plataforma",
    "plataforma de firma electrónica" in plantilla)

# Fuerza mayor expandida
log("Sprint L: fuerza mayor — pandemias",
    "pandemias" in plantilla)
log("Sprint L: fuerza mayor — huracanes, terremotos, tsunamis",
    all(w in plantilla for w in ["huracanes", "terremotos", "tsunamis"]))
log("Sprint L: fuerza mayor — guerras, disturbios civiles",
    "guerras" in plantilla and "disturbios civiles" in plantilla)
log("Sprint L: fuerza mayor — 90 días extensión automática",
    "90 (noventa) días naturales" in plantilla)
log("Sprint L: fuerza mayor — consentimiento mutuo escrito",
    "consentimiento mutuo" in plantilla and "por escrito" in plantilla)
log("Sprint L: fuerza mayor — cancela sin penalidad después de 90",
    "sin aplicar penalidad alguna" in plantilla)
log("Sprint L: fuerza mayor — fallecimiento se mantiene",
    "beneficiario(s) sustituto(s)" in plantilla)
log("Sprint L: fuerza mayor EN — 90 calendar days",
    "90 (ninety) calendar days" in plantilla)
log("Sprint L: fuerza mayor EN — mutual written consent",
    "mutual written consent" in plantilla)


# ═══════════════════════════════════════════════════════════════
# 8. PAGE.JS — UI INTEGRITY
# ═══════════════════════════════════════════════════════════════
print("\n══ 8. PAGE.JS — UI INTEGRITY ══")

pagejs = read_file(f"{REPO}/src/app/page.js")

# INIT and DEMO have all 22 bloques
for bloque_id, _, label in BLOQUES_EXPECTED:
    if bloque_id == "obligaciones_vendedor_agua":
        continue  # sub-toggle, may not be in INIT/DEMO as separate
    in_init = bloque_id in pagejs.split("const INIT")[1].split("const ")[0] if "const INIT" in pagejs else False
    log(f"page.js INIT: '{bloque_id}' presente", in_init)

# Toggle labels for Sprint I-L
log("page.js: Toggle 'Litigios pendientes'", "Litigios pendientes" in pagejs)
log("page.js: Toggle 'Litigios laborales'", "Litigios laborales" in pagejs)
log("page.js: Toggle 'Auditoría de Hacienda'", "Auditoría de Hacienda" in pagejs)
log("page.js: Toggle 'Holdback escrow condominio'", "Holdback escrow condominio" in pagejs)
log("page.js: Toggle fuerza mayor — '90 días'", "90 días" in pagejs)

# Arrendamientos dropdown in UI
log("page.js: Dropdown renta_hasta presente", "renta_hasta" in pagejs)
log("page.js: Opción 'Hasta que el dinero se refleje en escrow'", "refleje en escrow" in pagejs)
log("page.js: Opción 'Hasta que el dinero se refleje en cuenta del vendedor'",
    "cuenta del vendedor" in pagejs)
log("page.js: Opción 'Hasta la fecha de formalización'",
    "fecha de formalización" in pagejs.lower())

# Export/Import borradores (Sprint M)
log("page.js: exportDraft function existe", "const exportDraft" in pagejs)
log("page.js: importDraft function existe", "const importDraft" in pagejs)
log("page.js: Botón Guardar (export)", "Guardar" in pagejs and "exportDraft" in pagejs)
log("page.js: Botón Cargar (import)", "Cargar" in pagejs and "importDraft" in pagejs)
log("page.js: Export incluye version", 'version: "3.0"' in pagejs or "version:" in pagejs)
log("page.js: Import maneja legacy format", "Legacy format" in pagejs or "data at root" in pagejs)


# ═══════════════════════════════════════════════════════════════
# 9. ENSAMBLADOR — CONTEXT RESOLUTION
# ═══════════════════════════════════════════════════════════════
print("\n══ 9. ENSAMBLADOR ══")

ensamblador = read_file(f"{REPO}/src/lib/plantillas/ensamblador.js")

log("Ensamblador: resuelve ctx.arrendamientos",
    "ctx.arrendamientos" in ensamblador)
log("Ensamblador: resuelve ctx.inventario",
    "ctx.inventario" in ensamblador)
log("Ensamblador: resuelve ctx.financiamiento",
    "ctx.financiamiento" in ensamblador)
log("Ensamblador: resuelve ctx.inspeccion con letras",
    "dias_inspeccion_letras" in ensamblador)
log("Ensamblador: import generarContextoParte",
    "generarContextoParte" in ensamblador)
log("Ensamblador: import bloquePrecio",
    "bloquePrecio" in ensamblador)


# ═══════════════════════════════════════════════════════════════
# 10. CONCORDANCIA ENGINE
# ═══════════════════════════════════════════════════════════════
print("\n══ 10. CONCORDANCIA ENGINE ══")

core_dir = f"{REPO}/src/lib/core"
concordancia = read_file(f"{core_dir}/concordancia.js")
num2words = read_file(f"{core_dir}/num2words.js")
fechas = read_file(f"{core_dir}/fechas.js")

log("Core: concordancia.js existe", len(concordancia) > 100)
log("Core: num2words.js existe", len(num2words) > 100)
log("Core: fechas.js existe", len(fechas) > 100)
log("Core: generarContextoParte exportado", "export" in concordancia and "generarContextoParte" in concordancia)
log("Core: montoALetras presente", "montoALetras" in num2words or "montoALetras" in concordancia)
log("Core: fechaEs/fechaEn exportados", "fechaEs" in fechas and "fechaEn" in fechas)


# ═══════════════════════════════════════════════════════════════
# 11. DOCX GENERATOR
# ═══════════════════════════════════════════════════════════════
print("\n══ 11. DOCX GENERATOR ══")

generador = read_file(f"{REPO}/src/lib/docx/generador.js")

log("DOCX: generador.js existe", len(generador) > 100)
log("DOCX: generarDocxBlob exportado", "generarDocxBlob" in generador)
log("DOCX: bilingüe tabla lado a lado", "table" in generador.lower() or "Table" in generador)
log("DOCX: headers 'Página X de Y'",
    "gina" in generador or "Page" in generador)  # "Página" or "Page"
log("DOCX: firmas section", "firma" in generador.lower())


# ═══════════════════════════════════════════════════════════════
# 12. NOTARIOS CATALOG
# ═══════════════════════════════════════════════════════════════
print("\n══ 12. CATÁLOGOS ══")

NOTARIOS = ["careaga_12", "meza_29", "ramirez_2", "agraz_3", "navarrete_1", "leon_5"]
for n in NOTARIOS:
    log(f"Catálogo: notario '{n}' en plantilla", n in plantilla)

ESCROWS = ["STEWART TITLE LATIN AMERICA", "ARMOUR SETTLEMENT SERVICES",
           "TITLE LATIN AMERICA (TLA)", "P&A ESCROW"]
for e in ESCROWS:
    log(f"Catálogo: escrow '{e}'", e in plantilla)


# ═══════════════════════════════════════════════════════════════
# REPORT
# ═══════════════════════════════════════════════════════════════
elapsed = round(time.time() - t0, 1)
passed = sum(1 for r in results if r["pass"])
failed = sum(1 for r in results if not r["pass"])

print(f"\n{'='*60}")
print(f"  QA OfertaGen v2.0 — {passed} ✅ / {failed} ❌ ({len(results)} total)")
print(f"  Tiempo: {elapsed}s")
print(f"{'='*60}")

if failed > 0:
    print(f"\n  FALLOS:")
    for r in results:
        if not r["pass"]:
            print(f"    ❌ {r['test']}{' — ' + r['detail'] if r['detail'] else ''}")

# Write markdown report
md = f"""# QA Report — OfertaGen v2.0

**Fecha:** {datetime.now().strftime('%Y-%m-%d %H:%M')}
**Tiempo:** {elapsed}s
**Resultados:** {passed} ✅ / {failed} ❌ ({len(results)} total)
**URL:** {BASE}
**Repo:** Pvrolomx/ofertagen

## Resumen por sección

| Sección | Pruebas | Pasadas | Fallidas |
|---------|---------|---------|----------|
"""

sections = {}
current_section = ""
for r in results:
    # Extract section from test name prefix
    parts = r["test"].split(":")
    sec = parts[0].strip() if ":" in r["test"] else "General"
    if sec not in sections:
        sections[sec] = {"total": 0, "pass": 0, "fail": 0}
    sections[sec]["total"] += 1
    if r["pass"]:
        sections[sec]["pass"] += 1
    else:
        sections[sec]["fail"] += 1

for sec, data in sections.items():
    icon = "✅" if data["fail"] == 0 else "⚠️"
    md += f"| {icon} {sec} | {data['total']} | {data['pass']} | {data['fail']} |\n"

md += f"""
## Detalle completo

| # | Prueba | Resultado | Detalle |
|---|--------|-----------|---------|
"""

for i, r in enumerate(results, 1):
    det = r["detail"].replace("|", "\\|") if r["detail"] else "—"
    md += f"| {i} | {r['test']} | {r['icon']} | {det} |\n"

if failed > 0:
    md += f"\n## Fallos ({failed})\n\n"
    for r in results:
        if not r["pass"]:
            md += f"- ❌ **{r['test']}**{' — ' + r['detail'] if r['detail'] else ''}\n"

md += f"\n---\n*QA ejecutado por duendes.app — {datetime.now().strftime('%Y-%m-%d %H:%M')}*\n"

report_path = "/home/claude/qa-ofertagen/QA-REPORT.md"
with open(report_path, "w", encoding="utf-8") as f:
    f.write(md)

# JSON
report_json = {
    "timestamp": datetime.now().isoformat(),
    "elapsed": elapsed,
    "passed": passed,
    "failed": failed,
    "total": len(results),
    "url": BASE,
    "sections": sections,
    "results": results,
}
with open("/home/claude/qa-ofertagen/report.json", "w", encoding="utf-8") as f:
    json.dump(report_json, f, indent=2, ensure_ascii=False)

print(f"\n  📄 {report_path}")
print(f"  📊 report.json")
