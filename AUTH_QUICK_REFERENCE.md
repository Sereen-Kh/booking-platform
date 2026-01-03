# Authentication Quick Reference Guide

## For Backend Developers

### Add Protected Endpoint

```python
from fastapi import Depends
from app.api.deps import get_current_user
from app.models.user import User

@router.get("/my-endpoint")
async def my_protected_endpoint(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Access user info
    user_email = current_user.email
    user_role = current_user.role
    user_id = current_user.id
    
    # Your logic here
    return {"message": f"Hello {current_user.full_name}"}
```

### Role-Based Authorization

```python
from fastapi import HTTPException, status

@router.post("/admin-only")
async def admin_only_endpoint(
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Admin logic here
    return {"message": "Admin access granted"}
```

### Multiple Role Check

```python
ALLOWED_ROLES = ["admin", "provider"]

@router.get("/provider-or-admin")
async def provider_or_admin_endpoint(
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ALLOWED_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Required roles: {', '.join(ALLOWED_ROLES)}"
        )
    
    return {"message": "Access granted"}
```

## For Frontend Developers

### Use Authentication Context

```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, loading, login, register, logout } = useAuth();
  
  if (loading) return <Loader />;
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  return (
    <div>
      <p>Welcome, {user.full_name}</p>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protect a Route

```typescript
// In App.tsx
import ProtectedRoute from '@/components/ProtectedRoute';

<Route
  path="/my-protected-page"
  element={
    <ProtectedRoute allowedRoles={['customer', 'provider']}>
      <MyProtectedPage />
    </ProtectedRoute>
  }
/>
```

### Make Authenticated API Call

```typescript
import { apiRequest } from '@/utils/api';

async function fetchMyData() {
  try {
    const data = await apiRequest('/my-endpoint');
    // Token is automatically included
    return data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}
```

### Conditional Rendering by Role

```typescript
import { useAuth } from '@/context/AuthContext';

function Navigation() {
  const { user } = useAuth();
  
  return (
    <nav>
      <a href="/">Home</a>
      
      {user?.role === 'admin' && (
        <a href="/admin/dashboard">Admin Dashboard</a>
      )}
      
      {user?.role === 'provider' && (
        <a href="/provider/dashboard">Provider Dashboard</a>
      )}
      
      {user?.role === 'customer' && (
        <a href="/bookings">My Bookings</a>
      )}
    </nav>
  );
}
```

## Testing

### Test User Registration (cURL)

```bash
# Register a customer
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "full_name": "Test User",
    "role": "customer"
  }'

# Register a provider
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "provider@example.com",
    "password": "ProviderPass123",
    "full_name": "Test Provider",
    "role": "provider"
  }'
```

### Test Login (cURL)

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=SecurePass123"
```

### Test Protected Endpoint (cURL)

```bash
# Get token from login response, then:
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test with Python

```python
import requests

# Register
response = requests.post(
    'http://localhost:8000/api/v1/auth/register',
    json={
        'email': 'test@example.com',
        'password': 'SecurePass123',
        'full_name': 'Test User',
        'role': 'customer'
    }
)
print(response.json())

# Login
response = requests.post(
    'http://localhost:8000/api/v1/auth/login',
    data={
        'username': 'test@example.com',
        'password': 'SecurePass123'
    }
)
token = response.json()['access_token']

# Use token
response = requests.get(
    'http://localhost:8000/api/v1/auth/me',
    headers={'Authorization': f'Bearer {token}'}
)
print(response.json())
```

## Common Patterns

### Get Current User ID

```python
# Backend
@router.get("/my-bookings")
async def get_my_bookings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Booking).where(Booking.user_id == current_user.id)
    )
    return result.scalars().all()
```

### Check User Ownership

```python
@router.delete("/bookings/{booking_id}")
async def delete_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Get booking
    result = await db.execute(
        select(Booking).where(Booking.id == booking_id)
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check ownership or admin
    if booking.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to delete this booking"
        )
    
    await db.delete(booking)
    await db.commit()
    return {"message": "Booking deleted"}
```

### Frontend Form Validation

```typescript
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

function LoginForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = loginSchema.safeParse({ email, password });
    
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }
    
    // Proceed with login
    await login(email, password);
  };
  
  // ... rest of component
}
```

## Environment Variables

### Backend (.env)

```bash
# Security
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/dbname

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:8000/api/v1
```

## Debugging

### Check Token Contents

```python
from jose import jwt

token = "your.jwt.token"
payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
print(payload)
# {'sub': 'user@example.com', 'role': 'customer', 'user_id': 1, 'exp': 1735904400}
```

### Verify Password Hash

```python
from app.core.security import verify_password, get_password_hash

password = "SecurePass123"
hashed = get_password_hash(password)
print(f"Hashed: {hashed}")

is_valid = verify_password(password, hashed)
print(f"Valid: {is_valid}")
```

### Check User in Database

```python
# Using async shell
from sqlalchemy import select
from app.models.user import User
from app.database import async_session

async with async_session() as session:
    result = await session.execute(
        select(User).where(User.email == "test@example.com")
    )
    user = result.scalar_one_or_none()
    if user:
        print(f"User: {user.email}, Role: {user.role}, Active: {user.is_active}")
```

## Error Reference

| Status Code | Error | Cause | Solution |
|-------------|-------|-------|----------|
| 400 | Bad Request | Invalid input data | Check request payload matches schema |
| 401 | Unauthorized | Invalid/expired token | Re-login to get new token |
| 403 | Forbidden | Insufficient permissions | Check user role matches required role |
| 404 | Not Found | Resource doesn't exist | Verify resource ID |
| 409 | Conflict | Duplicate email | Use different email or login |
| 500 | Internal Server Error | Server-side issue | Check server logs |

## Quick Start Checklist

### Backend Setup
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Create database: `createdb booking_db`
- [ ] Run migrations: `alembic upgrade head`
- [ ] Start server: `uvicorn app.main:app --reload`

### Frontend Setup
- [ ] Install dependencies: `npm install` or `bun install`
- [ ] Configure API URL in `.env`
- [ ] Start dev server: `npm run dev` or `bun run dev`

### Test Authentication
- [ ] Navigate to http://localhost:5173/auth
- [ ] Register a new user
- [ ] Login with credentials
- [ ] Verify redirect to appropriate dashboard
- [ ] Check JWT token in localStorage
- [ ] Test protected API endpoint

## Support

For issues or questions:
1. Check the comprehensive [AUTHENTICATION_IMPLEMENTATION.md](./AUTHENTICATION_IMPLEMENTATION.md)
2. Review API documentation at http://localhost:8000/docs
3. Check backend logs for detailed error messages
4. Verify database schema with Alembic migrations
