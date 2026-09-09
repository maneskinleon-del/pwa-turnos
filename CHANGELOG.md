# Changelog

Todos los cambios notables de **PWA Turnos** se documentan en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y el proyecto sigue [Versionado Semántico](https://semver.org/lang/es/).

## [1.0.0] — 2026-09-08

### Fase 1: Calendario funcional

Primera versión estable del calendario de turnos. Checkpoint publicado y verificado.

#### Añadido

- Calendario mensual con visualización de días (grid Lun–Dom, incluye días de meses
  adyacentes para completar la cuadrícula).
- Navegación entre meses (anterior/siguiente) con manejo correcto del cambio de año,
  y botón «Hoy» para volver al mes actual.
- Tipos de turno: `WORK` (Trabajo), `REST` (Descanso), `EXTRA` (Turno extra)
  y `OFF` (Libre / sin definir).
- Edición de turnos por día mediante el editor modal (`DayEditor`), con selección
  visual del tipo y guardado.
- Persistencia en `localStorage` (clave `pwa-turnos-shifts`), con carga al iniciar
  y datos de demostración la primera vez.
- Interfaz optimizada para móvil: bottom sheet en pantallas pequeñas, touch targets
  ≥ 44px, grid responsive y modo oscuro.

#### Corregido

- Navegación de año en StrictMode: al cruzar enero/diciembre el año saltaba de a 2
  (efecto secundario dentro de un updater de estado).
- Firma del prop `onSave` entre `Calendar` y `DayEditor` (mismatch de tipos TS2322).
- Setup de tests: `@testing-library/jest-dom/vitest` y limpieza entre tests
  (`afterEach(cleanup)`).

#### Verificación

- 61/61 tests pasando (5 suites: types, storage, useShifts, DayEditor, Calendar).
- `tsc --noEmit` sin errores.
- `vite build` exitoso.
- Code review aprobada.

#### Pendiente

- Verificación visual manual (sin Chrome/Chromium disponible en el dispositivo
  de desarrollo; cubierto por tests de componentes).
## [1.0.1] — 2026-09-08

### UI / visual polish

- Celdas del calendario con relieve 3D: sombra profunda, degradado vertical y borde superior iluminado (efecto “flotante”).
- Hover con elevación sutil; celdas de meses adyacentes más planas; día actual con glow sky.
- Botón de fecha actual en el header muestra el día formateado (ej. «8 de septiembre») en lugar de solo «Hoy».
- Layout del header alineado al diseño de referencia (fecha + demo wand).

