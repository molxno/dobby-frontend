# CLAUDE.md — Tutor Financiero Personal

## Proyecto
App web de finanzas personales que actúa como tutor financiero senior. Analiza, diagnostica, planifica y guía al usuario hacia la libertad financiera con números específicos, no consejos genéricos.

## Stack
- **React 18** + TypeScript (strict) + Vite v8
- **Tailwind CSS v4** via `@tailwindcss/vite` — NO hay `tailwind.config`, se usa `@import "tailwindcss"` en CSS
- **Zustand v5** con persist middleware → localStorage key: `tutor-financiero-store`
- **Recharts v3** para gráficas
- **React Router v7** para rutas

## Comandos
```bash
npm run dev        # Servidor de desarrollo (Vite)
npm run build      # TypeScript check + build producción
npm run typecheck  # Solo TypeScript check
npm run preview    # Preview del build
```

## Arquitectura

### Directorio
```
src/
├── store/types.ts              # TODOS los tipos TypeScript
├── store/useFinancialStore.ts  # Zustand store central
├── engines/                    # 7 motores de cálculo (funciones puras)
├── components/
│   ├── layout/                 # Sidebar, Header, Layout
│   ├── onboarding/             # Wizard de 4 pasos
│   └── shared/                 # Card, ProgressBar, Alert, Modal, etc.
├── pages/                      # 9 páginas de la app
├── utils/                      # formatters.ts, constants.ts
├── App.tsx                     # Router + routing
├── main.tsx                    # Entry point
└── index.css                   # Tailwind + estilos globales
```

### Flujo de datos
1. Usuario llena datos en **Onboarding** (o edita en cualquier página)
2. Cada mutación llama `recalculate()` automáticamente
3. `recalculate()` ejecuta los 7 motores y actualiza `financialState`
4. Todas las páginas leen de `financialState` — nunca calculan directo

### Motores de cálculo (`src/engines/`)
| Archivo | Qué hace |
|---|---|
| `financialDiagnosis.ts` | Health score 0-100, alertas, recomendaciones con impacto numérico |
| `debtStrategy.ts` | Avalanche/Snowball, amortización completa, ahorro en intereses |
| `phaseGenerator.ts` | Genera fases automáticas según situación financiera |
| `budgetOptimizer.ts` | Presupuesto por fase actual y por categoría |
| `biweeklyPlanner.ts` | Distribución quincenal con checklist |
| `goalPlanner.ts` | Secuencial/paralelo, fechas estimadas |
| `emergencyFundCalculator.ts` | Proyección a 24 meses, niveles del fondo |

### Páginas y rutas
| Ruta | Componente | Qué muestra |
|---|---|---|
| `/` | Dashboard | Health score, fases, alertas, gráficas |
| `/presupuesto` | Budget | Distribución por categoría/fase |
| `/deudas` | Debts | Inventario, amortización, estrategia |
| `/metas` | Goals | Metas con progreso y fechas |
| `/quincenal` | BiweeklyPlan | Checklist por quincena |
| `/emergencia` | EmergencyFund | Termómetro, proyección |
| `/transacciones` | Transactions | Registro con filtros |
| `/insights` | Insights | Diagnóstico completo del tutor |
| `/configuracion` | Settings | Perfil, estrategias, reset |

## Reglas de negocio
- Deudas alto interés (>1.5%/mes) **SIEMPRE** se priorizan antes de ahorro para metas
- Fondo de emergencia se construye **DESPUÉS** de deuda de alto costo, **ANTES** de metas
- Deudas bajo interés (<0.5%/mes) se pueden pagar en paralelo con ahorro
- Siempre dejar colchón 3-5% del ingreso
- **NUNCA** sugerir pagar menos del mínimo de una deuda

## Convenciones de código
- Dark mode por defecto (bg-gray-950, text-gray-100)
- Colores semánticos: verde=positivo, rojo=peligro, amarillo=warning, azul=info, morado=metas
- Montos siempre formateados con `formatCurrency()` de `utils/formatters.ts`
- IDs generados con `nanoid()` de `components/shared/nanoid.ts`
- Recharts formatter: usar `(value: unknown) => [fmt(Number(value)), '']`
- Todo componente de UI compartido vive en `components/shared/`
- Español como idioma de la UI, locale configurable por usuario

## Gotchas
- Tailwind v4 usa `@import "tailwindcss"` — NO `@tailwind base/components/utilities`
- `@tailwindcss/vite` se configura en vite.config.ts como plugin, no hay postcss.config
- Zustand persist usa `partialize` para excluir `financialState` (se recalcula)
- `onRehydrateStorage` dispara `recalculate()` tras cargar de localStorage
