# Profile Management Quick Reference

## 🎯 Quick Start

### For Customers

1. Log in to your account
2. Navigate to Profile page
3. Click "Edit Profile"
4. Add phone, address, bio (optional)
5. Save changes

### For Providers

1. Register as PROVIDER role
2. **REQUIRED:** Complete provider profile setup
3. Fill in: Business Name, Bio (10+ chars), Location
4. Click "Complete Setup"
5. Profile is now complete - ready to list services!

## 📋 API Endpoints Cheat Sheet

| Method | Endpoint                       | Purpose                 | Auth Required      |
| ------ | ------------------------------ | ----------------------- | ------------------ |
| `GET`  | `/api/v1/auth/me`              | Get current user        | ✅                 |
| `PUT`  | `/api/v1/auth/me`              | Update profile          | ✅                 |
| `GET`  | `/api/v1/auth/me/profile`      | Get complete profile    | ✅                 |
| `POST` | `/api/v1/providers/profile`    | Create provider profile | ✅ (Provider only) |
| `PUT`  | `/api/v1/providers/profile`    | Update provider profile | ✅ (Provider only) |
| `GET`  | `/api/v1/providers/profile/me` | Get my provider profile | ✅ (Provider only) |

## 🔑 Key Concepts

### Profile Completion

- **Customers:** Optional - no enforcement
- **Providers:** Required before listing services
- **Check:** `is_profile_complete` boolean field

### Required Fields by Role

**All Users (Optional):**

- phone
- avatar_url
- address
- bio

**Providers (Required):**

- business_name
- bio (10-500 chars)
- location

## 💻 Code Examples

### Update User Profile (Frontend)

```typescript
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const { refreshUser } = useAuth();

const updateProfile = async (data: {
  full_name?: string;
  phone?: string;
  address?: string;
  bio?: string;
  avatar_url?: string;
}) => {
  await api.put("/auth/me", data);
  await refreshUser(); // Refresh user context
};
```

### Create Provider Profile (Frontend)

```typescript
const setupProvider = async (data: {
  business_name: string;
  bio: string;
  location: string;
}) => {
  await api.post("/providers/profile", data);
  await refreshUser(); // Updates is_profile_complete
};
```

### Check Profile Completion (Frontend)

```typescript
const { user } = useAuth();

if (user?.role === "PROVIDER" && !user?.is_profile_complete) {
  // Show provider setup prompt
}
```

## 🚨 Common Errors

| Error Code | Message                                    | Solution                      |
| ---------- | ------------------------------------------ | ----------------------------- |
| 400        | Provider profile already exists            | Use PUT to update instead     |
| 403        | Only providers can create provider profile | Register as PROVIDER role     |
| 404        | Please complete your provider profile      | Create profile first via POST |
| 422        | Bio must be at least 10 characters         | Provide longer bio text       |

## 📊 Profile Data Structure

### User Object

```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "PROVIDER",
  "phone": "+1 555-0123",
  "avatar_url": "https://...",
  "address": "123 Main St",
  "bio": "Professional bio",
  "is_profile_complete": true,
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-03T00:00:00Z"
}
```

### Provider Profile Object

```json
{
  "id": 1,
  "user_id": 5,
  "business_name": "Pro Services",
  "bio": "Expert provider",
  "location": "San Francisco, CA",
  "availability": {},
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-03T00:00:00Z"
}
```

## 🔄 Profile Update Flow

```
1. User clicks "Edit Profile"
   ↓
2. Form shows current values
   ↓
3. User modifies fields
   ↓
4. Click "Save"
   ↓
5. PUT /auth/me
   ↓
6. Backend validates & updates
   ↓
7. refreshUser() called
   ↓
8. UI updates with new data
```

## 🎨 UI Components

### Profile Edit Form Fields

- **Full Name:** Text input
- **Phone:** Tel input (format: +1 555-0123)
- **Address:** Text input
- **Bio:** Textarea (10-500 chars)
- **Avatar URL:** Text input (URL format)

### Provider Setup Form

- **Business Name:** Text input (2-100 chars) \*
- **Bio:** Textarea (10-500 chars) \*
- **Location:** Text input (3-200 chars) \*

\*Required field

## ✅ Testing Checklist

- [ ] Customer can update profile
- [ ] Provider registration shows setup prompt
- [ ] Provider profile creation works
- [ ] `is_profile_complete` updates correctly
- [ ] Profile edit mode shows current values
- [ ] Cancel button resets form
- [ ] Error messages display properly
- [ ] Avatar displays with fallback
- [ ] Phone/address/bio show in read mode

## 🔗 Related Documentation

- [PROFILE_MANAGEMENT.md](./PROFILE_MANAGEMENT.md) - Full implementation guide
- [AUTHENTICATION_IMPLEMENTATION.md](./AUTHENTICATION_IMPLEMENTATION.md) - Auth setup
- [AUTH_QUICK_REFERENCE.md](./AUTH_QUICK_REFERENCE.md) - Auth cheat sheet

## 📝 Notes

- Profile updates are **immediate** (no approval needed)
- Provider profiles sync data with user base profile
- Profile completion checked on every update for providers
- Empty profile fields show helpful message in UI
- "Skip for now" option available but profile still incomplete
