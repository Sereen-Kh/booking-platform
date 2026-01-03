# Email/Password Authentication & Role-Based Access Control

## Overview

This document describes the comprehensive authentication and authorization system implemented for the BookFlow booking platform. The system provides email/password-based signup and login with role-based access control (RBAC) across three distinct user types: **CUSTOMER**, **PROVIDER**, and **ADMIN**.

## Architecture

### Authentication Flow

```
User Registration/Login
       ↓
Email/Password Validation
       ↓
JWT Token Generation
       ↓
Role Assignment (customer/provider/admin)
       ↓
Role-Based Redirect
```

## Backend Implementation

### 1. User Model & Roles

**Location:** `backend/app/models/user.py`

The User model defines three distinct roles:

```python
class UserRole(str, enum.Enum):
    ADMIN = "admin"
    PROVIDER = "provider"
    CUSTOMER = "customer"

class User(Base):
    id: Primary key
    email: Unique, indexed
    hashed_password: Securely hashed
    full_name: Optional
    role: Enum (UserRole)
    is_active: Boolean (default: True)
    created_at: Timestamp
    updated_at: Timestamp
```

### 2. Authentication Endpoints

**Location:** `backend/app/api/v1/auth.py`

#### POST /api/v1/auth/register

Register a new user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe",
  "role": "customer"  // Optional, defaults to "customer"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**Validation:**
- Email uniqueness check
- Password strength validation
- Full name minimum 2 characters
- Email normalization (lowercase, trimmed)

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "customer",
  "is_active": true,
  "created_at": "2026-01-03T10:00:00Z"
}
```

#### POST /api/v1/auth/login

OAuth2-compatible login endpoint.

**Request Body (Form Data):**
```
username: user@example.com  // OAuth2 uses 'username' field
password: SecurePass123
```

**Security Checks:**
1. Email normalization
2. User existence validation
3. Password verification
4. Account active status check

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**JWT Token Payload:**
```json
{
  "sub": "user@example.com",
  "role": "customer",
  "user_id": 1,
  "exp": 1735904400
}
```

#### GET /api/v1/auth/me

Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "customer",
  "is_active": true,
  "created_at": "2026-01-03T10:00:00Z"
}
```

### 3. Security Features

**Location:** `backend/app/core/security.py`

- **Password Hashing:** Bcrypt with automatic salt generation
- **JWT Tokens:** HS256 algorithm with configurable expiration
- **Token Expiration:** 30 minutes (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`)

**Configuration:** `backend/app/core/config.py`
```python
SECRET_KEY: str = "supersecretkey"  # Change in production
ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
```

### 4. Dependency Injection

**Location:** `backend/app/api/deps.py`

```python
async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(reusable_oauth2)
) -> User
```

Used across all protected endpoints to:
1. Extract JWT token from Authorization header
2. Validate token signature and expiration
3. Retrieve user from database
4. Return User object for role-based access control

### 5. Logging & Error Handling

All authentication endpoints include comprehensive logging:

```python
logger.info(f"New user registered: {email} with role {role}")
logger.warning(f"Login attempt with non-existent email: {email}")
logger.warning(f"Failed login attempt for user: {email}")
logger.error(f"Error during user registration: {error}")
```

## Frontend Implementation

### 1. Authentication Context

**Location:** `frontend/src/context/AuthContext.tsx`

Provides global authentication state management:

```typescript
interface AuthContextType {
    user: User | null;
    loading: boolean;
    isActive: boolean;
    login: (email: string, password: string) => Promise<User>;
    register: (name: string, email: string, password: string, role?: string) => Promise<User>;
    logout: () => void;
}
```

**Features:**
- Automatic token storage in localStorage
- Auto-fetch user profile on app load
- Automatic token cleanup on logout
- Loading state for async operations

### 2. Authentication Page

**Location:** `frontend/src/pages/Auth.tsx`

Unified login/signup page with:

- **Client-side validation** using Zod schemas
- **Role selection** for signup (Customer/Provider)
- **Password requirements** display
- **Real-time validation** feedback
- **Responsive design** with decorative panel
- **Role-based redirects** after authentication

**Password Validation:**
```typescript
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number');
```

### 3. Protected Routes

**Location:** `frontend/src/components/ProtectedRoute.tsx`

Higher-order component for route protection:

```typescript
<ProtectedRoute allowedRoles={['admin']}>
  <AdminDashboard />
</ProtectedRoute>
```

**Features:**
- Authentication check
- Role-based access control
- Automatic redirect to login
- Preserve intended destination
- Role-based fallback redirects

### 4. API Integration

**Location:** `frontend/src/utils/api.js`

```javascript
export const authAPI = {
  register: async (email, password, fullName, role = "customer")
  login: async (email, password)
  logout: () => { localStorage.removeItem("access_token") }
  isAuthenticated: () => !!localStorage.getItem("access_token")
  getCurrentUser: async () => apiRequest("/auth/me")
}
```

**Token Handling:**
- Automatic token injection in request headers
- Token storage in localStorage
- Token removal on logout

## Role-Based Access Control

### 1. User Roles

| Role | Description | Access Level | Default Route |
|------|-------------|--------------|---------------|
| **CUSTOMER** | End users who book services | Browse, Book, Review | `/` (Home) |
| **PROVIDER** | Service providers | Manage services, Availability, Bookings | `/provider/dashboard` |
| **ADMIN** | Platform administrators | Full platform oversight | `/admin/dashboard` |

### 2. Role-Based Redirects

After successful authentication, users are redirected based on their role:

```typescript
function getRoleBasedRedirect(role: string): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'provider':
      return '/provider/dashboard';
    case 'customer':
    default:
      return '/';
  }
}
```

### 3. Dashboard Access

#### Customer Experience
- **Route:** `/` (Home page)
- **Features:** Browse services, view providers, create bookings
- **Permissions:** Read-only for services, full access to own bookings

#### Provider Dashboard
- **Route:** `/provider/dashboard`
- **Features:** 
  - View service statistics
  - Manage service listings
  - Handle bookings
  - Set availability
  - Track revenue
- **Permissions:** Full access to own services and bookings

#### Admin Dashboard
- **Route:** `/admin/dashboard`
- **Features:**
  - View all users
  - View all bookings
  - Platform statistics
  - User management (activate/deactivate)
- **Permissions:** Read access to all platform data

## Security Considerations

### 1. Production Readiness Requirements (Week 4)

As outlined in the roadmap, the following security enhancements are planned:

#### Rate Limiting
- Prevent brute-force attacks on login endpoint
- Implement per-IP and per-email rate limits
- Suggested: 5 failed attempts = 15-minute lockout

#### Input Validation
- Already implemented: Email format, password strength
- Additional: SQL injection prevention (using ORM)
- XSS prevention in user-generated content

#### Error Logging
- Already implemented: Comprehensive logging in auth endpoints
- Additional: Centralized error tracking (e.g., Sentry)
- Security event monitoring (failed login attempts)

### 2. Current Security Features

✅ **Implemented:**
- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Email normalization
- Password strength requirements
- Account active status checks
- CORS configuration
- SQL injection prevention (SQLAlchemy ORM)

⚠️ **Pending (Week 4):**
- Rate limiting middleware
- CSRF protection
- Helmet.js security headers
- Environment variable validation
- Secrets management (env files)
- HTTPS enforcement
- Session management improvements

## Integration with Profile Management

The authentication system directly enables **Basic Profile Management** as described in Week 1:

### For Providers:
1. **Login** → Access to provider dashboard
2. **Profile Setup** → Manage business name, description, location
3. **Service Management** → Create and manage service listings
4. **Availability** → Set weekly availability and pricing

### For Customers:
1. **Login** → Access to booking features
2. **Profile** → Manage personal information
3. **Bookings** → View and manage bookings
4. **Favorites** → Save preferred services/providers

### For Admins:
1. **Login** → Access to admin dashboard
2. **User Management** → View all users, manage status
3. **Platform Oversight** → Monitor bookings and quality metrics

## Evolution Path to Production

### Week 1 (Current): Foundation ✅
- Email/password authentication
- Role-based access control
- Basic profile management
- Protected routes

### Week 2-3: Enhancement 🔄
- Provider onboarding flow
- Background check integration
- Professional verification
- Extended profile fields

### Week 4: Production Readiness 📋
- Rate limiting
- Advanced input validation
- Comprehensive error logging
- Security hardening
- Performance optimization
- Load testing

## API Testing

### Example: Register a New Customer

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "SecurePass123",
    "full_name": "Jane Customer",
    "role": "customer"
  }'
```

### Example: Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=customer@example.com&password=SecurePass123"
```

### Example: Get Current User

```bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer <access_token>"
```

## Troubleshooting

### Common Issues

1. **"Incorrect email or password"**
   - Verify email is lowercase
   - Check password meets requirements
   - Ensure account is active

2. **"Could not validate credentials"**
   - Token expired (30 min default)
   - Invalid token format
   - Secret key mismatch

3. **"User with this email already exists"**
   - Email already registered
   - Try login instead of signup

4. **403 Forbidden on protected routes**
   - User doesn't have required role
   - Check allowedRoles in ProtectedRoute

## Database Schema

### User Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    full_name VARCHAR,
    role VARCHAR CHECK (role IN ('admin', 'provider', 'customer')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
```

## Conclusion

The authentication system serves as the **foundational entry point** for the entire platform, enabling:

1. **Identity Management**: Secure user registration and login
2. **Role Assignment**: Automatic role-based access control
3. **Profile Integration**: Direct link to profile management features
4. **Trust & Quality**: Foundation for provider verification and platform oversight
5. **Scalability**: Prepared for production-ready enhancements in Week 4

This system differentiates BookFlow as a **Managed Services Platform** (like Urban Company) rather than an open marketplace, ensuring quality control and professional service delivery through authenticated, role-based access control.
