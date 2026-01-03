# Profile Management Implementation Guide

## Overview

Profile Management transforms basic login credentials into a functional identity within the Authentication & Roles framework. Following the Urban Company managed services model, profiles provide:

- **Identity Foundation**: Basic user information (name, phone, address, bio)
- **Provider Setup**: Business profiles with onboarding requirements
- **Profile Completion Tracking**: Enforced requirements before service listing
- **Role-Specific Data**: Different profile fields based on user role

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                 Profile Management                   │
├─────────────────────────────────────────────────────┤
│  Week 1: Identity Foundation (✅ IMPLEMENTED)       │
│  - Basic profile fields (phone, address, bio)       │
│  - Provider profile setup                           │
│  - Profile completion tracking                      │
│                                                      │
│  Week 2: Managed Identity (Coming Soon)             │
│  - Provider onboarding workflow                     │
│  - Background checks & verification                 │
│  - Training completion tracking                     │
│                                                      │
│  Week 3: Trust & Reputation (Coming Soon)           │
│  - Ratings and reviews                              │
│  - Provider performance metrics                     │
│  - Quality control tracking                         │
│                                                      │
│  Week 4: Functional Dashboards (Coming Soon)        │
│  - Provider earnings summary                        │
│  - Availability management                          │
│  - Booking history and analytics                    │
└─────────────────────────────────────────────────────┘
```

## Database Schema

### Users Table (Enhanced)

```sql
ALTER TABLE users ADD COLUMN phone VARCHAR;
ALTER TABLE users ADD COLUMN avatar_url VARCHAR;
ALTER TABLE users ADD COLUMN address VARCHAR;
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN is_profile_complete BOOLEAN DEFAULT FALSE;
```

### Provider Profiles Table

```sql
CREATE TABLE provider_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id),
    business_name VARCHAR NOT NULL,
    bio VARCHAR NOT NULL,
    location VARCHAR NOT NULL,
    availability JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### User Profile Management

#### 1. Get Current User Profile

```http
GET /api/v1/auth/me
Authorization: Bearer {token}
```

**Response:**

```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "CUSTOMER",
  "phone": "+1 (555) 123-4567",
  "avatar_url": "https://example.com/avatar.jpg",
  "address": "123 Main St, City, State",
  "bio": "Professional service provider",
  "is_profile_complete": true,
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-03T00:00:00Z"
}
```

#### 2. Update User Profile

```http
PUT /api/v1/auth/me
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "full_name": "Jane Smith",
  "phone": "+1 (555) 987-6543",
  "address": "456 Oak Ave, Town, State",
  "bio": "Experienced professional with 10+ years",
  "avatar_url": "https://example.com/new-avatar.jpg"
}
```

**Response:** Updated user object

**Validation Rules:**

- All fields are optional
- `bio` must be between 10-500 characters if provided
- For providers, profile completion is checked after update

#### 3. Get Complete User Profile

```http
GET /api/v1/auth/me/profile
Authorization: Bearer {token}
```

Returns the same data as `/auth/me` but explicitly for complete profile view.

### Provider Profile Management

#### 1. Create Provider Profile (Onboarding)

```http
POST /api/v1/providers/profile
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "business_name": "John's Professional Services",
  "bio": "Expert service provider specializing in home maintenance and repairs",
  "location": "San Francisco, CA"
}
```

**Response:**

```json
{
  "id": 1,
  "user_id": 5,
  "business_name": "John's Professional Services",
  "bio": "Expert service provider specializing in home maintenance and repairs",
  "location": "San Francisco, CA",
  "availability": null,
  "created_at": "2024-01-03T00:00:00Z",
  "updated_at": "2024-01-03T00:00:00Z"
}
```

**Validation Rules:**

- Only users with `role="PROVIDER"` can create provider profiles
- `business_name`: 2-100 characters
- `bio`: 10-500 characters
- `location`: 3-200 characters
- Profile can only be created once (use PUT to update)
- Creates provider profile AND updates user's base profile fields
- Sets `is_profile_complete = true` on user account

**Side Effects:**

- User's `full_name` updated to `business_name`
- User's `bio` updated to profile `bio`
- User's `address` updated to `location`
- User's `is_profile_complete` set to `true`

#### 2. Update Provider Profile

```http
PUT /api/v1/providers/profile
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "business_name": "Updated Business Name",
  "bio": "Updated professional bio",
  "location": "New York, NY",
  "availability": {
    "monday": { "start": "09:00", "end": "17:00" },
    "tuesday": { "start": "09:00", "end": "17:00" }
  }
}
```

**Response:** Updated provider profile object

**Validation Rules:**

- All fields optional (partial updates allowed)
- Same length constraints as creation
- Syncs changes to user's base profile

#### 3. Get My Provider Profile

```http
GET /api/v1/providers/profile/me
Authorization: Bearer {token}
```

**Response:** Provider profile object

**Error Cases:**

- 403: User is not a provider
- 404: Provider profile not created yet
- Returns error message: "Please complete your provider profile before listing services"

## Frontend Integration

### Profile Page Features

1. **Profile Header**

   - Avatar display with fallback initials
   - User name, email, and role badge
   - Profile completion indicator for providers
   - Edit/Save/Cancel controls

2. **Profile Edit Mode**

   - Form fields for all profile data
   - Real-time validation
   - Save/Cancel functionality
   - Automatic user refresh after save

3. **Provider Setup Card**

   - Shown when provider hasn't completed profile
   - Alert indicator for action required
   - Three required fields: Business Name, Bio, Location
   - Completion tracking

4. **Profile Information Display**
   - Phone number with icon
   - Address with map pin icon
   - Bio text display
   - Empty state when no profile data

### Example Usage

```tsx
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

function ProfileComponent() {
  const { user, refreshUser } = useAuth();

  const updateProfile = async (data) => {
    await api.put("/auth/me", data);
    await refreshUser(); // Refresh user context
  };

  const setupProviderProfile = async (data) => {
    await api.post("/providers/profile", data);
    await refreshUser(); // Updates is_profile_complete
  };

  return (
    <div>
      {user?.role === "PROVIDER" && !user?.is_profile_complete && (
        <Alert>Complete your provider profile</Alert>
      )}
      {/* Profile form */}
    </div>
  );
}
```

## Profile Completion Logic

### For All Users

- Optional fields: phone, avatar_url, address, bio
- No enforcement - users can use platform with minimal info

### For Providers

- **Required for service listing:**
  - Business name (via provider profile)
  - Bio (minimum 10 characters)
  - Location/service area
- **Completion Check:**

  ```python
  if user.role == "PROVIDER":
      required_fields = ["full_name", "phone", "address", "bio"]
      user.is_profile_complete = all(
          getattr(user, field) for field in required_fields
      )
  ```

- **Enforcement Point:**
  - Check `is_profile_complete` before allowing service creation
  - Show onboarding prompt in profile page
  - Display completion status in UI

## Error Handling

### Common Error Responses

**400 Bad Request - Duplicate Profile**

```json
{
  "detail": "Provider profile already exists. Use PUT to update."
}
```

**403 Forbidden - Wrong Role**

```json
{
  "detail": "Only providers can create a provider profile"
}
```

**404 Not Found - No Profile**

```json
{
  "detail": "Please complete your provider profile before listing services"
}
```

**422 Validation Error**

```json
{
  "detail": [
    {
      "loc": ["body", "bio"],
      "msg": "ensure this value has at least 10 characters",
      "type": "value_error.any_str.min_length"
    }
  ]
}
```

## Testing Guide

### 1. Test Profile Update (Any User)

```bash
# Login as customer
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=customer@example.com&password=password123"

# Update profile
curl -X PUT http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Updated Name",
    "phone": "+1 555-0123",
    "bio": "My professional bio here"
  }'
```

### 2. Test Provider Profile Setup

```bash
# Register as provider
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newprovider@example.com",
    "password": "SecurePass123",
    "full_name": "Provider Name",
    "role": "PROVIDER"
  }'

# Create provider profile
curl -X POST http://localhost:8000/api/v1/providers/profile \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "Pro Services LLC",
    "bio": "Professional service provider with expertise",
    "location": "San Francisco, CA"
  }'

# Verify profile completion
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer {token}"
# Should show is_profile_complete: true
```

### 3. Test Profile Completion Enforcement

```bash
# Try to get provider profile without creating it
curl http://localhost:8000/api/v1/providers/profile/me \
  -H "Authorization: Bearer {token}"
# Should return 404 with helpful message
```

## Future Enhancements (Weeks 2-4)

### Week 2: Managed Identity

- [ ] Provider onboarding workflow
- [ ] Background check integration
- [ ] Training module tracking
- [ ] Certification upload and verification
- [ ] Admin approval workflow

### Week 3: Trust & Reputation

- [ ] Rating and review system
- [ ] Performance metrics tracking
- [ ] Quality control scoring
- [ ] Automated reputation calculation
- [ ] Review response system

### Week 4: Functional Dashboards

- [ ] Provider earnings dashboard
- [ ] Availability calendar management
- [ ] Booking history with filters
- [ ] Analytics and insights
- [ ] Export functionality

## Security Considerations

1. **Profile Data Validation**

   - All inputs sanitized
   - Length constraints enforced
   - Phone number format validation (future)
   - URL validation for avatar_url (future)

2. **Authorization**

   - Users can only update their own profile
   - Providers can only create/update their own provider profile
   - Role-based access control for profile endpoints

3. **Data Privacy**

   - Sensitive data (phone, address) only visible to authenticated users
   - Provider profiles publicly visible but with limited info
   - Admin can view all profiles for moderation

4. **Rate Limiting** (Future - Week 4)
   - Limit profile updates to prevent abuse
   - Implement cooldown period for changes
   - Monitor suspicious activity

## Conclusion

Week 1 Profile Management provides the foundation for transforming authentication credentials into functional user identities. The system supports:

✅ Basic profile management for all users
✅ Provider-specific profile setup with onboarding
✅ Profile completion tracking and enforcement
✅ Role-based profile requirements
✅ Frontend integration with edit capabilities
✅ Comprehensive error handling

This foundation enables the next phases: onboarding workflows, trust/reputation systems, and functional dashboards.
