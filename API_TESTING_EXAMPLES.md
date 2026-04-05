# API Testing Examples (cURL)

## Authentication

### Login
```bash
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gym.com",
    "password": "password123"
  }'
```

**Save the token:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Members Endpoints

### List Members
```bash
curl -X GET "http://localhost:3000/v1/members?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Filter by Risk Level
```bash
curl -X GET "http://localhost:3000/v1/members?riskLevel=alto" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Single Member
```bash
curl -X GET http://localhost:3000/v1/members/{member-id} \
  -H "Authorization: Bearer $TOKEN"
```

### Create Member
```bash
curl -X POST http://localhost:3000/v1/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@email.com",
    "phone": "+57 300 111 2222",
    "birthDate": "1990-05-15",
    "gender": "M",
    "goal": "ganar_musculo",
    "experienceLevel": "principiante",
    "membershipType": "basica",
    "membershipEnd": "2025-05-15",
    "monthlyPrice": 80000,
    "membershipStatus": "activo",
    "preferredSchedule": "tarde",
    "acquisitionSource": "instagram",
    "notes": "Primer miembro de prueba"
  }'
```

### Update Member
```bash
curl -X PATCH http://localhost:3000/v1/members/{member-id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+57 300 999 8888",
    "notes": "Teléfono actualizado"
  }'
```

### Record Check-in
```bash
curl -X POST http://localhost:3000/v1/members/{member-id}/checkin \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 60,
    "activities": ["pesas", "cardio"],
    "note": "Entrenamiento de cuerpo completo"
  }'
```

### Delete Member
```bash
curl -X DELETE http://localhost:3000/v1/members/{member-id} \
  -H "Authorization: Bearer $TOKEN"
```

### Export to CSV
```bash
curl -X GET "http://localhost:3000/v1/members/export/csv" \
  -H "Authorization: Bearer $TOKEN" \
  --output members.csv
```

---

## Leads Endpoints

### List Leads
```bash
curl -X GET "http://localhost:3000/v1/leads?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### Filter by Status
```bash
curl -X GET "http://localhost:3000/v1/leads?status=nuevo" \
  -H "Authorization: Bearer $TOKEN"
```

### Create Lead
```bash
curl -X POST http://localhost:3000/v1/leads \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "María González",
    "email": "maria.g@email.com",
    "phone": "+57 301 222 3333",
    "fitnessGoal": "Perder peso después del embarazo",
    "budget": 100000,
    "source": "referido",
    "assignedAdvisor": "Asesor Carlos",
    "notes": "Referida por cliente actual"
  }'
```

### Update Lead Status
```bash
curl -X PATCH http://localhost:3000/v1/leads/{lead-id}/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "tour_agendado"
  }'
```

### Move Through Pipeline
```bash
# Contactado
curl -X PATCH http://localhost:3000/v1/leads/{lead-id}/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "contactado"}'

# Tour Agendado
curl -X PATCH http://localhost:3000/v1/leads/{lead-id}/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "tour_agendado"}'

# Propuesta Enviada
curl -X PATCH http://localhost:3000/v1/leads/{lead-id}/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "propuesta"}'

# Negociación
curl -X PATCH http://localhost:3000/v1/leads/{lead-id}/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "negociacion"}'

# Cerrado Ganado 🎉
curl -X PATCH http://localhost:3000/v1/leads/{lead-id}/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "cerrado_ganado"}'
```

---

## Equipment Endpoints

### List Equipment
```bash
curl -X GET "http://localhost:3000/v1/equipment?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### Filter by Category
```bash
curl -X GET "http://localhost:3000/v1/equipment?category=cardio" \
  -H "Authorization: Bearer $TOKEN"
```

### Filter by Status
```bash
curl -X GET "http://localhost:3000/v1/equipment?status=en_mantenimiento" \
  -H "Authorization: Bearer $TOKEN"
```

### Create Equipment
```bash
curl -X POST http://localhost:3000/v1/equipment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cinta de Correr Technogym",
    "category": "cardio",
    "brand": "Technogym",
    "model": "Run 500",
    "serialNumber": "TG-2024-001",
    "purchaseDate": "2024-01-15",
    "warrantyEnd": "2026-01-15",
    "price": 8500000,
    "status": "nuevo",
    "location": "Zona Cardio",
    "maintenanceIntervalDays": 30,
    "notes": "Equipo nuevo adquirido"
  }'
```

### Update Equipment Status
```bash
curl -X PATCH http://localhost:3000/v1/equipment/{equipment-id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "en_mantenimiento",
    "notes": "Requiere ajuste de correas"
  }'
```

### Schedule Maintenance
```bash
curl -X POST http://localhost:3000/v1/equipment/{equipment-id}/maintenance \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "preventivo",
    "description": "Mantenimiento mensual preventivo",
    "technician": "Técnico Juan Pérez",
    "cost": 150000,
    "scheduledDate": "2024-05-01T09:00:00Z",
    "notes": "Revisión completa del equipo"
  }'
```

### Complete Maintenance
```bash
curl -X PATCH http://localhost:3000/v1/equipment/{equipment-id}/maintenance/{maintenance-id}/complete \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Mantenimiento completado. Se reemplazaron correas y se lubricó la cinta."
  }'
```

### Get Maintenance History
```bash
curl -X GET http://localhost:3000/v1/equipment/{equipment-id}/maintenance \
  -H "Authorization: Bearer $TOKEN"
```

---

## Alerts Endpoints

### List Active Alerts
```bash
curl -X GET "http://localhost:3000/v1/alerts?status=pendiente" \
  -H "Authorization: Bearer $TOKEN"
```

### Filter by Severity
```bash
curl -X GET "http://localhost:3000/v1/alerts?severity=critica" \
  -H "Authorization: Bearer $TOKEN"
```

### Resolve Alert
```bash
curl -X PATCH http://localhost:3000/v1/alerts/{alert-id}/resolve \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Miembro contactado exitosamente. Regresará mañana."
  }'
```

---

## Dashboard Analytics

### Get All Metrics
```bash
curl -X GET http://localhost:3000/v1/dashboard/metrics \
  -H "Authorization: Bearer $TOKEN"
```

### Churn Distribution
```bash
curl -X GET http://localhost:3000/v1/dashboard/churn-distribution \
  -H "Authorization: Bearer $TOKEN"
```

### Pipeline Data
```bash
curl -X GET http://localhost:3000/v1/dashboard/pipeline-data \
  -H "Authorization: Bearer $TOKEN"
```

### Membership Types
```bash
curl -X GET http://localhost:3000/v1/dashboard/membership-types \
  -H "Authorization: Bearer $TOKEN"
```

---

## Error Handling Examples

### Validation Error (400)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Error de validación",
    "details": [
      {
        "field": "email",
        "message": "El email es inválido"
      },
      {
        "field": "phone",
        "message": "El teléfono debe tener al menos 10 caracteres"
      }
    ]
  }
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token inválido o expirado"
  }
}
```

### Not Found (404)
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Miembro no encontrado"
  }
}
```

---

## Postman Collection Tips

### Environment Variables
Set these in Postman:
```
base_url: http://localhost:3000/v1
token: {{your_jwt_token}}
```

### Authorization Header
```
Key: Authorization
Value: Bearer {{token}}
```

### Common Headers
```
Content-Type: application/json
Accept: application/json
```

---

## Testing Workflow

### 1. Test Complete Member Journey
```bash
# 1. Create member
POST /members

# 2. Record multiple check-ins over time
POST /members/{id}/checkin (x5)

# 3. Verify churn risk decreased
GET /members/{id}

# 4. Update membership
PATCH /members/{id}

# 5. Export data
GET /members/export/csv
```

### 2. Test Sales Pipeline
```bash
# 1. Create lead
POST /leads

# 2. Move through stages
PATCH /leads/{id}/status → contactado
PATCH /leads/{id}/status → tour_agendado
PATCH /leads/{id}/status → propuesta
PATCH /leads/{id}/status → negociacion
PATCH /leads/{id}/status → cerrado_ganado

# 3. Verify conversion
GET /dashboard/pipeline-data
```

### 3. Test Equipment Maintenance
```bash
# 1. Create equipment
POST /equipment

# 2. Schedule maintenance
POST /equipment/{id}/maintenance

# 3. Complete maintenance
PATCH /equipment/{id}/maintenance/{maint-id}/complete

# 4. Verify next maintenance date updated
GET /equipment/{id}
```

---

## Performance Testing

### Load Test Members Endpoint
```bash
ab -n 1000 -c 50 \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/v1/members?page=1&limit=50
```

### Expected Response Times
- List endpoints: < 200ms
- Single resource: < 100ms
- Create/Update: < 300ms
- Dashboard metrics: < 500ms
- CSV export: < 2000ms

---

## Notes for Backend Team

1. **All dates/times in UTC** (ISO 8601 format)
2. **Currency in COP** (Colombian Pesos) as integers
3. **Pagination required** on all list endpoints
4. **Consistent error format** across all endpoints
5. **Validation on backend** (never trust frontend)
6. **Rate limiting** recommended (100 req/min)
7. **CORS enabled** for frontend domain
8. **HTTPS in production** (HTTP OK for development)
