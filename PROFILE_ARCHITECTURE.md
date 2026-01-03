# Profile Management Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROFILE MANAGEMENT SYSTEM                            │
│                    Week 1: Identity Foundation (COMPLETE)                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│                              USER JOURNEY                                  │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  Registration → Login → Profile Page → Edit Profile → Save                │
│       ↓           ↓          ↓             ↓            ↓                  │
│    [User]     [Token]   [Profile UI]   [Form Data]  [API Call]            │
│                                                                            │
│  PROVIDER ONLY:                                                            │
│  Registration → See Alert → Complete Setup → Profile Complete             │
│       ↓            ↓            ↓                 ↓                         │
│   [Provider]  [Prompt]  [Required Fields]  [is_complete=true]             │
│                                                                            │
└───────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND ARCHITECTURE                            │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────────┐         ┌──────────────────┐                         │
│  │  Profile.tsx    │────────▶│  AuthContext     │                         │
│  │                 │         │                  │                         │
│  │ • Edit Mode     │         │ • user           │                         │
│  │ • Provider Setup│◀────────│ • refreshUser()  │                         │
│  │ • Form Handling │         │ • loading        │                         │
│  └─────────────────┘         └──────────────────┘                         │
│         │                              │                                   │
│         │                              │                                   │
│         ▼                              ▼                                   │
│  ┌─────────────────────────────────────────────┐                          │
│  │           API Client (api.js)               │                          │
│  │                                             │                          │
│  │  • PUT /auth/me                             │                          │
│  │  • POST /providers/profile                  │                          │
│  │  • GET /auth/me                             │                          │
│  └─────────────────────────────────────────────┘                          │
│                                                                            │
└───────────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/JSON
                              │
                              ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                           BACKEND ARCHITECTURE                             │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────────┐         ┌──────────────────┐                         │
│  │  auth.py        │         │  providers.py    │                         │
│  │                 │         │                  │                         │
│  │ GET /auth/me    │         │ POST /profile    │                         │
│  │ PUT /auth/me    │         │ PUT /profile     │                         │
│  │ GET /me/profile │         │ GET /profile/me  │                         │
│  └────────┬────────┘         └────────┬─────────┘                         │
│           │                           │                                    │
│           │                           │                                    │
│           ▼                           ▼                                    │
│  ┌─────────────────────────────────────────────┐                          │
│  │         Dependencies & Middleware           │                          │
│  │                                             │                          │
│  │  • get_current_user()                       │                          │
│  │  • get_db()                                 │                          │
│  │  • JWT verification                         │                          │
│  └─────────────────┬───────────────────────────┘                          │
│                    │                                                       │
│                    ▼                                                       │
│  ┌─────────────────────────────────────────────┐                          │
│  │         Pydantic Schemas (Validation)       │                          │
│  │                                             │                          │
│  │  • UserProfileUpdate                        │                          │
│  │  • ProviderProfileCreate                    │                          │
│  │  • ProviderProfileUpdate                    │                          │
│  └─────────────────┬───────────────────────────┘                          │
│                    │                                                       │
│                    ▼                                                       │
│  ┌─────────────────────────────────────────────┐                          │
│  │         SQLAlchemy Models (ORM)             │                          │
│  │                                             │                          │
│  │  • User (enhanced with profile fields)      │                          │
│  │  • ProviderProfile                          │                          │
│  └─────────────────┬───────────────────────────┘                          │
│                    │                                                       │
│                    ▼                                                       │
└───────────────────────────────────────────────────────────────────────────┘
                    │
                    │ SQL
                    │
                    ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                           DATABASE LAYER                                   │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌────────────────────────────────────────────────┐                       │
│  │              users TABLE                       │                       │
│  │                                                │                       │
│  │  • id (PK)                                     │                       │
│  │  • email                                       │                       │
│  │  • hashed_password                             │                       │
│  │  • full_name                                   │                       │
│  │  • role (CUSTOMER | PROVIDER | ADMIN)          │                       │
│  │  • phone            ◀─ NEW                     │                       │
│  │  • avatar_url       ◀─ NEW                     │                       │
│  │  • address          ◀─ NEW                     │                       │
│  │  • bio              ◀─ NEW                     │                       │
│  │  • is_profile_complete  ◀─ NEW                 │                       │
│  │  • is_active                                   │                       │
│  │  • created_at                                  │                       │
│  │  • updated_at                                  │                       │
│  └────────────────────────────────────────────────┘                       │
│                          │                                                 │
│                          │ Foreign Key                                     │
│                          ▼                                                 │
│  ┌────────────────────────────────────────────────┐                       │
│  │         provider_profiles TABLE                │                       │
│  │                                                │                       │
│  │  • id (PK)                                     │                       │
│  │  • user_id (FK → users.id, UNIQUE)             │                       │
│  │  • business_name                               │                       │
│  │  • bio                                         │                       │
│  │  • location                                    │                       │
│  │  • availability (JSONB)                        │                       │
│  │  • created_at       ◀─ NEW                     │                       │
│  │  • updated_at       ◀─ NEW                     │                       │
│  └────────────────────────────────────────────────┘                       │
│                                                                            │
└───────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW EXAMPLES                               │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  1. UPDATE USER PROFILE:                                                   │
│  ────────────────────────────────────────────────────────────────         │
│  User clicks "Save"                                                        │
│    → PUT /auth/me {phone, bio, address}                                   │
│    → JWT validation                                                        │
│    → get_current_user() extracts user from token                          │
│    → UserProfileUpdate schema validates data                              │
│    → Update User model fields                                             │
│    → Check is_profile_complete (for providers)                            │
│    → Commit to database                                                    │
│    → Return updated user                                                   │
│    → Frontend calls refreshUser()                                         │
│    → UI updates                                                            │
│                                                                            │
│  2. CREATE PROVIDER PROFILE:                                               │
│  ────────────────────────────────────────────────────────────────         │
│  Provider clicks "Complete Setup"                                          │
│    → POST /providers/profile {business_name, bio, location}               │
│    → JWT validation                                                        │
│    → Check user.role == PROVIDER                                          │
│    → Check no existing provider profile                                    │
│    → ProviderProfileCreate schema validates                               │
│    → Create ProviderProfile record                                        │
│    → Update User.full_name = business_name                                │
│    → Update User.bio = bio                                                │
│    → Update User.address = location                                       │
│    → Set User.is_profile_complete = True                                  │
│    → Commit to database                                                    │
│    → Return provider profile                                               │
│    → Frontend calls refreshUser()                                         │
│    → UI removes setup prompt                                               │
│                                                                            │
│  3. PROFILE COMPLETION CHECK:                                              │
│  ────────────────────────────────────────────────────────────────         │
│  On every profile update (for providers):                                  │
│    → required_fields = ["full_name", "phone", "address", "bio"]           │
│    → is_complete = all(getattr(user, field) for field in required_fields) │
│    → user.is_profile_complete = is_complete                               │
│    → This ensures profile stays synchronized                              │
│                                                                            │
└───────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│                        ROLE-BASED REQUIREMENTS                             │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────────────────┐  ┌─────────────────────────┐               │
│  │      CUSTOMER           │  │      PROVIDER           │               │
│  │                         │  │                         │               │
│  │  Profile Fields:        │  │  Profile Fields:        │               │
│  │  • phone (optional)     │  │  • phone (REQUIRED)     │               │
│  │  • address (optional)   │  │  • address (REQUIRED)   │               │
│  │  • bio (optional)       │  │  • bio (REQUIRED)       │               │
│  │  • avatar (optional)    │  │  • avatar (optional)    │               │
│  │                         │  │                         │               │
│  │  Provider Profile:      │  │  Provider Profile:      │               │
│  │  ✗ Cannot create        │  │  ✓ Can create           │               │
│  │                         │  │  • business_name (REQ)  │               │
│  │  Enforcement:           │  │  • bio (REQ)            │               │
│  │  ✗ None                 │  │  • location (REQ)       │               │
│  │                         │  │  • availability (OPT)   │               │
│  │                         │  │                         │               │
│  │                         │  │  Enforcement:           │               │
│  │                         │  │  ✓ Before listing       │               │
│  │                         │  │    services             │               │
│  └─────────────────────────┘  └─────────────────────────┘               │
│                                                                            │
│  ┌─────────────────────────┐                                              │
│  │      ADMIN              │                                              │
│  │                         │                                              │
│  │  Profile Fields:        │                                              │
│  │  • Same as customer     │                                              │
│  │    (all optional)       │                                              │
│  │                         │                                              │
│  │  Special Access:        │                                              │
│  │  ✓ View all profiles    │                                              │
│  │  ✓ Update any profile   │                                              │
│  │  ✓ Verify providers     │                                              │
│  │    (Week 2)             │                                              │
│  └─────────────────────────┘                                              │
│                                                                            │
└───────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│                          ERROR HANDLING                                    │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  400 Bad Request                                                           │
│  ├─ Duplicate provider profile                                            │
│  └─ "Provider profile already exists. Use PUT to update."                 │
│                                                                            │
│  401 Unauthorized                                                          │
│  ├─ Invalid/expired JWT token                                             │
│  └─ "Could not validate credentials"                                      │
│                                                                            │
│  403 Forbidden                                                             │
│  ├─ Wrong role for endpoint                                               │
│  └─ "Only providers can create a provider profile"                        │
│                                                                            │
│  404 Not Found                                                             │
│  ├─ Provider profile doesn't exist                                        │
│  └─ "Please complete your provider profile before listing services"       │
│                                                                            │
│  422 Validation Error                                                      │
│  ├─ Field length/format violations                                        │
│  ├─ "ensure this value has at least 10 characters"                        │
│  └─ "Input should be a valid string"                                      │
│                                                                            │
└───────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│                          FUTURE ROADMAP                                    │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  WEEK 2: Managed Identity & Verification                                   │
│  ├─ Provider onboarding workflow                                          │
│  ├─ Background check integration                                          │
│  ├─ Training module tracking                                              │
│  ├─ Certification management                                              │
│  └─ Admin approval system                                                 │
│                                                                            │
│  WEEK 3: Trust & Reputation                                                │
│  ├─ Rating and review system                                              │
│  ├─ Performance metrics                                                    │
│  ├─ Quality score calculation                                             │
│  ├─ Trust badges                                                          │
│  └─ Review response system                                                │
│                                                                            │
│  WEEK 4: Functional Dashboards & Security                                  │
│  ├─ Provider earnings dashboard                                           │
│  ├─ Availability management                                               │
│  ├─ Booking analytics                                                      │
│  ├─ Rate limiting                                                         │
│  ├─ Soft delete implementation                                            │
│  └─ Advanced input validation                                             │
│                                                                            │
└───────────────────────────────────────────────────────────────────────────┘
```

## Key Architecture Principles

### 1. **Separation of Concerns**
- Frontend: UI/UX and state management
- Backend API: Business logic and validation
- Database: Data persistence and integrity

### 2. **Role-Based Design**
- Different requirements per user role
- Flexible enforcement points
- Future-ready for admin controls

### 3. **Progressive Enhancement**
- Week 1: Basic profile foundation
- Week 2-4: Advanced features layered on top
- Backward compatible design

### 4. **Data Consistency**
- Provider profile syncs with user base profile
- Single source of truth for user identity
- Automatic completion tracking

### 5. **User-Centric**
- Clear onboarding for providers
- Optional profiles for customers
- Helpful error messages
- Real-time feedback
