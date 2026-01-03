# 🎯 Quick Test Guide - Provider Registration

## ✅ System Status

**Backend:** Running on http://localhost:8000  
**Frontend:** Running on http://localhost:3001  
**Database:** PostgreSQL running in Docker  
**Redis:** Running in Docker

---

## 🧪 Test Provider Registration Now

### Option 1: Using the UI (Recommended)

1. **Open your browser:**

   ```
   http://localhost:3001/auth
   ```

2. **Click "Sign Up"**

3. **Fill in the form:**

   - **Full Name:** Test Provider
   - **Email:** testprovider123@example.com
   - **Password:** Provider123
   - **Role:** Click **"Offer Services (Provider)"** button

4. **Click "Sign up"**

### Expected Results:

#### ✅ Success:

```
Toast Message:
"Welcome to BookFlow!
Your provider account has been created successfully."

Then automatically redirects to:
→ /provider/dashboard
```

#### ⚠️ If Email Already Exists:

```
Toast Message:
"Registration Failed
A user with this email already exists in the system"

Action: Try a different email address
```

#### ⚠️ If Backend is Down:

```
Toast Message:
"Server Connection Failed
Cannot connect to the backend server at http://localhost:8000.
Please ensure it is running."

Action: Run: docker-compose up -d
```

---

### Option 2: Using cURL (API Test)

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "another@example.com",
    "password": "Strong123",
    "full_name": "Another Provider",
    "role": "provider"
  }'
```

**Expected Response:**

```json
{
  "email": "another@example.com",
  "full_name": "Another Provider",
  "role": "provider",
  "id": 27,
  "is_active": true,
  "created_at": "2026-01-03T19:15:00.000000Z",
  "updated_at": null
}
```

---

## 📋 Test Different Scenarios

### 1. Test Customer Registration

- Select: **"Book Services (Customer)"**
- Should redirect to: `/` (home page)

### 2. Test Password Validation

Try these invalid passwords:

- `short` → Error: "Password must be at least 8 characters"
- `alllowercase123` → Error: "Password must contain at least one uppercase letter"
- `ALLUPPERCASE123` → Error: "Password must contain at least one lowercase letter"
- `NoNumbers!` → Error: "Password must contain at least one number"

### 3. Test Email Validation

- Invalid: `notanemail` → Error: "Please enter a valid email address"
- Invalid: `@example.com` → Error: "Please enter a valid email address"

### 4. Test Duplicate Email

1. Register with email: `duplicate@test.com`
2. Try to register again with same email
3. Should see: "A user with this email already exists in the system"

### 5. Test Login After Registration

1. After successful registration, logout
2. Go to `/auth` and click "Sign In"
3. Enter your credentials
4. Should automatically redirect to role-specific dashboard

---

## 🔍 Troubleshooting

### Frontend Can't Connect to Backend

**Symptoms:**

```
Error: Cannot connect to the backend server at http://localhost:8000
```

**Solution:**

```bash
# Check if backend is running
docker ps

# If not running, start it
cd /Users/sereenkh/Github-Projects/booking-platform
docker-compose up -d

# Check logs
docker-compose logs backend --tail 50
```

### Backend Shows Stripe Error

**Symptoms:**

```
ModuleNotFoundError: No module named 'stripe'
```

**Solution:**

```bash
# Rebuild backend image
docker-compose build backend
docker-compose up -d
```

### Port Already in Use

**Symptoms:**

```
Error: Port 3001 is already in use
```

**Solution:**

```bash
# Find and kill the process
lsof -ti:3001 | xargs kill -9

# Or use a different port
PORT=3002 npm run dev
```

---

## 🎓 Understanding Error Messages

| Error Message                          | Meaning                      | Action                               |
| -------------------------------------- | ---------------------------- | ------------------------------------ |
| "Cannot connect to the backend server" | Backend is offline           | Start Docker: `docker-compose up -d` |
| "Email already exists"                 | User account already created | Use different email or login         |
| "Password must contain uppercase"      | Weak password                | Add capital letter: `Provider123`    |
| "Please enter a valid email"           | Invalid email format         | Use format: `user@example.com`       |
| "Not authenticated"                    | No login token               | Login first at `/auth`               |

---

## ✅ Verification Checklist

Before reporting an issue, verify:

- [ ] Backend is running: `curl http://localhost:8000/api/v1/auth/me`
- [ ] Frontend is accessible: Open http://localhost:3001
- [ ] Database is running: `docker ps | grep booking_db`
- [ ] No console errors in browser (F12 → Console tab)
- [ ] Using valid email format
- [ ] Password meets requirements (8+ chars, uppercase, lowercase, number)
- [ ] Not using an already registered email

---

## 🚀 Quick Commands

```bash
# Start everything
cd /Users/sereenkh/Github-Projects/booking-platform
docker-compose up -d
cd frontend && npm run dev

# Stop everything
docker-compose down
pkill -f "vite"

# View logs
docker-compose logs -f backend
docker-compose logs -f db

# Rebuild if needed
docker-compose build backend
docker-compose up -d

# Test backend health
curl http://localhost:8000/api/v1/auth/me
```

---

## 📞 Support

If you still encounter issues after following this guide:

1. Check [PROVIDER_REGISTRATION_FIX.md](./PROVIDER_REGISTRATION_FIX.md) for detailed explanation
2. Review backend logs: `docker-compose logs backend`
3. Check browser console (F12) for frontend errors
4. Verify all services are running: `docker ps`

---

**Last Updated:** January 3, 2026  
**Status:** ✅ All Systems Operational
