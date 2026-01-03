# Authentication System Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BOOKING PLATFORM                             │
│                     Email/Password Authentication                    │
│                    Role-Based Access Control (RBAC)                  │
└─────────────────────────────────────────────────────────────────────┘

                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
            ┌───────▼────────┐          ┌────────▼────────┐
            │    FRONTEND    │          │     BACKEND     │
            │  React + TS    │◄────────►│    FastAPI      │
            │   Port: 5173   │   HTTP   │   Port: 8000    │
            └────────────────┘          └─────────────────┘
                    │                            │
                    │                            │
            ┌───────▼────────┐          ┌────────▼────────┐
            │ localStorage   │          │   PostgreSQL    │
            │ (JWT Token)    │          │    Database     │
            └────────────────┘          └─────────────────┘
```

## Authentication Flow Diagram

```
┌─────────┐                                                    ┌──────────┐
│  User   │                                                    │ Database │
└────┬────┘                                                    └────▲─────┘
     │                                                              │
     │  1. Visit /auth                                              │
     ├─────────────────────────────►┌────────────────┐             │
     │                               │  Auth Page     │             │
     │                               │ (Signup/Login) │             │
     │  2. Enter credentials         └────────┬───────┘             │
     │     + Select role (signup)             │                     │
     ├───────────────────────────────────────►│                     │
     │                                        │                     │
     │  3. Client-side validation (Zod)      │                     │
     │     ✓ Email format                    │                     │
     │     ✓ Password strength               │                     │
     │     ✓ Full name length                │                     │
     │                                        │                     │
     │  4. POST /auth/register or /login     │                     │
     │     (Email, Password, Role)            │                     │
     ├───────────────────────────────────────►│                     │
     │                                        │                     │
     │                                        │  5. Validate input  │
     │                                        │     Hash password   │
     │                                        ├────────────────────►│
     │                                        │  6. Check email     │
     │                                        │     uniqueness      │
     │                                        │◄────────────────────┤
     │                                        │  7. Create user or  │
     │                                        │     verify password │
     │                                        ├────────────────────►│
     │                                        │◄────────────────────┤
     │                                        │                     │
     │                                        │  8. Generate JWT    │
     │                                        │     {sub, role,     │
     │                                        │      user_id, exp}  │
     │  9. Return token + user data           │                     │
     │◄───────────────────────────────────────┤                     │
     │                                        │                     │
     │  10. Store token in localStorage      │                     │
     │      Update AuthContext                │                     │
     │                                        │                     │
     │  11. GET /auth/me                      │                     │
     │      (with Bearer token)               │                     │
     ├───────────────────────────────────────►│                     │
     │                                        │  12. Validate token │
     │                                        │      Extract user   │
     │                                        ├────────────────────►│
     │                                        │◄────────────────────┤
     │  13. Return user profile               │                     │
     │◄───────────────────────────────────────┤                     │
     │                                        │                     │
     │  14. Role-based redirect:              │                     │
     │      customer → /                      │                     │
     │      provider → /provider/dashboard    │                     │
     │      admin → /admin/dashboard          │                     │
     │                                        │                     │
     ▼                                        ▼                     ▼
```

## Role-Based Access Control Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                        User Authenticated                         │
│                     (Token in localStorage)                       │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                   ┌───────────┴───────────┐
                   │   Check User Role     │
                   └───────────┬───────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼────────┐    ┌────────▼────────┐    ┌──────▼───────┐
│    CUSTOMER    │    │    PROVIDER     │    │    ADMIN     │
│   role='customer'   │  role='provider'│    │ role='admin' │
└───────┬────────┘    └────────┬────────┘    └──────┬───────┘
        │                      │                      │
        │                      │                      │
┌───────▼────────┐    ┌────────▼────────┐    ┌──────▼───────┐
│  Redirect to:  │    │  Redirect to:   │    │ Redirect to: │
│      / (Home)  │    │  /provider/     │    │   /admin/    │
│                │    │   dashboard     │    │  dashboard   │
└───────┬────────┘    └────────┬────────┘    └──────┬───────┘
        │                      │                      │
        │                      │                      │
┌───────▼────────────────────────────────────────────▼───────┐
│                     PERMISSIONS                             │
├─────────────────────────────────────────────────────────────┤
│  CUSTOMER:                                                  │
│    ✓ Browse services                                        │
│    ✓ View provider profiles                                │
│    ✓ Create/manage own bookings                            │
│    ✓ Leave reviews                                          │
│    ✓ Manage own profile                                     │
│    ✗ Access provider dashboard                              │
│    ✗ Access admin dashboard                                 │
├─────────────────────────────────────────────────────────────┤
│  PROVIDER:                                                  │
│    ✓ All customer permissions                               │
│    ✓ Manage service listings                                │
│    ✓ Set availability                                       │
│    ✓ Handle bookings                                        │
│    ✓ View revenue/statistics                                │
│    ✓ Manage provider profile                                │
│    ✗ Access admin dashboard                                 │
├─────────────────────────────────────────────────────────────┤
│  ADMIN:                                                     │
│    ✓ View all users                                         │
│    ✓ View all bookings                                      │
│    ✓ Manage user accounts (activate/deactivate)             │
│    ✓ Platform oversight                                     │
│    ✓ Monitor platform metrics                               │
│    ✓ Access all dashboards                                  │
└─────────────────────────────────────────────────────────────┘
```

## Protected Route Flow

```
┌─────────────────────────────────────────────────────────────┐
│            User Tries to Access Protected Route             │
│               (e.g., /provider/dashboard)                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                ┌─────────▼──────────┐
                │  ProtectedRoute    │
                │    Component       │
                └─────────┬──────────┘
                          │
                ┌─────────▼──────────┐
                │ Check if user      │     NO    ┌──────────────┐
                │  is authenticated  ├──────────►│ Redirect to  │
                │  (token exists)    │           │   /auth      │
                └─────────┬──────────┘           └──────────────┘
                          │ YES
                ┌─────────▼──────────┐
                │ Check if user has  │     NO    ┌──────────────┐
                │   required role    ├──────────►│ Redirect to  │
                │ (allowedRoles=[])  │           │ role-based   │
                └─────────┬──────────┘           │   fallback   │
                          │ YES                  └──────────────┘
                ┌─────────▼──────────┐
                │  Render Protected  │
                │    Component       │
                └────────────────────┘
```

## JWT Token Structure

```
┌─────────────────────────────────────────────────────────────┐
│                         JWT TOKEN                            │
├─────────────────────────────────────────────────────────────┤
│  HEADER                                                      │
│  {                                                           │
│    "alg": "HS256",                                           │
│    "typ": "JWT"                                              │
│  }                                                           │
├─────────────────────────────────────────────────────────────┤
│  PAYLOAD                                                     │
│  {                                                           │
│    "sub": "user@example.com",    ← User identifier          │
│    "role": "customer",           ← User role (RBAC)         │
│    "user_id": 1,                 ← Database user ID         │
│    "exp": 1735904400             ← Expiration timestamp     │
│  }                                                           │
├─────────────────────────────────────────────────────────────┤
│  SIGNATURE                                                   │
│  HMACSHA256(                                                 │
│    base64UrlEncode(header) + "." +                           │
│    base64UrlEncode(payload),                                 │
│    SECRET_KEY                                                │
│  )                                                           │
└─────────────────────────────────────────────────────────────┘
```

## Database Entity Relationship

```
┌─────────────────────────────────────────────────────────────┐
│                           USERS                              │
├─────────────────────────────────────────────────────────────┤
│  id                INT PRIMARY KEY                           │
│  email             VARCHAR UNIQUE NOT NULL                   │
│  hashed_password   VARCHAR NOT NULL                          │
│  full_name         VARCHAR                                   │
│  role              ENUM('admin','provider','customer')       │
│  is_active         BOOLEAN DEFAULT TRUE                      │
│  created_at        TIMESTAMP DEFAULT NOW()                   │
│  updated_at        TIMESTAMP                                 │
└──────┬──────────────────────────────────────────────────────┘
       │
       │ Foreign Key Relationships (Future)
       │
       ├──────────────────────────────────────┐
       │                                      │
       ▼                                      ▼
┌──────────────┐                     ┌──────────────┐
│   BOOKINGS   │                     │   SERVICES   │
├──────────────┤                     ├──────────────┤
│ user_id (FK) │                     │ provider_id  │
│ service_id   │                     │  (FK to      │
│ provider_id  │                     │   users)     │
│ ...          │                     │ ...          │
└──────────────┘                     └──────────────┘
       │
       │
       ▼
┌──────────────┐
│   REVIEWS    │
├──────────────┤
│ user_id (FK) │
│ service_id   │
│ ...          │
└──────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                         │
└─────────────────────────────────────────────────────────────┘

Layer 1: Input Validation
├─ Client-side (Zod schemas)
│  ├─ Email format validation
│  ├─ Password strength requirements
│  └─ Field length validation
└─ Server-side (FastAPI/Pydantic)
   ├─ Email format validation
   ├─ Password complexity rules
   └─ SQL injection prevention (ORM)

Layer 2: Authentication
├─ Password hashing (bcrypt)
│  ├─ Automatic salt generation
│  └─ Computationally expensive
└─ JWT tokens (HS256)
   ├─ 30-minute expiration
   ├─ Signed with SECRET_KEY
   └─ Payload includes role & user_id

Layer 3: Authorization
├─ Role-based access control
│  ├─ customer → Limited access
│  ├─ provider → Service management
│  └─ admin → Full platform access
└─ Protected routes
   ├─ Token validation on each request
   └─ Role verification for restricted areas

Layer 4: Account Management
├─ is_active status
│  ├─ Enables account suspension
│  └─ Checked on every login
└─ Email uniqueness
   ├─ Database constraint
   └─ Application-level check

Layer 5: Logging & Monitoring
├─ Authentication events
│  ├─ Successful registrations
│  ├─ Successful logins
│  ├─ Failed login attempts
│  └─ Error conditions
└─ User-friendly error messages
   └─ No information leakage
```

## API Endpoint Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     API ENDPOINTS                            │
└─────────────────────────────────────────────────────────────┘

/api/v1/auth
├─ POST /register
│  ├─ Request: {email, password, full_name, role}
│  ├─ Response: User object
│  └─ Status: 201 Created
│
├─ POST /login
│  ├─ Request: {username, password} (form-data)
│  ├─ Response: {access_token, token_type}
│  └─ Status: 200 OK
│
└─ GET /me
   ├─ Headers: Authorization: Bearer <token>
   ├─ Response: User object
   └─ Status: 200 OK

Protected Endpoints (Examples)
├─ /api/v1/bookings/* (requires authentication)
├─ /api/v1/services/provider/* (requires provider role)
└─ /api/v1/admin/* (requires admin role)
```

## Frontend Component Hierarchy

```
App.tsx
├─ ThemeProvider
├─ AuthProvider ──────────────┐ (Global auth state)
│  ├─ user                    │
│  ├─ loading                 │
│  ├─ login()                 │
│  ├─ register()              │
│  └─ logout()                │
│                             │
├─ BrowserRouter              │
   ├─ Route: /               │
   │  └─ Index (public)       │
   │                          │
   ├─ Route: /auth           │
   │  └─ Auth ────────────────┤ (Uses AuthContext)
   │     ├─ Login form        │
   │     └─ Signup form       │
   │                          │
   ├─ Route: /profile        │
   │  └─ ProtectedRoute ──────┤ (Uses AuthContext)
   │     └─ Profile           │
   │                          │
   ├─ Route: /provider/dashboard
   │  └─ ProtectedRoute ──────┤ (allowedRoles: ['provider'])
   │     └─ ProviderDashboard │
   │                          │
   └─ Route: /admin/dashboard
      └─ ProtectedRoute ──────┘ (allowedRoles: ['admin'])
         └─ AdminDashboard
```

## Request/Response Examples

### Registration Request
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "provider@example.com",
  "password": "SecurePass123",
  "full_name": "John Provider",
  "role": "provider"
}
```

### Registration Response (Success)
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 1,
  "email": "provider@example.com",
  "full_name": "John Provider",
  "role": "provider",
  "is_active": true,
  "created_at": "2026-01-03T10:00:00Z"
}
```

### Login Request
```http
POST /api/v1/auth/login
Content-Type: application/x-www-form-urlencoded

username=provider@example.com&password=SecurePass123
```

### Login Response (Success)
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Protected Request
```http
GET /api/v1/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Protected Response (Success)
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 1,
  "email": "provider@example.com",
  "full_name": "John Provider",
  "role": "provider",
  "is_active": true,
  "created_at": "2026-01-03T10:00:00Z"
}
```

---

**Legend:**
- `┌─┐` Boxes represent components/systems
- `├─` Tree structure shows hierarchy
- `→` Arrows show data flow
- `◄►` Bidirectional communication
- `✓` Allowed operation
- `✗` Forbidden operation
