# Frontend-Backend Integration Guide

## Configuration

### Environment Setup
- **Base URL**: `http://localhost:3001/v1`
- **Config File**: `.env.local`
- **Environment Variable**: `NEXT_PUBLIC_API_URL=http://localhost:3001/v1`

## API Layer

### Location
- **File**: `src/lib/api.ts`
- **Type**: Centralized API client with helper functions

### Features
- Automatic Bearer token authentication
- Request/response logging via console
- Centralized error handling
- Token persistence in localStorage

### Helper Functions

#### Generic Methods
```typescript
GET<T>(endpoint: string): Promise<T>
POST<T>(endpoint, data): Promise<T>
PATCH<T>(endpoint, data): Promise<T>
DELETE<T>(endpoint): Promise<T>
```

#### Authentication
```typescript
setAuthToken(token: string): void          // Store JWT token
getAuthToken(): string | null              // Retrieve JWT token
clearAuthToken(): void                     // Clear JWT token
```

## Connected Endpoints

### Members Management

#### 1. Get All Members
```typescript
import { getMembers } from '@/lib/api';

const members = await getMembers();
```
- **Method**: `GET`
- **URL**: `http://localhost:3001/v1/members`
- **Response**: `Member[]`

#### 2. Get Member by ID
```typescript
import { getMemberById } from '@/lib/api';

const member = await getMemberById('member-id-123');
```
- **Method**: `GET`
- **URL**: `http://localhost:3001/v1/members/:id`
- **Response**: `Member`

#### 3. Create Member
```typescript
import { createMember } from '@/lib/api';

const newMember = await createMember({
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
- **Method**: `POST`
- **URL**: `http://localhost:3001/v1/members`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Member data (excluding id, createdAt, updatedAt)
- **Response**: `Member`

#### 4. Update Member
```typescript
import { updateMember } from '@/lib/api';

const updated = await updateMember('member-id-123', {
  name: "Jane Doe",
  email: "jane@example.com",
  status: "inactive"
});
```
- **Method**: `PATCH`
- **URL**: `http://localhost:3001/v1/members/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Partial Member data
- **Response**: `Member`

#### 5. Delete Member
```typescript
import { deleteMember } from '@/lib/api';

await deleteMember('member-id-123');
```
- **Method**: `DELETE`
- **URL**: `http://localhost:3001/v1/members/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message

#### 6. Check-in Member
```typescript
import { checkinMember } from '@/lib/api';

const checkinResult = await checkinMember('member-id-123');
```
- **Method**: `POST`
- **URL**: `http://localhost:3001/v1/members/:id/checkin`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Updated member with latest check-in

#### 7. Export Members to CSV
```typescript
import { exportMembersCSV } from '@/lib/api';

const csvBlob = await exportMembersCSV();
// Download or process the CSV file
const url = URL.createObjectURL(csvBlob);
const link = document.createElement('a');
link.href = url;
link.download = 'members.csv';
link.click();
```
- **Method**: `GET`
- **URL**: `http://localhost:3001/v1/members/export/csv`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: CSV file blob

## Member Type

```typescript
type Member = {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate?: string;
  gender?: "M" | "F" | "Otro";
  
  // Fitness profile
  goal: FitnessGoal;
  experienceLevel: ExperienceLevel;
  
  // Membership
  membershipType: MembershipType;
  joinedAt: string;
  membershipEnd?: string;
  monthlyPrice: number;
  
  // Status and behavior
  status: MemberStatus;
  membershipStatus: "activo" | "congelado" | "vencido" | "cancelado";
  lastCheckIn?: string;
  checkInsLast30Days: number;
  averageCheckInsPerWeek: number;
  preferredSchedule?: PreferredSchedule;
  
  // Risk score
  churnRiskScore: number;
  churnRiskLevel: ChurnRiskLevel;
  
  // Metadata
  acquisitionSource?: "instagram" | "google" | "referido" | "calle" | "facebook";
  assignedTrainer?: string;
  notes?: string;
  
  attendance: AttendanceRecord[];
  createdAt: string;
  updatedAt: string;
};
```

## Request/Response Examples

### Create Member Request
```bash
curl -X POST http://localhost:3001/v1/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "name": "John Doe",
    "email": "john@gym.com",
    "phone": "+1-555-0123",
    "goal": "ganar_musculo",
    "membershipType": "premium",
    "joinedAt": "2026-04-22",
    "monthlyPrice": 50,
    "status": "active",
    "membershipStatus": "activo",
    "checkInsLast30Days": 0,
    "averageCheckInsPerWeek": 0,
    "churnRiskScore": 0,
    "churnRiskLevel": "bajo",
    "experienceLevel": "intermedio",
    "attendance": []
  }'
```

### Create Member Response
```json
{
  "data": {
    "id": "mem-001",
    "name": "John Doe",
    "email": "john@gym.com",
    "phone": "+1-555-0123",
    "goal": "ganar_musculo",
    "membershipType": "premium",
    "joinedAt": "2026-04-22",
    "monthlyPrice": 50,
    "status": "active",
    "membershipStatus": "activo",
    "checkInsLast30Days": 0,
    "averageCheckInsPerWeek": 0,
    "churnRiskScore": 0,
    "churnRiskLevel": "bajo",
    "experienceLevel": "intermedio",
    "attendance": [],
    "createdAt": "2026-04-22T10:30:00Z",
    "updatedAt": "2026-04-22T10:30:00Z"
  }
}
```

### Check-in Request
```bash
curl -X POST http://localhost:3001/v1/members/mem-001/checkin \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Check-in Response
```json
{
  "data": {
    "id": "mem-001",
    "name": "John Doe",
    "lastCheckIn": "2026-04-22T14:00:00Z",
    "checkInsLast30Days": 1,
    ...
  }
}
```

## Context Hook

### useMembers()
```typescript
import { useMembers } from '@/context/members-context';

export function MyComponent() {
  const {
    members,           // Member[] - Current list of members
    loading,          // boolean - Loading state
    error,            // string | null - Error message
    addMember,        // (payload) => Promise<Member>
    updateMember,     // (id, payload) => Promise<Member | null>
    getMemberById,    // (id) => Member | undefined
    deleteMember,     // (id) => Promise<void>
    refreshMembers    // () => Promise<void>
  } = useMembers();

  return (
    <div>
      {loading && <p>Loading members...</p>}
      {error && <p>Error: {error}</p>}
      {members.map(member => (
        <div key={member.id}>{member.name}</div>
      ))}
    </div>
  );
}
```

## Authentication Flow

1. **Store Token**
```typescript
import { setAuthToken } from '@/lib/api';

// After login from backend
const response = await fetch('/v1/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

const { token } = await response.json();
setAuthToken(token);
```

2. **Use in Requests** - Automatically included in all API calls

3. **Clear Token** - On logout
```typescript
import { clearAuthToken } from '@/lib/api';

clearAuthToken();
```

## Error Handling

All API errors are logged to console and thrown for component-level handling:

```typescript
try {
  const member = await createMember(data);
  toast.success('Member created!');
} catch (error) {
  toast.error(error.message);
  console.error('API Error:', error);
}
```

## Important Notes

- ✅ All endpoints use the `/v1` prefix
- ✅ All requests include JWT Bearer token (when set)
- ✅ No hardcoded URLs - uses `NEXT_PUBLIC_API_URL`
- ✅ Terminology: "members" (NOT "clients")
- ✅ All responses are logged to console for debugging
- ✅ Backend runs on port 3001
- ✅ Frontend runs on port 3000 (typical Next.js dev port)

## Testing the Connection

### 1. Start Backend
```bash
cd ../gymBackend  # or wherever your NestJS backend is
npm run start
# Should be running on http://localhost:3001
```

### 2. Start Frontend
```bash
npm run dev
# Frontend will be on http://localhost:3000
```

### 3. Check Browser Console
Open DevTools Console and look for `[API]` logs showing requests being sent to the correct endpoints.

### 4. Test Create Member
1. Navigate to http://localhost:3000/clients/new
2. Fill in the form
3. Submit
4. Check browser console for API logs
5. Verify backend receives the POST request

