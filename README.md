# Tutor Financiero Personal

App web de finanzas personales que actúa como un **tutor financiero senior**. No es un simple tracker de gastos — es un sistema inteligente que analiza tu situación, diagnostica problemas, genera planes automáticos y te guía paso a paso hacia la libertad financiera.

## Características

- **Diagnóstico financiero** — Puntaje de salud 0-100 con alertas y recomendaciones específicas
- **Estrategia de deuda** — Avalanche o Snowball con tabla de amortización y ahorro en intereses
- **Fases automáticas** — El sistema genera un roadmap personalizado basado en tu situación
- **Plan quincenal** — Checklist por quincena con distribución óptima de pagos
- **Metas financieras** — Modo secuencial o paralelo con fechas estimadas
- **Fondo de emergencia** — Proyección a 24 meses con niveles y termómetro visual
- **Presupuesto por fase** — El presupuesto cambia según la fase en la que estés
- **Insights del tutor** — Recomendaciones numéricas específicas, no consejos genéricos

## Tech Stack

| Tecnología | Versión | Uso |
|---|---|---|
| React | 18 | UI |
| TypeScript | 5 | Tipos estrictos |
| Vite | 8 | Build tool |
| Tailwind CSS | 4 | Estilos (dark mode) |
| Zustand | 5 | Estado global + localStorage |
| Recharts | 3 | Gráficas |
| React Router | 7 | Navegación |

## Inicio rápido

```bash
npm install
npm run dev
```

Abre `http://localhost:5173` — el wizard de onboarding te guiará por la configuración inicial.

## Scripts

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run preview    # Preview del build
npm run typecheck  # Verificación de tipos
```

## Cómo funciona

1. **Onboarding** — Ingresa tus ingresos, gastos, deudas y metas
2. **Auto-cálculo** — Los 7 motores generan diagnóstico, fases, presupuestos y planes
3. **Dashboard** — Ve tu salud financiera, fase actual y próximo paso
4. **Actúa** — Sigue el plan quincenal y marca las tareas completadas
5. **Itera** — Cada cambio recalcula todo automáticamente

## Sin backend

Todo corre 100% en el navegador. Los datos se guardan en `localStorage`. No se envía nada a ningún servidor.
