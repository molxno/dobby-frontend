# Contribuir al Tutor Financiero Personal

Gracias por tu interes en contribuir. Este documento explica como hacerlo de forma organizada.

---

## Antes de empezar

1. **Lee el README** para entender el proyecto y su arquitectura
2. **Revisa los issues abiertos** — quiza alguien ya esta trabajando en lo mismo
3. **Para features grandes**, abre un issue primero para discutir el enfoque

## Setup del entorno

```bash
# Clonar tu fork
git clone https://github.com/<tu-usuario>/administra-gastos.git
cd administra-gastos

# Instalar dependencias
npm install

# Configurar git hooks (OBLIGATORIO)
git config core.hooksPath .githooks

# Verificar que todo funciona
npm run precommit
```

Si `npm run precommit` pasa (typecheck + 113 tests + coverage), estas listo.

---

## Gitflow

### Ramas

| Rama | Proposito |
|---|---|
| `main` | Produccion. **NO push directo.** Solo PRs desde `dev`. |
| `dev` | Integracion. PRs desde feature branches. |
| `feat/<nombre>` | Features nuevas |
| `fix/<nombre>` | Bug fixes |
| `refactor/<nombre>` | Refactorizaciones |
| `hotfix/<nombre>` | Fixes urgentes (desde `main`) |

### Proceso

```bash
# 1. Sincronizar con dev
git checkout dev
git pull origin dev

# 2. Crear tu rama
git checkout -b feat/mi-feature

# 3. Trabajar y commitear
# ... hacer cambios ...
git add <archivos>
git commit -m "feat(engine): add inflation adjustment to goal planner"

# 4. Push
git push -u origin feat/mi-feature

# 5. Crear PR hacia dev en GitHub
```

### Reglas de PR

- Todo PR va hacia `dev`, nunca directamente a `main`
- Requiere al menos 1 review de un maintainer
- CI debe pasar (typecheck + tests + coverage >= 80%)
- Conventional Commits en todos los commits del PR
- Descripcion clara de que cambia y por que

---

## Conventional Commits

**Todos los commits deben seguir este formato.** El hook `commit-msg` lo valida automaticamente.

```
<type>(<scope>): <descripcion corta en ingles>
```

### Types

| Type | Cuando usarlo |
|---|---|
| `feat` | Nueva funcionalidad visible al usuario |
| `fix` | Correccion de bug |
| `refactor` | Cambio de codigo sin nueva feature ni fix |
| `perf` | Mejora de rendimiento |
| `style` | Formato de codigo (NO CSS) |
| `docs` | Documentacion |
| `test` | Agregar o modificar tests |
| `chore` | Mantenimiento, deps, config |
| `ci` | Cambios en CI/CD o hooks |

### Scopes

`engine`, `store`, `ui`, `onboarding`, `dashboard`, `budget`, `debts`, `goals`, `biweekly`, `emergency`, `transactions`, `insights`, `settings`, `deps`

### Ejemplos

```
feat(engine): add inflation adjustment to goal planner
fix(store): prevent recalculate loop on rehydration
test(engine): add edge cases for debt strategy
chore(deps): update recharts to v3.9
docs: update README with new architecture diagram
refactor(ui): extract shared chart config
```

---

## Testing

### Requisitos

- **Cobertura minima: 80%** en statements, branches, functions y lines
- El pre-commit hook bloquea commits que no cumplan
- Scope de cobertura: `src/engines/` y `src/utils/`

### Escribir tests

```bash
# Correr tests
npm run test

# Tests en modo watch (recomendado para desarrollo)
npm run test:watch

# Tests con cobertura
npm run test:coverage
```

### Convenciones

- Tests junto al archivo fuente: `miArchivo.ts` → `miArchivo.test.ts`
- Usar `describe/it/expect` de Vitest
- Patron Arrange-Act-Assert
- Nombres descriptivos: `should [comportamiento] when [condicion]`

```typescript
import { describe, it, expect } from 'vitest'

describe('miFuncion', () => {
  it('should return X when given Y', () => {
    // Arrange
    const input = ...
    // Act
    const result = miFuncion(input)
    // Assert
    expect(result).toBe(expected)
  })
})
```

### Que testear

| Prioridad | Que | Por que |
|---|---|---|
| Alta | Engines (`src/engines/`) | Logica de negocio critica |
| Alta | Utils (`src/utils/`) | Funciones compartidas |
| Media | Store actions | Flujo de datos |
| Baja | Componentes | Solo si tienen logica compleja |

---

## Reglas de negocio (NO violar)

Estas son invariantes del sistema. Si tu PR las viola, sera rechazado:

1. Deudas alto interes (>1.5%/mes) **SIEMPRE** se priorizan antes de ahorro para metas
2. Fondo de emergencia se construye **DESPUES** de deuda de alto costo, **ANTES** de metas
3. **NUNCA** sugerir pagar menos del minimo de una deuda
4. Siempre dejar colchon 3-5% del ingreso
5. Engines son **funciones puras** — sin side effects, sin acceso al store
6. Las paginas leen de `financialState` — **nunca calculan directo**

---

## Convenciones de codigo

- **TypeScript strict** — no `any`, no `@ts-ignore`
- **Dark mode first** — `bg-gray-950`, `text-gray-100`
- **Colores semanticos** — verde=positivo, rojo=peligro, amarillo=warning, azul=info, morado=metas
- **Montos** — siempre con `formatCurrency()` de `utils/formatters.ts`
- **IDs** — generados con `nanoid()` de `components/shared/nanoid.ts`
- **Tailwind v4** — usa `@import "tailwindcss"`, NO `@tailwind base/components/utilities`
- **Componentes compartidos** — todo UI reutilizable en `components/shared/`
- **Idioma UI** — Espanol

---

## Estructura de un buen PR

### Titulo
```
feat(engine): add inflation adjustment to goal planner
```

### Descripcion
- Que cambia y por que
- Como probarlo
- Screenshots si hay cambios de UI

### Checklist
- [ ] Mis cambios siguen las convenciones del proyecto
- [ ] He escrito tests para los cambios
- [ ] `npm run precommit` pasa sin errores
- [ ] He actualizado la documentacion si aplica

---

## Reportar bugs

Usa el [template de bug report](.github/ISSUE_TEMPLATE/bug_report.md). Incluye:

1. Pasos para reproducir
2. Comportamiento esperado vs actual
3. Screenshot o console errors
4. Navegador y version

## Proponer features

Usa el [template de feature request](.github/ISSUE_TEMPLATE/feature_request.md). Incluye:

1. Problema que resuelve
2. Solucion propuesta
3. Alternativas consideradas

---

## Codigo de conducta

Se respetuoso. Este es un proyecto open source mantenido por voluntarios. Trata a los demas como te gustaria que te trataran.

---

## Preguntas?

Abre un issue con la etiqueta `question`.
