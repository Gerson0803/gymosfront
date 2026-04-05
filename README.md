# GymOS Frontend MVP

GymOS is a frontend MVP for gym administrators to manage clients and monitor retention risk.

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4
- Lucide React icons

## Features

### Gestión de Miembros
- Dashboard con métricas de retención y churn predictivo
- Tabla de miembros con búsqueda, filtros y exportación CSV
- Tracking de check-ins y frecuencia de asistencia
- Cálculo automático de riesgo de abandono (churn risk)
- Alertas inteligentes de retención

### Pipeline de Ventas
- Embudo de ventas con 6 etapas (drag & drop)
- Gestión de leads y prospectos
- Tracking de conversión y probabilidades
- Atribución de fuentes (Instagram, Google, Referidos, etc.)

### Gestión de Equipamiento
- Inventario completo de equipos del gym
- Estados: Operativo, En Mantenimiento, Fuera de Servicio, Nuevo
- Tracking de mantenimientos preventivos y correctivos
- Alertas de próximo mantenimiento
- Categorización por tipo (Cardio, Pesas, Máquinas, Funcional)
- Historial de uso y horas de operación

### Analytics Avanzados
- Gráficos interactivos con Recharts
- Distribución de riesgo de churn
- Embudo de ventas visual
- Tipos de membresía
- Estado del equipamiento en tiempo real

## Status Logic

- Active: attended within 7 days
- At Risk: no attendance for 8-21 days
- Inactive: no attendance for more than 21 days

## Project Structure

```text
src/
	app/
		(dashboard)/
			clients/
				page.tsx              # Gestión de miembros
			equipment/
				page.tsx              # Gestión de equipamiento
			pipeline/
				page.tsx              # Pipeline de ventas
			layout.tsx
			page.tsx                  # Dashboard principal
		globals.css
		layout.tsx
	components/
		clients/
			enhanced-clients-table.tsx
		dashboard/
			enhanced-dashboard.tsx
		equipment/
			equipment-table.tsx
		pipeline/
			sales-pipeline.tsx
		layout/
			app-shell.tsx
			sidebar.tsx
	context/
		clients-context.tsx           # Legacy (no usado)
	lib/
		validations.ts                # Zod schemas
	store/
		useGymStore.ts                # Zustand store con persistencia
	types/
		client.ts                     # Tipos TypeScript
```

## Installation

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open http://localhost:3000

## Production Build

```bash
npm run build
npm run start
```

## Notes

- This MVP uses Zustand with localStorage persistence for demonstration purposes.
- Data persists across browser refreshes.
- Built with Next.js 16, React 19, and Tailwind CSS v4.
- Includes predictive churn risk algorithm, sales pipeline, and equipment management.
