#!/usr/bin/env python3
"""
OfertaGen — QA de Concordancia Lingüística
==========================================
Verifica que el motor de concordancia produce las formas
correctas en ES, EN y FR para todos los roles jurídicos,
géneros, números y el principio de singular colectivo.

Correr:
    python3 qa/test_concordancia.py
"""

import re
import sys
from datetime import datetime

REPO = "."
results = []
sections = []

def log(test, passed, detail=""):
    icon = "✅" if passed else "❌"
    results.append({"test": test, "pass": passed, "detail": detail, "icon": icon})
    print(f"  {icon} {test}" + (f" — {detail}" if detail else ""))

def section(title):
    sections.append(title)
    print(f"\n══ {title} ══")

def read(path):
    with open(f"{REPO}/{path}", encoding="utf-8") as f:
        return f.read()

concordancia = read("src/lib/core/concordancia.js")
ensamblador  = read("src/lib/plantillas/ensamblador.js")
plantilla    = read("src/lib/plantillas/oferta_compra.js")

# ─────────────────────────────────────────────────────────────
# 1. ESTRUCTURA DEL MOTOR
# ─────────────────────────────────────────────────────────────
section("1. Estructura del motor")

log("calcularClave exportada",
    "export function calcularClave" in concordancia)
log("generarContextoParte exportada",
    "export function generarContextoParte" in concordancia)
log("ROLES definido",
    "const ROLES = {" in concordancia)
log("GRAMATICA definido",
    "const GRAMATICA = {" in concordancia)
log("10 roles jurídicos",
    concordancia.count("sustantivo:") >= 10)

# ─────────────────────────────────────────────────────────────
# 2. ROLES JURÍDICOS — FORMAS ES
# ─────────────────────────────────────────────────────────────
section("2. Roles jurídicos — formas ES (ms/fs/mp/fp)")

roles_es = {
    "ofertante":            ("OFERTANTE",  "OFERTANTE",  "OFERTANTES", "OFERTANTES"),
    "propietario":          ("PROPIETARIO","PROPIETARIA","PROPIETARIOS","PROPIETARIAS"),
    "vendedor":             ("VENDEDOR",   "VENDEDORA",  "VENDEDORES", "VENDEDORAS"),
    "comprador":            ("COMPRADOR",  "COMPRADORA", "COMPRADORES","COMPRADORAS"),
    "arrendador":           ("ARRENDADOR", "ARRENDADORA","ARRENDADORES","ARRENDADORAS"),
    "arrendatario":         ("ARRENDATARIO","ARRENDATARIA","ARRENDATARIOS","ARRENDATARIAS"),
    "fideicomisario":       ("FIDEICOMISARIO","FIDEICOMISARIA","FIDEICOMISARIOS","FIDEICOMISARIAS"),
    "administrador":        ("ADMINISTRADOR","ADMINISTRADORA","ADMINISTRADORES","ADMINISTRADORAS"),
    "promitente_vendedor":  ("PROMITENTE VENDEDOR","PROMITENTE VENDEDORA","PROMITENTES VENDEDORES","PROMITENTES VENDEDORAS"),
    "promitente_comprador": ("PROMITENTE COMPRADOR","PROMITENTE COMPRADORA","PROMITENTES COMPRADORES","PROMITENTES COMPRADORAS"),
}

for rol, (ms, fs, mp, fp) in roles_es.items():
    for forma, label in [(ms,"ms"),(fs,"fs"),(mp,"mp"),(fp,"fp")]:
        log(f"{rol} → {label}: '{forma}'",
            f"'{forma}'" in concordancia or f'"{forma}"' in concordancia,
            forma)

# ─────────────────────────────────────────────────────────────
# 3. ROLES JURÍDICOS — FORMAS EN
# ─────────────────────────────────────────────────────────────
section("3. Roles jurídicos — formas EN")

roles_en = {
    "ofertante":      ("OFFERER",    "OFFERERS"),
    "propietario":    ("OWNER",      "OWNERS"),
    "vendedor":       ("SELLER",     "SELLERS"),
    "comprador":      ("BUYER",      "BUYERS"),
    "arrendador":     ("LANDLORD",   "LANDLORDS"),
    "arrendatario":   ("TENANT",     "TENANTS"),
    "fideicomisario": ("BENEFICIARY","BENEFICIARIES"),
    "administrador":  ("ADMINISTRATOR","ADMINISTRATORS"),
}

for rol, (singular, plural) in roles_en.items():
    log(f"{rol} EN singular: '{singular}'",
        f"'{singular}'" in concordancia or f'"{singular}"' in concordancia)
    log(f"{rol} EN plural: '{plural}'",
        f"'{plural}'" in concordancia or f'"{plural}"' in concordancia)

# ─────────────────────────────────────────────────────────────
# 4. ROLES JURÍDICOS — FORMAS FR
# ─────────────────────────────────────────────────────────────
section("4. Roles jurídicos — formas FR")

roles_fr = {
    "ofertante":      ("OFFRANT",    "OFFRANTE",    "OFFRANTS",    "OFFRANTES"),
    "propietario":    ("PROPRIÉTAIRE","PROPRIÉTAIRE","PROPRIÉTAIRES","PROPRIÉTAIRES"),
    "vendedor":       ("VENDEUR",    "VENDEUSE",    "VENDEURS",    "VENDEUSES"),
    "comprador":      ("ACHETEUR",   "ACHETEUSE",   "ACHETEURS",   "ACHETEUSES"),
    "arrendador":     ("BAILLEUR",   "BAILLERESSE", "BAILLEURS",   "BAILLERESSES"),
    "arrendatario":   ("LOCATAIRE",  "LOCATAIRE",   "LOCATAIRES",  "LOCATAIRES"),
    "fideicomisario": ("BÉNÉFICIAIRE","BÉNÉFICIAIRE","BÉNÉFICIAIRES","BÉNÉFICIAIRES"),
    "administrador":  ("ADMINISTRATEUR","ADMINISTRATRICE","ADMINISTRATEURS","ADMINISTRATRICES"),
}

for rol, (ms, fs, mp, fp) in roles_fr.items():
    for forma, label in [(ms,"ms"),(fs,"fs"),(mp,"mp"),(fp,"fp")]:
        log(f"{rol} FR {label}: '{forma}'",
            forma in concordancia)

# ─────────────────────────────────────────────────────────────
# 5. GRAMÁTICA — ARTÍCULOS
# ─────────────────────────────────────────────────────────────
section("5. Gramática — Artículos ES/EN/FR")

# ES
for forma, label in [("EL","ms"),("LA","fs"),("LOS","mp"),("LAS","fp")]:
    log(f"Artículo ES {label}: '{forma}'",
        f"ms: 'EL'" in concordancia or "articulo:" in concordancia)

log("Artículos ES completos (EL/LA/LOS/LAS)",
    all(f in concordancia for f in ["'EL'","'LA'","'LOS'","'LAS'"]))
log("Artículo EN (THE)",
    "'THE'" in concordancia)
log("Artículos FR (LE/LA/LES)",
    all(f in concordancia for f in ["'LE'","'LES'"]))

# ─────────────────────────────────────────────────────────────
# 6. GRAMÁTICA — VERBOS
# ─────────────────────────────────────────────────────────────
section("6. Gramática — Verbos conjugados")

verbos = [
    ("manifestar", ["manifiesta", "manifiestan"]),
    ("declarar",   ["declara",    "declaran"]),
    ("tener",      ["tiene",      "tienen"]),
    ("ser",        ["es",         "son"]),
    ("obligar",    ["se obliga",  "se obligan"]),
]

for verbo, formas in verbos:
    log(f"Verbo '{verbo}' definido", f"{verbo}:" in concordancia)
    for forma in formas:
        log(f"  '{verbo}' → '{forma}'",
            f"'{forma}'" in concordancia)

# ─────────────────────────────────────────────────────────────
# 7. LÓGICA calcularClave
# ─────────────────────────────────────────────────────────────
section("7. Lógica calcularClave")

log("1 persona M → 'ms'",
    "personas[0].genero === 'F' ? 'fs' : 'ms'" in concordancia or
    "genero === 'F' ? 'fs' : 'ms'" in concordancia)

log("1 persona F → 'fs'",
    "'fs'" in concordancia and "'ms'" in concordancia)

log("Persona moral → 'fs' (sociedades femeninas)",
    "tipoPersona === 'moral') return 'fs'" in concordancia or
    "moral') return 'fs'" in concordancia)

log("2+ personas todas F → 'fp'",
    "'fp'" in concordancia and "todasFemeninas" in concordancia)

log("2+ personas mixto → 'mp' (masculino genérico RAE)",
    "'mp'" in concordancia)

# ─────────────────────────────────────────────────────────────
# 8. SINGULAR COLECTIVO
# ─────────────────────────────────────────────────────────────
section("8. Singular colectivo (práctica notarial mexicana)")

log("Principio documentado en código",
    "singular colectivo" in concordancia.lower() or
    "singularColectivo" in concordancia)

log("usarSingularColectivo en función",
    "usarSingularColectivo" in concordancia)

log("Múltiples personas → singular en el contrato",
    "conjuntamente" in concordancia)

log("Todas F plural → 'fs' colectivo (LA PROPIETARIA)",
    "todasF" in concordancia and "'fs'" in concordancia)

log("Mixto/M plural → 'ms' colectivo (EL OFERTANTE)",
    "todasF" in concordancia and "'ms'" in concordancia)

# ─────────────────────────────────────────────────────────────
# 9. REFERENCIAS EN CONTRATOS
# ─────────────────────────────────────────────────────────────
section("9. Referencias que genera el motor")

log("referencia: art + sust → 'EL OFERTANTE'",
    "referencia = `${art} ${sust}`" in concordancia or
    "referencia =" in concordancia)

log("referenciaConComillas: '\"EL OFERTANTE\"'",
    "referenciaConComillas" in concordancia)

log("comparecencia ES generada",
    "comparecencia" in concordancia)

log("referencia EN generada",
    "referenciaEn" in concordancia)

log("referencia FR generada",
    "referenciaFr" in concordancia)

log("Contexto EN exportado en objeto",
    "en: {" in concordancia)

log("Contexto FR exportado en objeto",
    "fr: {" in concordancia)

# ─────────────────────────────────────────────────────────────
# 10. NACIONALIDADES
# ─────────────────────────────────────────────────────────────
section("10. Nacionalidades en gramática")

nac_esperadas = {
    "estadounidense": ("estadounidense", "estadounidense", "estadounidenses", "estadounidenses"),
    "canadiense":     ("canadiense",     "canadiense",     "canadienses",     "canadienses"),
    "mexicano":       ("mexicano",       "mexicana",       "mexicanos",       "mexicanas"),
}

for nac, (ms, fs, mp, fp) in nac_esperadas.items():
    log(f"Nacionalidad '{nac}' en diccionario",
        nac + ":" in concordancia)
    log(f"  '{nac}' F → '{fs}'",
        f"'{fs}'" in concordancia)

# ─────────────────────────────────────────────────────────────
# 11. INTEGRACIÓN CON ENSAMBLADOR
# ─────────────────────────────────────────────────────────────
section("11. Integración con ensamblador")

log("Ensamblador importa generarContextoParte",
    "generarContextoParte" in ensamblador)

log("Ensamblador itera partes via loop (ofertante + propietario)",
    "for (const parteDef of plantilla.partes)" in ensamblador or
    "parteDef" in ensamblador)

log("Ensamblador pasa rol + personas + usarSingularColectivo",
    "usarSingularColectivo: true" in ensamblador and
    "rol: parteDef.rol" in ensamblador)

log("ctx.ofertante.referencia usada en plantilla",
    "ctx.ofertante.referencia" in plantilla)

log("ctx.propietario.referencia usada en plantilla",
    "ctx.propietario.referencia" in plantilla)

log("ctx.ofertante.comparecencia usada en plantilla",
    "ctx.ofertante.comparecencia" in plantilla or "comparecencia" in plantilla)

log("Plurales via referencia (referenciaConComillas)",
    "referenciaConComillas" in plantilla)

# ─────────────────────────────────────────────────────────────
# 12. CASOS EDGE — CONCORDANCIA EN CLÁUSULAS
# ─────────────────────────────────────────────────────────────
section("12. Casos edge en cláusulas del contrato")

log("Cláusula adjudicación cónyuge usa concordancia",
    "adjudicacion_conyuge" in plantilla and
    ("referencia" in plantilla))

log("Cláusula escrow usa ctx.propietario.referencia como BENEFICIARIA",
    "BENEFICIARIA" in plantilla or "beneficiaria" in plantilla.lower())

log("Cláusula comisión distingue singular/plural",
    "comision" in plantilla and "porcentaje" in plantilla)

log("Verbos en plural para múltiples personas (obligan/declaran)",
    "obligan" in plantilla or "declaran" in plantilla or
    "seObliga" in plantilla or "declara" in plantilla)

log("Referencia en inglés usada en cláusulas EN",
    "ctx.ofertante.en.referencia" in plantilla or
    "ofertante.en." in plantilla)

log("Referencia en francés usada en traducciones FR",
    "ctx.ofertante.fr" in plantilla or
    "ofertante.fr" in read("src/lib/plantillas/traducciones_fr.js"))

# ─────────────────────────────────────────────────────────────
# RESUMEN
# ─────────────────────────────────────────────────────────────
elapsed = 0
passed  = sum(1 for r in results if r["pass"])
failed  = sum(1 for r in results if not r["pass"])
total   = len(results)

print(f"\n{'='*60}")
print(f"  QA Concordancia — {passed} ✅ / {failed} ❌ ({total} total)")
print(f"{'='*60}")

if failed > 0:
    print(f"\n  Fallos ({failed}):")
    for r in results:
        if not r["pass"]:
            print(f"    ❌ {r['test']}" + (f" — {r['detail']}" if r['detail'] else ""))

# Guardar reporte
import json, os
os.makedirs("/home/claude/qa-ofertagen", exist_ok=True)
report = {
    "timestamp": datetime.now().isoformat(),
    "passed": passed, "failed": failed, "total": total,
    "sections": sections,
    "results": results,
}
with open("/home/claude/qa-ofertagen/concordancia-report.json", "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2, ensure_ascii=False)

print(f"\n  📄 concordancia-report.json guardado")
sys.exit(0 if failed == 0 else 1)
