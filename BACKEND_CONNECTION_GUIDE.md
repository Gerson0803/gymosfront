# Backend Integration Quick Reference

## ✅ Setup Complete

### Connected Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/members` | GET | Fetch all members |
| `/members/:id` | GET | Fetch member by ID |
| `/members` | POST | Create new member |
| `/members/:id` | PATCH | Update member |
| `/members/:id` | DELETE | Delete member |
| `/members/:id/checkin` | POST | Record check-in |
| `/members/export/csv` | GET | Export to CSV |

### Key Files Modified

1. ✅ **`.env.local`** - Created with API URL configuration
2. ✅ **`src/lib/api.ts`** - Centralized API client with authentication
3. ✅ **`src/types/member.ts`** - Member type definitions
4. ✅ **`src/context/members-context.tsx`** - Members state management with API integration
5. ✅ **`src/app/layout.tsx`** - Added MembersProvider wrapper
6. ✅ **`src/components/clients/client-form.tsx`** - Updated to use useMembers hook
7. ✅ **`src/app/(dashboard)/clients/[id]/page.tsx`** - Updated to use members
8. ✅ **`src/app/(dashboard)/clients/[id]/edit/page.tsx`** - Updated to use members

### Example Usage

#### Create Member
```typescript
import { createMember, setAuthToken } from '@/lib/api';

// Set token (do this after login)
setAuthToken('your-jwt-token');

// Create member
const member = await createMember({
  name: "John Doe",
  email: "john@example.com",
  phone: "+1-555-0123",
  goal: "ganar_musculo",
  membershipType: "premium",
  joinedAt: "2026-04-22",
  monthlyPrice: 50,
  status: "active",
  membershipStatus: "activo",
  checkInsLast30Days: 0,
  averageCheckInsPerWeek: 0,
  churnRiskScore: 0,
  churnRiskLevel: "bajo",
  experienceLevel: "intermedio",
  attendance: []
});
```

#### Use in Component
```typescript
import { useMembers } from '@/context/members-context';

export function MyComponent() {
  const { members, loading, error, addMember } = useMembers();

  return (
    <div>
      {loading ? <p>Loading...</p> : members.map(m => <p>{m.name}</p>)}
    </div>
  );
}
```

### API Request Format

All requests automatically include:
- ✅ `Content-Type: application/json`
- ✅ `Authorization: Bearer <token>` (when token is set)
- ✅ Base URL: `http://localhost:3001/v1`

### Console Logging

All API requests and responses are logged to browser console:
```
[API] POST http://localhost:3001/v1/members
[API Response] Success {id: "mem-001", name: "John Doe", ...}
[API Error] 400: {"message": "Invalid email"}
```

### Authentication

```typescript
import { setAuthToken, getAuthToken, clearAuthToken } from '@/lib/api';

// After login
setAuthToken('jwt_token_from_backend');

// Token is automatically sent in all requests

// On logout
clearAuthToken();
```

### Backend Requirements

The backend API should:
- ✅ Run on `http://localhost:3001`
- ✅ Use `/v1` prefix for all routes
- ✅ Use "members" endpoint (not "clients")
- ✅ Accept JWT Bearer tokens in Authorization header
- ✅ Return JSON responses

### Starting the Application

1. **Backend (NestJS)**
```bash
cd ../gymBackend
npm run start
# Runs on http://localhost:3001
```

2. **Frontend (Next.js)**
```bash
npm run dev
# Runs on http://localhost:3000
```

3. **Check Integration**
   - Open http://localhost:3000
   - Open DevTools Console (F12)
   - Look for `[API]` messages
   - Navigate to members page to see real API calls

### Testing Endpoints

Use curl or Postman to test:

```bash
# Create member
curl -X POST http://localhost:3001/v1/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"John Doe","email":"john@gym.com",...}'

# Get all members
curl http://localhost:3001/v1/members \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check-in member
curl -X POST http://localhost:3001/v1/members/mem-001/checkin \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Important Notes

- 🚨 Do NOT use hardcoded URLs - always use `process.env.NEXT_PUBLIC_API_URL`
- 🚨 Do NOT use `/api` prefix - only use `/v1` from NestJS
- 🚨 Use "members" terminology, not "clients"
- ✅ All errors are caught and logged
- ✅ Token persists in localStorage
- ✅ All types are properly defined in `src/types/member.ts`

### Troubleshooting

**Issue**: Getting CORS errors
- **Solution**: Configure CORS in NestJS backend

**Issue**: "API_URL not set" error
- **Solution**: Ensure `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:3001/v1`

**Issue**: 401 Unauthorized
- **Solution**: Token not set or expired - call `setAuthToken(token)` after login

**Issue**: Requests not showing in API console logs
- **Solution**: Check browser DevTools Console (F12) for `[API]` messages

