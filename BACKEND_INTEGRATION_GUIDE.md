# 📚 Backend Integration Guide - GymOS

## Overview

This directory contains complete API documentation and requirements for the GymOS backend development team.

---

## 📖 Documentation Files

### 1. **API_DOCUMENTATION.md** (Main Reference)
- ✅ Complete endpoint specifications
- ✅ Request/Response examples
- ✅ All data structures and types
- ✅ Enumerations and valid values
- ✅ Error handling format
- ✅ Business logic details

**Use this file for:** Detailed implementation reference

---

### 2. **BACKEND_REQUIREMENTS_SUMMARY.md** (Quick Start)
- ✅ High-level overview
- ✅ Database schema hints
- ✅ Priority order for implementation
- ✅ Critical business logic
- ✅ Performance requirements

**Use this file for:** Initial planning and architecture decisions

---

### 3. **API_TESTING_EXAMPLES.md** (Testing Guide)
- ✅ cURL examples for all endpoints
- ✅ Testing workflows
- ✅ Postman tips
- ✅ Performance testing commands
- ✅ Common scenarios

**Use this file for:** Manual testing and validation

---

## 🎯 Quick Start for Backend Team

### Step 1: Read Summary
Start with `BACKEND_REQUIREMENTS_SUMMARY.md` to understand:
- Core entities (Members, Leads, Equipment, Alerts)
- Database structure
- Implementation priorities
- Key business rules

### Step 2: Review API Specs
Read `API_DOCUMENTATION.md` for:
- Exact endpoint URLs
- Request/response formats
- Validation rules
- Authentication flow

### Step 3: Test Examples
Use `API_TESTING_EXAMPLES.md` to:
- Test your implementation
- Verify response formats
- Validate business logic
- Check error handling

---

## 🔑 Key Information

### Tech Stack Recommendation
- **Framework:** Node.js + Express / NestJS / Fastify
- **Database:** PostgreSQL (recommended) or MySQL
- **ORM:** Prisma / TypeORM / Sequelize
- **Auth:** JWT (JSON Web Tokens)
- **Validation:** Joi / Zod / class-validator
- **Documentation:** Swagger/OpenAPI (optional but recommended)

### Authentication
- JWT Bearer Token in `Authorization` header
- Token expiration: 24 hours (configurable)
- Refresh token mechanism (optional)

### Response Format
All responses follow this structure:
```json
{
  "success": true,
  "data": { ... },
  "pagination": { ... } // for list endpoints
}
```

Errors:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": [] // optional validation errors
  }
}
```

---

## 📊 Entity Relationship Overview

```
┌─────────────┐       ┌──────────────┐
│   Members   │───────│  Attendance  │
│             │  1:N  │   History    │
└─────────────┘       └──────────────┘
       │
       │ 1:N
       ▼
┌─────────────┐
│ Retention   │
│ Alerts      │
└─────────────┘

┌─────────────┐
│    Leads    │
│             │
└─────────────┘

┌─────────────┐       ┌──────────────────┐
│  Equipment  │───────│   Maintenance    │
│             │  1:N  │    Records       │
└─────────────┘       └──────────────────┘
```

---

## 🚀 Implementation Phases

### Phase 1: Core (Week 1-2)
Priority: **CRITICAL**
- [ ] Authentication system
- [ ] Members CRUD
- [ ] Check-in endpoint
- [ ] Leads CRUD
- [ ] Basic dashboard metrics

### Phase 2: Equipment (Week 3)
Priority: **HIGH**
- [ ] Equipment CRUD
- [ ] Maintenance scheduling
- [ ] Maintenance completion
- [ ] Equipment status tracking

### Phase 3: Advanced (Week 4)
Priority: **MEDIUM**
- [ ] Retention alerts (auto-generation)
- [ ] Advanced analytics
- [ ] CSV export
- [ ] Webhooks (optional)

---

## ⚠️ Important Notes

### Business Logic (Backend Must Implement)

1. **Churn Risk Calculation**
   - Auto-calculate on member creation/update
   - Recalculate after each check-in
   - Formula documented in API_DOCUMENTATION.md

2. **Client Status**
   - Auto-update based on lastCheckIn
   - Run daily cron job or calculate on-the-fly

3. **Lead Probability**
   - Auto-calculate on creation
   - Update when status changes

4. **Maintenance Scheduling**
   - Auto-calculate nextMaintenance date
   - Generate alerts when overdue

### Data Validation
- Email format validation
- Phone number format (Colombian numbers)
- Date ranges (membershipEnd > joinedAt)
- Price > 0
- Required fields per entity

### Security
- Password hashing (bcrypt, argon2)
- SQL injection prevention (use ORM/parameterized queries)
- XSS protection
- Rate limiting
- Input sanitization

### Performance
- Database indexing on filtered fields
- Pagination on all list endpoints
- Query optimization (avoid N+1)
- Caching for dashboard metrics (TTL: 5 min)

---

## 🧪 Testing Checklist

Before delivery, ensure:
- [ ] All endpoints return correct status codes
- [ ] Validation errors are clear and actionable
- [ ] Pagination works correctly
- [ ] Filtering works for all specified fields
- [ ] Authentication protects all routes
- [ ] Authorization checks user roles
- [ ] Error messages don't leak sensitive info
- [ ] Response times meet requirements
- [ ] Business logic calculations are accurate
- [ ] Data persists correctly
- [ ] Soft deletes work (if implemented)

---

## 📞 Support & Questions

### Frontend Team Contact
- **Email:** [frontend-team@company.com]
- **Slack:** #gymos-backend-integration
- **Repo:** [Link to frontend repository]

### Common Questions

**Q: Should backend calculate churn risk or frontend?**  
A: **Backend** should calculate and store it. Frontend displays it.

**Q: Who generates retention alerts?**  
A: **Backend** should auto-generate based on rules (cron job or triggers).

**Q: Should attendance history be separate table?**  
A: **Yes**, for performance and normalization.

**Q: What timezone for timestamps?**  
A: **UTC** always. Frontend converts to local time.

**Q: How to handle concurrent updates?**  
A: Use optimistic locking (version field) or last-write-wins with updatedAt.

---

## 📝 Deliverables Expected

1. **Running API** on staging environment
2. **API Documentation** (Swagger/OpenAPI if possible)
3. **Database Schema** (SQL dump or migration scripts)
4. **Environment Variables** template (.env.example)
5. **Deployment Instructions**
6. **Test Credentials** for QA

---

## 🔗 Useful Links

- [API Documentation](./API_DOCUMENTATION.md)
- [Requirements Summary](./BACKEND_REQUIREMENTS_SUMMARY.md)
- [Testing Examples](./API_TESTING_EXAMPLES.md)
- [Frontend Repository](link-to-frontend-repo)
- [Figma Designs](link-to-designs-if-any)

---

## ✨ Success Criteria

Backend is considered complete when:
1. ✅ All Phase 1 endpoints working
2. ✅ Frontend can successfully integrate
3. ✅ All business logic implemented correctly
4. ✅ Performance meets requirements
5. ✅ Security best practices followed
6. ✅ Documentation is accurate and up-to-date
7. ✅ Tests pass (unit + integration)

---

**Last Updated:** April 5, 2026  
**Version:** 1.0  
**Status:** Ready for Backend Development
