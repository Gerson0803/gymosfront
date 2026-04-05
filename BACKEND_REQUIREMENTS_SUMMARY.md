# Backend Requirements - Quick Summary

## 📋 Overview for Backend Team

**Project:** GymOS - Gym Management CRM  
**Frontend Tech:** Next.js 16, React 19, TypeScript, Zustand  
**API Style:** RESTful JSON  
**Authentication:** JWT Bearer Token  

---

## 🎯 Core Resources (5 Main Entities)

### 1. **Members** (Miembros/Clientes)
- Full CRUD operations
- Check-in tracking with automatic churn risk recalculation
- Search, filter, pagination
- CSV export
- **Key fields:** membershipType, churnRiskScore, lastCheckIn, attendance history

### 2. **Leads** (Prospectos/Ventas)
- Full CRUD operations
- Status pipeline management (8 stages)
- Conversion probability auto-calculation
- **Key fields:** status, budget, source, conversionProbability

### 3. **Equipment** (Equipamiento)
- Full CRUD operations
- Maintenance scheduling and tracking
- Status management (operativo/en_mantenimiento/fuera_servicio/nuevo)
- Usage hours tracking
- **Key fields:** category, maintenanceIntervalDays, nextMaintenance, totalUsageHours

### 4. **Maintenance Records** (Historial de Mantenimiento)
- Linked to Equipment
- Schedule, complete, track costs
- Types: preventivo, correctivo, inspeccion

### 5. **Retention Alerts** (Alertas de Retención)
- Auto-generated based on member behavior
- Severity levels: critica, accion_requerida, informativa
- Resolution tracking

---

## 🔑 Critical Business Logic

### Churn Risk Algorithm (Backend should calculate)
```
Score = (days_since_visit * 0.4) + (frequency_ratio * 0.3) + (expiry_urgency * 0.2) + (experience_factor * 0.1)

Risk Levels:
- 0-24: bajo
- 25-49: medio  
- 50-74: alto
- 75-100: critico
```

### Client Status (Auto-calculated)
```
lastCheckIn <= 7 days → active
lastCheckIn 8-21 days → at-risk
lastCheckIn > 21 days → inactive
```

### Lead Probability (Auto-calculated)
```
Base: 30%
+25% if source = referido
+15% if source = instagram
+10% if budget >= 100000
Max: 95%
```

---

## 📊 Dashboard Analytics Endpoints Needed

1. `GET /dashboard/metrics` - Aggregated KPIs
2. `GET /dashboard/churn-distribution` - Pie chart data
3. `GET /dashboard/pipeline-data` - Sales funnel
4. `GET /dashboard/membership-types` - Membership distribution

---

## 🗄️ Database Schema Hints

### Members Table
```sql
members (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  birthDate DATE,
  gender ENUM('M', 'F', 'Otro'),
  goal ENUM(...),
  experienceLevel ENUM(...),
  membershipType ENUM(...),
  joinedAt TIMESTAMP,
  membershipEnd TIMESTAMP,
  monthlyPrice DECIMAL,
  membershipStatus ENUM(...),
  status ENUM('active', 'at-risk', 'inactive'), -- calculated
  lastCheckIn TIMESTAMP,
  checkInsLast30Days INT,
  averageCheckInsPerWeek DECIMAL,
  preferredSchedule ENUM(...),
  churnRiskScore INT, -- calculated
  churnRiskLevel ENUM(...), -- calculated
  acquisitionSource ENUM(...),
  assignedTrainer VARCHAR(255),
  notes TEXT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)
```

### Attendance History Table
```sql
attendance (
  id UUID PRIMARY KEY,
  memberId UUID REFERENCES members(id),
  date TIMESTAMP,
  duration INT, -- minutes
  activities JSONB, -- array of strings
  note TEXT
)
```

### Leads Table
```sql
leads (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  fitnessGoal TEXT,
  budget DECIMAL,
  source ENUM(...),
  status ENUM(...),
  assignedAdvisor VARCHAR(255),
  conversionProbability INT, -- calculated
  notes TEXT,
  createdAt TIMESTAMP,
  closedAt TIMESTAMP NULL
)
```

### Equipment Table
```sql
equipment (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  category ENUM(...),
  brand VARCHAR(255),
  model VARCHAR(255),
  serialNumber VARCHAR(255) UNIQUE,
  purchaseDate DATE,
  warrantyEnd DATE,
  price DECIMAL,
  status ENUM(...),
  location VARCHAR(255),
  lastMaintenance TIMESTAMP,
  nextMaintenance TIMESTAMP,
  maintenanceIntervalDays INT,
  totalUsageHours INT,
  notes TEXT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)
```

### Maintenance Records Table
```sql
maintenance_records (
  id UUID PRIMARY KEY,
  equipmentId UUID REFERENCES equipment(id),
  type ENUM('preventivo', 'correctivo', 'inspeccion'),
  description TEXT,
  technician VARCHAR(255),
  cost DECIMAL,
  scheduledDate TIMESTAMP,
  completedDate TIMESTAMP NULL,
  status ENUM('pendiente', 'en_progreso', 'completado'),
  notes TEXT,
  createdAt TIMESTAMP
)
```

### Retention Alerts Table
```sql
retention_alerts (
  id UUID PRIMARY KEY,
  clientId UUID REFERENCES members(id),
  clientName VARCHAR(255),
  type ENUM(...),
  severity ENUM(...),
  description TEXT,
  daysSinceLastVisit INT,
  recommendedAction TEXT,
  status ENUM('pendiente', 'en_progreso', 'resuelta'),
  createdAt TIMESTAMP,
  resolvedAt TIMESTAMP NULL
)
```

---

## 🔐 Authentication & Authorization

### Roles
- `admin`: Full access
- `trainer`: View members, record check-ins
- `advisor`: Manage leads, view pipeline

### JWT Payload Example
```json
{
  "userId": "uuid",
  "email": "admin@gym.com",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234571490
}
```

---

## 📈 Performance Requirements

- **Pagination:** All list endpoints must support pagination
- **Indexing:** Index on frequently filtered fields (status, category, riskLevel)
- **Caching:** Consider caching dashboard metrics (TTL: 5 minutes)
- **Rate Limiting:** 100 req/min per user

---

## 🚀 Priority Order for Implementation

### Phase 1 (Core - Week 1-2)
1. ✅ Authentication (login, JWT)
2. ✅ Members CRUD + Check-in endpoint
3. ✅ Leads CRUD + Status update
4. ✅ Basic dashboard metrics

### Phase 2 (Equipment - Week 3)
5. ✅ Equipment CRUD
6. ✅ Maintenance scheduling/completion
7. ✅ Equipment status updates

### Phase 3 (Advanced - Week 4)
8. ✅ Retention alerts (auto-generation logic)
9. ✅ Advanced analytics endpoints
10. ✅ CSV export
11. ✅ Webhooks (optional)

---

## 📝 Important Notes

1. **All timestamps in ISO 8601 format** (`2024-04-05T10:30:00Z`)
2. **Currency in Colombian Pesos (COP)** as integers (no decimals)
3. **UUIDs for all IDs** (not auto-increment integers)
4. **Soft deletes preferred** (add `deletedAt` field instead of hard delete)
5. **Audit trail:** Track `createdAt` and `updatedAt` for all resources
6. **Validation:** Backend must validate all input (don't trust frontend)
7. **Error messages:** Return clear, actionable error messages in Spanish

---

## 📞 Questions?

Refer to `API_DOCUMENTATION.md` for detailed endpoint specifications, request/response examples, and enumeration values.

**Frontend Contact:** [Your Name/Team]  
**Repository:** [Link to frontend repo]
