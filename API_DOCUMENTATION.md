# API Documentation - GymOS Backend Requirements

## Overview
This document specifies all API endpoints, data structures, and contracts required by the GymOS frontend application.

**Base URL:** `https://api.yourdomain.com/v1`  
**Authentication:** JWT Bearer Token  
**Content-Type:** `application/json`

---

## Authentication

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "admin@gym.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "name": "Admin User",
      "email": "admin@gym.com",
      "role": "admin"
    }
  }
}
```

---

## 1. Members (Clientes/Miembros)

### List All Members
```http
GET /members?page=1&limit=50&search=&status=&riskLevel=
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)
- `search` (optional): Search by name or email
- `status` (optional): Filter by membershipStatus (activo|congelado|vencido|cancelado)
- `riskLevel` (optional): Filter by churnRiskLevel (bajo|medio|alto|critico)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "id": "uuid",
        "name": "Carlos Rodríguez",
        "email": "carlos@email.com",
        "phone": "+57 300 123 4567",
        "birthDate": "1990-05-15",
        "gender": "M",
        "goal": "ganar_musculo",
        "experienceLevel": "intermedio",
        "membershipType": "premium",
        "joinedAt": "2024-01-10T00:00:00Z",
        "membershipEnd": "2025-01-10T00:00:00Z",
        "monthlyPrice": 120000,
        "membershipStatus": "activo",
        "status": "active",
        "lastCheckIn": "2024-04-03T10:30:00Z",
        "checkInsLast30Days": 12,
        "averageCheckInsPerWeek": 3.5,
        "preferredSchedule": "tarde",
        "churnRiskScore": 15,
        "churnRiskLevel": "bajo",
        "acquisitionSource": "instagram",
        "assignedTrainer": "Entrenador Juan",
        "notes": "Muy comprometido",
        "createdAt": "2024-01-10T10:00:00Z",
        "updatedAt": "2024-04-05T15:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "totalPages": 3
    }
  }
}
```

### Get Single Member
```http
GET /members/:id
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Carlos Rodríguez",
    "email": "carlos@email.com",
    "phone": "+57 300 123 4567",
    "birthDate": "1990-05-15",
    "gender": "M",
    "goal": "ganar_musculo",
    "experienceLevel": "intermedio",
    "membershipType": "premium",
    "joinedAt": "2024-01-10T00:00:00Z",
    "membershipEnd": "2025-01-10T00:00:00Z",
    "monthlyPrice": 120000,
    "membershipStatus": "activo",
    "status": "active",
    "lastCheckIn": "2024-04-03T10:30:00Z",
    "checkInsLast30Days": 12,
    "averageCheckInsPerWeek": 3.5,
    "preferredSchedule": "tarde",
    "churnRiskScore": 15,
    "churnRiskLevel": "bajo",
    "acquisitionSource": "instagram",
    "assignedTrainer": "Entrenador Juan",
    "notes": "Muy comprometido",
    "attendance": [
      {
        "date": "2024-04-03T10:30:00Z",
        "duration": 60,
        "activities": ["pesas", "cardio"],
        "note": "Entrenamiento de pierna"
      }
    ],
    "createdAt": "2024-01-10T10:00:00Z",
    "updatedAt": "2024-04-05T15:30:00Z"
  }
}
```

### Create Member
```http
POST /members
```

**Request Body:**
```json
{
  "name": "María López",
  "email": "maria@email.com",
  "phone": "+57 301 234 5678",
  "birthDate": "1985-08-22",
  "gender": "F",
  "goal": "perder_peso",
  "experienceLevel": "principiante",
  "membershipType": "basica",
  "membershipEnd": "2025-02-15",
  "monthlyPrice": 80000,
  "membershipStatus": "activo",
  "preferredSchedule": "manana",
  "acquisitionSource": "google",
  "assignedTrainer": "Entrenadora Ana",
  "notes": "Objetivo: perder 10kg"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "María López",
    "email": "maria@email.com",
    "phone": "+57 301 234 5678",
    "birthDate": "1985-08-22",
    "gender": "F",
    "goal": "perder_peso",
    "experienceLevel": "principiante",
    "membershipType": "basica",
    "joinedAt": "2024-04-05T00:00:00Z",
    "membershipEnd": "2025-02-15T00:00:00Z",
    "monthlyPrice": 80000,
    "membershipStatus": "activo",
    "status": "active",
    "lastCheckIn": null,
    "checkInsLast30Days": 0,
    "averageCheckInsPerWeek": 0,
    "preferredSchedule": "manana",
    "churnRiskScore": 25,
    "churnRiskLevel": "medio",
    "acquisitionSource": "google",
    "assignedTrainer": "Entrenadora Ana",
    "notes": "Objetivo: perder 10kg",
    "createdAt": "2024-04-05T10:00:00Z",
    "updatedAt": "2024-04-05T10:00:00Z"
  }
}
```

### Update Member
```http
PATCH /members/:id
```

**Request Body:**
```json
{
  "phone": "+57 301 999 8888",
  "notes": "Actualización de teléfono"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "María López",
    "email": "maria@email.com",
    "phone": "+57 301 999 8888",
    "notes": "Actualización de teléfono",
    "updatedAt": "2024-04-05T15:30:00Z"
  }
}
```

### Delete Member
```http
DELETE /members/:id
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Miembro eliminado correctamente"
}
```

### Record Check-in
```http
POST /members/:id/checkin
```

**Request Body:**
```json
{
  "duration": 60,
  "activities": ["pesas", "cardio"],
  "note": "Entrenamiento completo"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "checkIn": {
      "date": "2024-04-05T10:30:00Z",
      "duration": 60,
      "activities": ["pesas", "cardio"],
      "note": "Entrenamiento completo"
    },
    "updatedStats": {
      "checkInsLast30Days": 13,
      "averageCheckInsPerWeek": 3.7,
      "lastCheckIn": "2024-04-05T10:30:00Z",
      "churnRiskScore": 12,
      "churnRiskLevel": "bajo",
      "status": "active"
    }
  }
}
```

### Export Members to CSV
```http
GET /members/export/csv?status=&riskLevel=
```

**Response:** File download (text/csv)

---

## 2. Leads (Prospectos/Pipeline)

### List All Leads
```http
GET /leads?page=1&limit=50&status=&source=
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by status (nuevo|contactado|tour_agendado|propuesta|negociacion|cerrado_ganado|cerrado_perdido)
- `source`: Filter by source (instagram|google|referido|walk_in|facebook)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "leads": [
      {
        "id": "uuid",
        "name": "Roberto Gómez",
        "email": "roberto@email.com",
        "phone": "+57 305 678 9012",
        "fitnessGoal": "Perder 10kg en 3 meses",
        "budget": 100000,
        "source": "instagram",
        "status": "tour_agendado",
        "assignedAdvisor": "Asesor María",
        "conversionProbability": 65,
        "notes": "Interesado en plan premium",
        "createdAt": "2024-03-20T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 45,
      "totalPages": 1
    }
  }
}
```

### Create Lead
```http
POST /leads
```

**Request Body:**
```json
{
  "name": "Patricia Ruiz",
  "email": "patricia@email.com",
  "phone": "+57 306 789 0123",
  "fitnessGoal": "Tonificar después del embarazo",
  "budget": 80000,
  "source": "referido",
  "assignedAdvisor": "Asesor Carlos",
  "notes": "Referida por miembro actual"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Patricia Ruiz",
    "email": "patricia@email.com",
    "phone": "+57 306 789 0123",
    "fitnessGoal": "Tonificar después del embarazo",
    "budget": 80000,
    "source": "referido",
    "status": "nuevo",
    "assignedAdvisor": "Asesor Carlos",
    "conversionProbability": 55,
    "notes": "Referida por miembro actual",
    "createdAt": "2024-04-05T10:00:00Z"
  }
}
```

### Update Lead
```http
PATCH /leads/:id
```

**Request Body:**
```json
{
  "status": "propuesta",
  "notes": "Propuesta enviada por email"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "propuesta",
    "conversionProbability": 75,
    "updatedAt": "2024-04-05T15:30:00Z"
  }
}
```

### Move Lead (Change Status)
```http
PATCH /leads/:id/status
```

**Request Body:**
```json
{
  "status": "cerrado_ganado"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "cerrado_ganado",
    "conversionProbability": 100,
    "closedAt": "2024-04-05T15:30:00Z"
  }
}
```

### Delete Lead
```http
DELETE /leads/:id
```

---

## 3. Equipment (Equipamiento)

### List All Equipment
```http
GET /equipment?page=1&limit=50&category=&status=
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `category`: Filter by category (cardio|pesas|maquinas|funcional|accesorios)
- `status`: Filter by status (operativo|en_mantenimiento|fuera_servicio|nuevo)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "equipment": [
      {
        "id": "uuid",
        "name": "Cinta de Correr Pro",
        "category": "cardio",
        "brand": "Technogym",
        "model": "Run 500",
        "serialNumber": "TG-2024-001",
        "purchaseDate": "2023-06-15T00:00:00Z",
        "warrantyEnd": "2025-06-15T00:00:00Z",
        "price": 8500000,
        "status": "operativo",
        "location": "Zona Cardio",
        "lastMaintenance": "2024-03-21T00:00:00Z",
        "nextMaintenance": "2024-04-20T00:00:00Z",
        "maintenanceIntervalDays": 30,
        "totalUsageHours": 450,
        "notes": "Mantenimiento mensual programado",
        "createdAt": "2023-06-15T10:00:00Z",
        "updatedAt": "2024-04-05T15:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 25,
      "totalPages": 1
    }
  }
}
```

### Create Equipment
```http
POST /equipment
```

**Request Body:**
```json
{
  "name": "Bicicleta Estática",
  "category": "cardio",
  "brand": "Life Fitness",
  "model": "IC7",
  "serialNumber": "LF-2024-002",
  "purchaseDate": "2024-04-05",
  "warrantyEnd": "2026-04-05",
  "price": 4200000,
  "status": "nuevo",
  "location": "Zona Cardio",
  "maintenanceIntervalDays": 30,
  "notes": "Equipo nuevo"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Bicicleta Estática",
    "category": "cardio",
    "brand": "Life Fitness",
    "model": "IC7",
    "serialNumber": "LF-2024-002",
    "purchaseDate": "2024-04-05T00:00:00Z",
    "warrantyEnd": "2026-04-05T00:00:00Z",
    "price": 4200000,
    "status": "nuevo",
    "location": "Zona Cardio",
    "lastMaintenance": null,
    "nextMaintenance": "2024-05-05T00:00:00Z",
    "maintenanceIntervalDays": 30,
    "totalUsageHours": 0,
    "notes": "Equipo nuevo",
    "maintenanceHistory": [],
    "createdAt": "2024-04-05T10:00:00Z",
    "updatedAt": "2024-04-05T10:00:00Z"
  }
}
```

### Update Equipment
```http
PATCH /equipment/:id
```

**Request Body:**
```json
{
  "status": "en_mantenimiento",
  "notes": "Requiere ajuste de resistencia"
}
```

### Schedule Maintenance
```http
POST /equipment/:id/maintenance
```

**Request Body:**
```json
{
  "type": "preventivo",
  "description": "Mantenimiento mensual preventivo",
  "technician": "Técnico Juan Pérez",
  "cost": 150000,
  "scheduledDate": "2024-04-20T09:00:00Z",
  "notes": "Revisión completa del equipo"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "maintenance": {
      "id": "uuid",
      "equipmentId": "uuid",
      "type": "preventivo",
      "description": "Mantenimiento mensual preventivo",
      "technician": "Técnico Juan Pérez",
      "cost": 150000,
      "scheduledDate": "2024-04-20T09:00:00Z",
      "status": "pendiente",
      "notes": "Revisión completa del equipo",
      "createdAt": "2024-04-05T10:00:00Z"
    }
  }
}
```

### Complete Maintenance
```http
PATCH /equipment/:equipmentId/maintenance/:maintenanceId/complete
```

**Request Body:**
```json
{
  "notes": "Mantenimiento completado exitosamente. Se reemplazaron correas."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "maintenance": {
      "id": "uuid",
      "status": "completado",
      "completedDate": "2024-04-20T11:00:00Z",
      "notes": "Mantenimiento completado exitosamente. Se reemplazaron correas."
    },
    "equipment": {
      "id": "uuid",
      "status": "operativo",
      "lastMaintenance": "2024-04-20T11:00:00Z",
      "nextMaintenance": "2024-05-20T00:00:00Z"
    }
  }
}
```

### Get Maintenance History
```http
GET /equipment/:id/maintenance
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "maintenanceHistory": [
      {
        "id": "uuid",
        "equipmentId": "uuid",
        "type": "preventivo",
        "description": "Mantenimiento mensual",
        "technician": "Técnico Juan",
        "cost": 150000,
        "scheduledDate": "2024-03-20T09:00:00Z",
        "completedDate": "2024-03-20T11:00:00Z",
        "status": "completado",
        "notes": "Todo en orden",
        "createdAt": "2024-03-15T10:00:00Z"
      }
    ]
  }
}
```

---

## 4. Retention Alerts (Alertas de Retención)

### List Active Alerts
```http
GET /alerts?severity=&status=
```

**Query Parameters:**
- `severity`: Filter by severity (critica|accion_requerida|informativa)
- `status`: Filter by status (pendiente|en_progreso|resuelta)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "uuid",
        "clientId": "uuid",
        "clientName": "María López",
        "type": "ausencia_prolongada",
        "severity": "critica",
        "description": "No ha asistido en 9 días",
        "daysSinceLastVisit": 9,
        "recommendedAction": "Llamada urgente",
        "status": "pendiente",
        "createdAt": "2024-04-05T10:00:00Z"
      }
    ]
  }
}
```

### Resolve Alert
```http
PATCH /alerts/:id/resolve
```

**Request Body:**
```json
{
  "notes": "Miembro contactado, regresará mañana"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "resuelta",
    "resolvedAt": "2024-04-05T15:30:00Z",
    "notes": "Miembro contactado, regresará mañana"
  }
}
```

---

## 5. Dashboard Analytics

### Get Dashboard Metrics
```http
GET /dashboard/metrics
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "members": {
      "total": 150,
      "active": 120,
      "atRisk": 20,
      "inactive": 10
    },
    "revenue": {
      "monthlyRevenue": 14400000,
      "averageLTV": 1440000,
      "projectedAnnual": 172800000
    },
    "churn": {
      "churnRate": 13.33,
      "highRiskMembers": 20
    },
    "pipeline": {
      "totalLeads": 45,
      "potentialValue": 4500000,
      "conversionRate": 35.5
    },
    "equipment": {
      "total": 25,
      "operational": 20,
      "inMaintenance": 3,
      "outOfService": 2
    }
  }
}
```

### Get Churn Risk Distribution
```http
GET /dashboard/churn-distribution
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    { "name": "Bajo Riesgo", "value": 100 },
    { "name": "Riesgo Medio", "value": 30 },
    { "name": "Alto/Crítico", "value": 20 }
  ]
}
```

### Get Sales Pipeline Data
```http
GET /dashboard/pipeline-data
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    { "stage": "nuevo", "count": 15, "value": 1500000 },
    { "stage": "contactado", "count": 10, "value": 1000000 },
    { "stage": "tour_agendado", "count": 8, "value": 800000 },
    { "stage": "propuesta", "count": 6, "value": 600000 },
    { "stage": "negociacion", "count": 4, "value": 400000 },
    { "stage": "cerrado_ganado", "count": 2, "value": 200000 }
  ]
}
```

### Get Membership Types Distribution
```http
GET /dashboard/membership-types
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    { "type": "Basica", "count": 50 },
    { "type": "Premium", "count": 60 },
    { "type": "Vip", "count": 30 },
    { "type": "Estudiante", "count": 10 }
  ]
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El email es inválido",
    "details": [
      {
        "field": "email",
        "message": "Debe ser un email válido"
      }
    ]
  }
}
```

**Common HTTP Status Codes:**
- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Enumerations

### Membership Types
- `basica`
- `premium`
- `vip`
- `estudiante`

### Fitness Goals
- `perder_peso`
- `ganar_musculo`
- `resistencia`
- `salud_general`
- `rendimiento`

### Experience Levels
- `principiante`
- `intermedio`
- `avanzado`

### Gender
- `M`
- `F`
- `Otro`

### Lead Status
- `nuevo`
- `contactado`
- `tour_agendado`
- `tour_realizado`
- `propuesta`
- `negociacion`
- `cerrado_ganado`
- `cerrado_perdido`

### Lead Sources
- `instagram`
- `google`
- `referido`
- `walk_in`
- `facebook`

### Equipment Categories
- `cardio`
- `pesas`
- `maquinas`
- `funcional`
- `accesorios`

### Equipment Status
- `operativo`
- `en_mantenimiento`
- `fuera_servicio`
- `nuevo`

### Maintenance Types
- `preventivo`
- `correctivo`
- `inspeccion`

### Maintenance Status
- `pendiente`
- `en_progreso`
- `completado`

### Alert Types
- `ausencia_prolongada`
- `pago_fallido`
- `bajo_engagement`
- `queja_reciente`
- `cumpleanos_proximo`
- `milestone_alcanzado`

### Alert Severity
- `informativa`
- `accion_requerida`
- `critica`

### Alert Status
- `pendiente`
- `en_progreso`
- `resuelta`

### Client Status (Calculated)
- `active` (last check-in ≤ 7 days)
- `at-risk` (last check-in 8-21 days)
- `inactive` (last check-in > 21 days)

### Churn Risk Levels
- `bajo` (score 0-24)
- `medio` (score 25-49)
- `alto` (score 50-74)
- `critico` (score 75-100)

---

## Business Logic Notes for Backend

### Churn Risk Calculation
The backend should calculate churn risk score (0-100) based on:
1. **Days since last visit** (40% weight):
   - > 14 days: +40 points
   - 8-14 days: +25 points
   - 4-7 days: +10 points
   - ≤ 3 days: +0 points

2. **Frequency vs expected** (30% weight):
   - Expected visits/week: principiante=2, intermedio=3.5, avanzado=4.5
   - Ratio < 0.3: +30 points
   - Ratio 0.3-0.6: +15 points
   - Ratio 0.6-0.8: +5 points

3. **Membership expiry** (20% weight):
   - < 7 days: +20 points
   - 7-30 days: +10 points

4. **Experience level** (10% weight):
   - principiante: +10 points

**Risk Levels:**
- 0-24: bajo
- 25-49: medio
- 50-74: alto
- 75-100: critico

### Client Status Calculation
Based on `lastCheckIn`:
- ≤ 7 days ago: `active`
- 8-21 days ago: `at-risk`
- > 21 days ago: `inactive`
- No check-ins: `inactive`

### Lead Conversion Probability
Auto-calculate based on:
- Base: 30%
- Source `referido`: +25%
- Source `instagram`: +15%
- Budget ≥ 100000: +10%
- Max: 95%

### Maintenance Scheduling
When equipment is created or maintenance completed:
- `nextMaintenance` = `lastMaintenance` + `maintenanceIntervalDays`
- If `nextMaintenance` < today: Mark as overdue
- If `nextMaintenance` within 7 days: Show warning

---

## Rate Limiting
- General endpoints: 100 requests/minute per user
- Export endpoints: 10 requests/hour per user

## Versioning
All endpoints are versioned with `/v1/` prefix. Future versions will use `/v2/`, etc.

## Webhooks (Optional - Future)
Consider implementing webhooks for:
- New member registration
- Lead status changes
- Equipment maintenance due
- Critical alerts generated

---

## Contact
For questions about API specifications, contact the frontend team.
