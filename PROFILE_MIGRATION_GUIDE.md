# Profile Management Migration Guide

This guide documents all changes made during the Profile Management Week 1 implementation.

## Database Migrations

### 1. Users Table - Profile Fields
```sql
-- Add profile-related columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE;
```

**Status:** ✅ Executed successfully
**Location:** PostgreSQL database
**Rollback:**
```sql
ALTER TABLE users DROP COLUMN IF EXISTS phone;
ALTER TABLE users DROP COLUMN IF EXISTS avatar_url;
ALTER TABLE users DROP COLUMN IF EXISTS address;
ALTER TABLE users DROP COLUMN IF EXISTS bio;
ALTER TABLE users DROP COLUMN IF EXISTS is_profile_complete;
```

### 2. Provider Profiles Table - Timestamps
```sql
-- Add timestamp columns to provider_profiles table
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

**Status:** ✅ Executed successfully
**Location:** PostgreSQL database
**Rollback:**
```sql
ALTER TABLE provider_profiles DROP COLUMN IF EXISTS created_at;
ALTER TABLE provider_profiles DROP COLUMN IF EXISTS updated_at;
```

## Backend File Changes

### Modified Files

#### 1. `/backend/app/models/user.py`
**Changes:**
- Added import: `from sqlalchemy import Text`
- Added columns:
  - `phone = Column(String, nullable=True)`
  - `avatar_url = Column(String, nullable=True)`
  - `address = Column(String, nullable=True)`
  - `bio = Column(Text, nullable=True)`
  - `is_profile_complete = Column(Boolean, default=False)`

**Lines changed:** ~10 lines added
**Purpose:** Support profile data storage

#### 2. `/backend/app/models/provider.py`
**Changes:**
- Added import: `from sqlalchemy import DateTime`
- Added import: `from datetime import datetime`
- Added columns:
  - `created_at = Column(DateTime, default=datetime.utcnow)`
  - `updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)`

**Lines changed:** ~5 lines added
**Purpose:** Track provider profile creation and updates

#### 3. `/backend/app/schemas/user.py`
**Changes:**
- Added `UserProfileUpdate` schema for self-service updates
- Enhanced `UserUpdate` schema with profile fields
- Updated `User` response schema to include:
  - `phone: Optional[str]`
  - `avatar_url: Optional[str]`
  - `address: Optional[str]`
  - `bio: Optional[str]`
  - `is_profile_complete: Optional[bool]`

**Lines changed:** ~30 lines added
**Purpose:** API request/response validation

#### 4. `/backend/app/api/v1/auth.py`
**Changes:**
- Added imports:
  - `from datetime import datetime` (to `timedelta, datetime`)
  - `import httpx`
  - `UserProfileUpdate` to schema imports
- Added endpoints:
  - `PUT /me` - Update profile
  - `GET /me/profile` - Get complete profile
- Updated `GET /me` endpoint (existing)

**Lines changed:** ~40 lines added
**Purpose:** Profile management endpoints

#### 5. `/backend/app/api/v1/providers.py`
**Changes:**
- Complete rewrite of provider profile management
- Added imports:
  - `logging`, `datetime`, `status`
  - Provider schemas
  - `get_current_user` dependency
- Added endpoints:
  - `POST /profile` - Create provider profile
  - `PUT /profile` - Update provider profile
  - `GET /profile/me` - Get my provider profile
- Existing list/get endpoints retained

**Lines changed:** ~150 lines added/modified
**Purpose:** Provider onboarding and profile management

### New Files

#### 1. `/backend/app/schemas/provider.py`
**Purpose:** Pydantic schemas for provider profile validation
**Lines:** ~40 lines
**Contents:**
- `ProviderProfileBase` - Base schema with common fields
- `ProviderProfileCreate` - Creation schema with required fields
- `ProviderProfileUpdate` - Update schema with optional fields
- `ProviderProfile` - Response schema with all fields

#### 2. `/backend/alembic/versions/add_profile_fields_to_users.py`
**Purpose:** Alembic migration for profile fields (manual)
**Lines:** ~30 lines
**Status:** Created but not executed (direct SQL used instead)
**Note:** Keep for future Alembic consistency

## Frontend File Changes

### Modified Files

#### 1. `/frontend/src/context/AuthContext.tsx`
**Changes:**
- Extended `User` interface with:
  - `phone?: string`
  - `address?: string`
  - `bio?: string`
  - `is_profile_complete?: boolean`
- Extended `AuthContextType` with:
  - `refreshUser: () => Promise<void>`
- Added `refreshUser()` function implementation

**Lines changed:** ~25 lines added
**Purpose:** Support profile fields in user state

#### 2. `/frontend/src/pages/Profile.tsx`
**Changes:**
- Complete redesign (300+ lines total)
- Added imports:
  - Multiple Lucide icons (Edit2, Save, X, Phone, MapPin, etc.)
  - UI components (Input, Label, Textarea, Alert)
  - `api` from `@/lib/api`
- Added state management:
  - `isEditing` - Edit mode toggle
  - `isSaving` - Save in progress
  - `showProviderSetup` - Provider onboarding visibility
  - `profileData` - Form state
  - `providerData` - Provider setup form state
- Added features:
  - Profile edit mode with inline form
  - Provider setup card with alerts
  - Profile completion badge
  - Save/Cancel actions
  - Real-time refresh after updates
  - Empty state messaging

**Lines changed:** Complete file rewrite (~300 lines)
**Purpose:** Full profile management UI

## Documentation Files

### New Documentation

1. **PROFILE_MANAGEMENT.md**
   - 300+ lines
   - Comprehensive implementation guide
   - API documentation
   - Database schema
   - Frontend integration
   - Testing guide
   - Future roadmap

2. **PROFILE_QUICK_REFERENCE.md**
   - Quick reference cheat sheet
   - API endpoints table
   - Code examples
   - Common errors
   - Data structures

3. **PROFILE_IMPLEMENTATION_SUMMARY.md**
   - Implementation summary
   - Deliverables list
   - Test results
   - Success metrics
   - Next steps

4. **PROFILE_ARCHITECTURE.md**
   - Visual architecture diagrams
   - Data flow examples
   - Role-based requirements
   - Error handling
   - Future roadmap

5. **test_profile_management.sh**
   - Automated testing script
   - 12 comprehensive tests
   - Color-coded output
   - Edge case coverage

## API Changes

### New Endpoints

| Method | Endpoint | Purpose | Auth | Role |
|--------|----------|---------|------|------|
| `PUT` | `/api/v1/auth/me` | Update user profile | Required | Any |
| `GET` | `/api/v1/auth/me/profile` | Get complete profile | Required | Any |
| `POST` | `/api/v1/providers/profile` | Create provider profile | Required | Provider |
| `PUT` | `/api/v1/providers/profile` | Update provider profile | Required | Provider |
| `GET` | `/api/v1/providers/profile/me` | Get my provider profile | Required | Provider |

### Modified Endpoints

| Method | Endpoint | Change |
|--------|----------|--------|
| `GET` | `/api/v1/auth/me` | Response now includes profile fields |

### Breaking Changes

**None** - All changes are additive. Existing functionality preserved.

## Dependencies

### No New Dependencies Added

All features implemented using existing packages:
- Backend: FastAPI, SQLAlchemy, Pydantic (already installed)
- Frontend: React, TypeScript, existing UI components

## Configuration Changes

### No Configuration Changes Required

- No environment variables added
- No settings updates needed
- No Docker configuration changes
- Backend restart required to load new code

## Testing Coverage

### Automated Tests Added

**test_profile_management.sh** - 12 test cases:

1. ✅ Provider registration
2. ✅ Provider login
3. ✅ Get current user profile
4. ✅ Update basic user profile
5. ✅ Get complete profile
6. ✅ Get provider profile (not created - should fail)
7. ✅ Create provider profile
8. ✅ Get provider profile (should succeed)
9. ✅ Verify profile completion status
10. ✅ Try duplicate provider profile (should fail)
11. ✅ Update provider profile
12. ✅ Customer attempting provider profile (should fail)

**All tests passing:** ✅

## Deployment Steps

### Development Environment

1. **Pull latest code:**
   ```bash
   git pull origin main
   ```

2. **Apply database migrations:**
   ```bash
   # Option A: Use provided SQL
   docker-compose exec -T db psql -U postgres -d booking_db < migrations.sql
   
   # Option B: Execute manually (already done in your environment)
   ```

3. **Restart backend:**
   ```bash
   docker-compose restart backend
   ```

4. **Verify backend:**
   ```bash
   curl http://localhost:8000/docs
   # Should show new endpoints
   ```

5. **Install frontend dependencies (if needed):**
   ```bash
   cd frontend && npm install
   ```

6. **Restart frontend:**
   ```bash
   npm run dev
   ```

7. **Run tests:**
   ```bash
   chmod +x test_profile_management.sh
   ./test_profile_management.sh
   ```

### Production Environment

1. **Backup database:**
   ```bash
   pg_dump -U postgres booking_db > backup_$(date +%Y%m%d).sql
   ```

2. **Apply migrations:**
   ```sql
   -- In a transaction for safety
   BEGIN;
   
   ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR;
   ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR;
   ALTER TABLE users ADD COLUMN IF NOT EXISTS address VARCHAR;
   ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
   ALTER TABLE users ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE;
   
   ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
   ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
   
   COMMIT;
   ```

3. **Deploy backend:**
   ```bash
   # Build new Docker image
   docker-compose build backend
   
   # Deploy with zero downtime (use your deployment strategy)
   docker-compose up -d backend
   ```

4. **Deploy frontend:**
   ```bash
   cd frontend
   npm run build
   # Deploy dist/ to your hosting service
   ```

5. **Smoke test:**
   ```bash
   # Test key endpoints
   curl -X GET https://your-domain.com/api/v1/auth/me \
     -H "Authorization: Bearer {token}"
   ```

6. **Monitor logs:**
   ```bash
   docker-compose logs -f backend
   ```

## Rollback Procedure

If issues arise, rollback in reverse order:

1. **Revert frontend:**
   ```bash
   git checkout <previous-commit>
   cd frontend && npm run build
   # Redeploy
   ```

2. **Revert backend:**
   ```bash
   git checkout <previous-commit>
   docker-compose build backend
   docker-compose up -d backend
   ```

3. **Revert database (if necessary):**
   ```sql
   BEGIN;
   
   -- Remove new columns
   ALTER TABLE users DROP COLUMN IF EXISTS phone;
   ALTER TABLE users DROP COLUMN IF EXISTS avatar_url;
   ALTER TABLE users DROP COLUMN IF EXISTS address;
   ALTER TABLE users DROP COLUMN IF EXISTS bio;
   ALTER TABLE users DROP COLUMN IF EXISTS is_profile_complete;
   
   ALTER TABLE provider_profiles DROP COLUMN IF EXISTS created_at;
   ALTER TABLE provider_profiles DROP COLUMN IF EXISTS updated_at;
   
   COMMIT;
   ```

   **⚠️ WARNING:** Only rollback database if no production data has been created in new columns.

## Data Migration

### Existing Users

No action needed. Existing users will have:
- `phone = NULL`
- `avatar_url = NULL`
- `address = NULL`
- `bio = NULL`
- `is_profile_complete = FALSE`

Providers will see the onboarding prompt when they next visit their profile.

### Existing Provider Profiles

Provider profiles will have:
- `created_at = CURRENT_TIMESTAMP` (when column was added)
- `updated_at = CURRENT_TIMESTAMP` (when column was added)

These timestamps will update correctly on future updates.

## Monitoring & Validation

### Key Metrics to Monitor

1. **Profile Completion Rate:**
   ```sql
   SELECT 
     COUNT(CASE WHEN is_profile_complete THEN 1 END)::float / COUNT(*) * 100 as completion_rate
   FROM users 
   WHERE role = 'PROVIDER';
   ```

2. **Provider Profile Creation:**
   ```sql
   SELECT COUNT(*) FROM provider_profiles WHERE created_at > NOW() - INTERVAL '7 days';
   ```

3. **Profile Update Activity:**
   ```sql
   SELECT COUNT(*) FROM users WHERE updated_at > NOW() - INTERVAL '24 hours';
   ```

### Error Logs to Watch

- 403 errors on `/providers/profile` (customers trying to create provider profiles)
- 404 errors on `/providers/profile/me` (providers without profiles)
- 422 validation errors (bio too short, etc.)

## Support & Troubleshooting

### Common Issues

**Issue:** Provider can't create profile
- Check: User role is "provider" (not "PROVIDER")
- Check: No existing provider profile for user

**Issue:** Profile completion not updating
- Check: All required fields populated (full_name, phone, address, bio)
- Check: User role is "provider"

**Issue:** Frontend not showing new fields
- Check: Frontend rebuilt after code changes
- Check: Browser cache cleared
- Check: AuthContext refreshUser() called after updates

### Debug Commands

```bash
# Check user profile fields
docker-compose exec -T db psql -U postgres -d booking_db \
  -c "SELECT email, phone, bio, is_profile_complete FROM users WHERE role = 'provider' LIMIT 5;"

# Check provider profiles
docker-compose exec -T db psql -U postgres -d booking_db \
  -c "SELECT * FROM provider_profiles LIMIT 5;"

# Check API logs
docker-compose logs backend | grep -i profile

# Test endpoint directly
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer {token}"
```

## Summary of Changes

- **Files Modified:** 7
- **Files Created:** 6
- **Database Tables Modified:** 2
- **New API Endpoints:** 5
- **Lines of Code Added:** ~600
- **Documentation Pages:** 4
- **Tests Added:** 12

**Total Impact:** Medium - Additive changes with no breaking modifications

**Risk Level:** Low - All changes backward compatible

**Rollback Difficulty:** Easy - Database rollback straightforward, code rollback simple

---

**Migration Status:** ✅ COMPLETE
**Date:** January 3, 2026
**Version:** Profile Management v1.0 (Week 1)
