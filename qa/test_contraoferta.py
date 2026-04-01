#!/usr/bin/env python3
"""
ContraOfertaGen — QA Suite
Sprint CA-1: Plantilla + Ensamblador

Valida:
  1. Estructura de archivos
  2. Plantilla tiene 7 bloques condicionales + 4 siempre
  3. Ensamblador exporta funciones correctas
  4. Campos trilingües
"""

import os
import re
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

passed = 0
failed = 0

def log(test_name, result):
    global passed, failed
    if result:
        passed += 1
        print(f"  ✅ {test_name}")
    else:
        failed += 1
        print(f"  ❌ {test_name}")

def read_file(path):
    with open(os.path.join(BASE_DIR, path), 'r', encoding='utf-8') as f:
        return f.read()

print("\n" + "="*60)
print("ContraOfertaGen QA Suite — Sprint CA-1")
print("="*60)

# ============================================================
# 1. ESTRUCTURA DE ARCHIVOS
# ============================================================
print("\n📁 1. Estructura de archivos")

plantilla_path = "src/lib/plantillas/contraoferta.js"
ensamblador_path = "src/lib/plantillas/ensamblador_contraoferta.js"

log("contraoferta.js existe", 
    os.path.exists(os.path.join(BASE_DIR, plantilla_path)))

log("ensamblador_contraoferta.js existe",
    os.path.exists(os.path.join(BASE_DIR, ensamblador_path)))

# ============================================================
# 2. PLANTILLA — ESTRUCTURA
# ============================================================
print("\n📋 2. Plantilla — Estructura")

plantilla = read_file(plantilla_path)

log("Meta: id = 'contraoferta'",
    "id: 'contraoferta'" in plantilla)

log("Meta: trilingüe (es/en/fr)",
    "idiomas: ['es', 'en', 'fr']" in plantilla)

log("Partes: ofertante definido",
    "id: 'ofertante'" in plantilla)

log("Partes: propietario definido",
    "id: 'propietario'" in plantilla)

# ============================================================
# 3. PLANTILLA — 7 BLOQUES MODIFICABLES
# ============================================================
print("\n🔧 3. Plantilla — 7 bloques modificables")

bloques_esperados = [
    ("mod_precio", "Modificar precio"),
    ("mod_fecha", "Modificar fecha de formalización"),
    ("mod_notario", "Modificar notario"),
    ("mod_coordinador", "Modificar coordinador de cierre"),
    ("mod_vigencia", "Modificar vigencia de la oferta"),
    ("mod_deposito", "Modificar depósito escrow"),
    ("mod_clausula_libre", "Agregar cláusula adicional"),
]

for bloque_id, descripcion in bloques_esperados:
    log(f"{bloque_id}: {descripcion}",
        f"id: '{bloque_id}'" in plantilla and "condicional: true" in plantilla)

# Validar que mod_deposito incluye empresa
log("mod_deposito: incluye empresa escrow",
    "nueva_empresa_escrow" in plantilla)

# ============================================================
# 4. PLANTILLA — BLOQUES SIEMPRE ACTIVOS
# ============================================================
print("\n📌 4. Plantilla — Bloques siempre activos")

bloques_siempre = [
    "encabezado",
    "cierre_sin_cambios",
    "vigencia_contraoferta",
    "aceptacion",
    "firmas",
]

for bloque_id in bloques_siempre:
    log(f"{bloque_id} siempre: true",
        f"id: '{bloque_id}'" in plantilla)

# ============================================================
# 5. PLANTILLA — TRILINGÜE EN RENDERS
# ============================================================
print("\n🌐 5. Plantilla — Renders trilingües")

log("Encabezado tiene ES",
    "CONTRAOFERTA Y CONVENIO MODIFICATORIO" in plantilla)

log("Encabezado tiene EN",
    "COUNTER-OFFER AND AMENDMENT AGREEMENT" in plantilla)

log("Encabezado tiene FR",
    "CONTRE-OFFRE ET CONVENTION MODIFICATIVE" in plantilla)

log("Cierre tiene ES",
    "continuarán en pleno vigor y efecto" in plantilla)

log("Cierre tiene EN",
    "shall remain in full force and effect" in plantilla)

log("Cierre tiene FR",
    "resteront en pleine vigueur et effet" in plantilla)

# ============================================================
# 6. ENSAMBLADOR — EXPORTS
# ============================================================
print("\n⚙️ 6. Ensamblador — Exports")

ensamblador = read_file(ensamblador_path)

log("Export: ensamblarContextoContraoferta",
    "export function ensamblarContextoContraoferta" in ensamblador)

log("Export: renderizarBloquesContraoferta",
    "export function renderizarBloquesContraoferta" in ensamblador)

log("Import: generarContextoParte",
    "generarContextoParte" in ensamblador)

log("Import: bloquePrecio",
    "bloquePrecio" in ensamblador)

# ============================================================
# 7. ENSAMBLADOR — RESOLUCIÓN DE CONTEXTO
# ============================================================
print("\n🔗 7. Ensamblador — Resolución de contexto")

log("Resuelve: oferta_original",
    "ctx.oferta_original" in ensamblador)

log("Resuelve: modificaciones",
    "ctx.modificaciones" in ensamblador)

log("Resuelve: aceptacion",
    "ctx.aceptacion" in ensamblador)

log("Resuelve: quien_presenta",
    "ctx.quien_presenta" in ensamblador)

log("Calcula: fecha_limite",
    "calcularLimite" in ensamblador)

log("Resuelve: empresa escrow",
    "resolverEmpresaEscrow" in ensamblador)

log("Traduce: hora de vigencia",
    "traducirHora" in ensamblador)

# ============================================================
# 8. ENSAMBLADOR — NUMERACIÓN DINÁMICA
# ============================================================
print("\n🔢 8. Ensamblador — Numeración dinámica de cláusulas")

log("Ordinales ES definidos",
    "PRIMERA" in ensamblador and "SÉPTIMA" in ensamblador)

log("Ordinales EN definidos",
    "FIRST" in ensamblador and "SEVENTH" in ensamblador)

log("Ordinales FR definidos",
    "PREMIÈRE" in ensamblador and "SEPTIÈME" in ensamblador)

log("Reemplaza ordinales dinámicamente",
    "ctx._ordinal_es" in ensamblador)

# ============================================================
# RESULTADO
# ============================================================
print("\n" + "="*60)
total = passed + failed
print(f"RESULTADO: {passed} ✅ / {failed} ❌ — {passed}/{total} tests")
print("="*60 + "\n")

sys.exit(0 if failed == 0 else 1)
