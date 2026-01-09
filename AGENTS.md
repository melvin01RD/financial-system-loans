# AGENTS.md

Este documento define las reglas obligatorias para cualquier agente
que trabaje en este repositorio.

---

## Convenciones generales

- Usar **pnpm** exclusivamente. Prohibido npm o yarn.
- **TypeScript obligatorio**, sin excepciones.
- Preferir **ESM** y sintaxis moderna.
- No introducir dependencias sin justificación clara.

---

## Backend

- Arquitectura clara por capas:
  - `controllers` / `routes`
  - `services`
  - `repositories` o `data-access`
  - `schemas` / `validators`
- La lógica de negocio **no vive en rutas ni controladores**.
- Validación de datos obligatoria en entradas (DTO / schemas).
- Manejo explícito de errores (no silencios, no `catch` vacíos).

---

## Autenticación y autorización

- Autenticación simple (si aplica) pero **autorización por roles obligatoria**.
- Roles actuales:
  - `admin`
  - `operator`
- La autorización debe ser **centralizada** (middleware / guard).
- Nunca confiar en el frontend para control de permisos.

---

## Frontend

- Tailwind CSS como única solución de estilos.
- Componentes pequeños y reutilizables.
- Mobile-first siempre.
- Accesibilidad obligatoria:
  - HTML semántico
  - Labels, focus visible, roles ARIA cuando aplique

---

## Reglas de TypeScript

- Prohibido `any`.
- `unknown` solo si está inmediatamente refinado.
- Preferir inferencia siempre que sea posible.
- Si un tipo no está claro, detenerse y pedir aclaración.

---

## Testing y calidad

- Tests obligatorios para:
  - Lógica de negocio
  - Casos críticos (cálculos, reglas, permisos)
- Backend:
  - Unit tests para servicios
  - Tests de integración para endpoints críticos
- Frontend:
  - Playwright para flujos principales
- No se acepta código con:
  - Errores de tipos
  - Lint fallido
  - Tests fallidos

---

## Rendimiento y seguridad

- No optimizar sin medir.
- Evitar cálculos innecesarios en runtime.
- Nunca exponer datos sensibles en logs.
- Validar siempre entradas del usuario.

---

## Commits y Pull Requests

- PRs pequeños y enfocados.
- Explicar:
  - Qué cambió
  - Por qué
  - Cómo se probó
- Antes de commit:
  - pnpm lint
  - pnpm test
- Nuevas reglas → documentarlas aquí.

---

## Comportamiento del agente

- No asumir requisitos implícitos.
- Si algo no está claro, preguntar antes de ejecutar.
- Refactors, cambios de arquitectura o features grandes
  requieren confirmación previa.
- Priorizar claridad, seguridad y mantenibilidad
  por encima de rapidez.
