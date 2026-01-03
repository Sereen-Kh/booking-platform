# Services API - Setup Instructions

## Database Changes

### New Fields Added:
- `services.location` - Location where the service is provided

### Updated API Response:
The Service schema now includes:
- `rating` - Average rating (calculated from reviews)
- `review_count` - Total number of reviews

## Setup Steps

### 1. Start Docker Services
Make sure Docker Desktop is running, then:
```bash
cd /Users/sereenkh/Github-Projects/booking-platform
docker-compose up -d
```

### 2. Run Database Migrations
```bash
cd backend
source .venv/bin/activate
alembic upgrade head
```

### 3. Seed Featured Services
```bash
# First run the basic seed if not already done
python seed.py

# Then seed the featured services
python seed_featured_services.py
```

## API Endpoints

### Get All Services
```
GET /api/v1/services/
```

**Query Parameters:**
- `skip` - Number of records to skip (default: 0)
- `limit` - Number of records to return (default: 10, max: 100)
- `category_id` - Filter by category ID
- `provider_id` - Filter by provider ID
- `min_price` - Minimum price filter
- `max_price` - Maximum price filter
- `search` - Search by service name

**Response Example:**
```json
[
  {
    "id": 1,
    "name": "Home Cleaning",
    "description": "Professional home cleaning service with eco-friendly products",
    "price": 80.0,
    "duration_minutes": 150,
    "category_id": 1,
    "provider_id": 1,
    "image_url": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
    "location": "Your Location",
    "rating": 4.9,
    "review_count": 328,
    "provider": {
      "id": 1,
      "email": "sparkle@cleaning.com",
      "full_name": "Sparkle Clean Co.",
      "role": "provider"
    }
  }
]
```

### Get Recommended Services
```
GET /api/v1/services/recommended
```

**Query Parameters:**
- `limit` - Number of services to return (default: 6, max: 20)

Returns random services with rating and review count.

### Get Single Service
```
GET /api/v1/services/{service_id}
```

Returns a single service with provider details.

### Get Services by Provider
```
GET /api/v1/services/by-provider/{provider_id}
```

Returns all services from a specific provider.

## Featured Services Included

The seed script adds these 6 featured services:

1. **Home Cleaning** - Sparkle Clean Co. ($80, 4.9★, 328 reviews)
2. **Personal Training** - FitLife Studio ($65, 4.8★, 215 reviews)
3. **Hair Styling** - Luxe Salon ($55, 5.0★, 412 reviews)
4. **Plumbing Repair** - Quick Fix Pros ($95, 4.7★, 189 reviews)
5. **Massage Therapy** - Zen Wellness ($90, 4.9★, 276 reviews)
6. **Pet Grooming** - Pawfect Care ($45, 4.8★, 167 reviews)

## Frontend Integration

Update your frontend API calls to use the backend endpoints:

```typescript
// Get all services
const response = await fetch('http://localhost:8000/api/v1/services/');
const services = await response.json();

// Get recommended services for homepage
const response = await fetch('http://localhost:8000/api/v1/services/recommended?limit=6');
const featured = await response.json();
```

## Testing

Test the API using curl:
```bash
# Get all services
curl http://localhost:8000/api/v1/services/

# Get recommended services
curl http://localhost:8000/api/v1/services/recommended?limit=6

# Get specific service
curl http://localhost:8000/api/v1/services/1
```

Or visit the API documentation at:
```
http://localhost:8000/docs
```
