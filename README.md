# 🎯 Service Booking Platform

A modern, full-stack service booking and management platform built with **FastAPI**, **React 19**, **TypeScript**, **PostgreSQL**, and **Docker**. This platform enables customers to discover and book services, providers to manage their offerings, and administrators to oversee the entire ecosystem.

---

## 🚀 Tech Stack

### Frontend

- **React 19** with **TypeScript** (Vite)
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Router** for navigation
- **Context API** for state management
- Dark/Light theme support

### Backend

- **FastAPI** (Python 3.13)
- **SQLAlchemy** (async) with **PostgreSQL 15**
- **Pydantic v2** for data validation
- **Alembic** for database migrations
- **JWT Authentication** (OAuth2 + Google OAuth)
- **Redis 7** for caching

### DevOps

- **Docker** & **Docker Compose**
- **Uvicorn** ASGI server
- **PostgreSQL** persistent storage
- **Redis** for session management

---

## ✨ Features

### Authentication & Authorization

- ✅ User registration and login (JWT-based)
- ✅ Google OAuth integration
- ✅ Role-based access control (Customer, Provider, Admin)
- ✅ Secure password hashing
- ✅ Token-based authentication

### Core Features

- 🔍 **Service Discovery** - Browse and search services by category, price, and provider
- 📅 **Booking System** - Schedule appointments with conflict detection
- ⭐ **Reviews & Ratings** - Leave feedback on services
- ❤️ **Favorites** - Save favorite services
- 💳 **Payment Integration** - Process payments securely
- 📊 **Provider Dashboard** - Manage services, bookings, and availability
- 🛠️ **Admin Dashboard** - Platform-wide management and analytics

### User Experience

- 🌗 Dark/Light mode toggle
- 📱 Responsive design
- 👤 User profile with booking history
- 🔔 Real-time booking notifications
- 🎨 Modern UI with shadcn/ui components

---

## 🛠️ Getting Started

### Prerequisites

- **Docker** and **Docker Compose**
- **Python 3.13+**
- **Node.js 18+** and **npm/bun**

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/booking-platform.git
   cd booking-platform
   ```

2. **Start infrastructure services (PostgreSQL & Redis):**

   ```bash
   docker compose up -d
   ```

3. **Backend Setup:**

   ```bash
   cd backend

   # Create virtual environment
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate

   # Install dependencies
   pip install -r requirements.txt

   # Run database migrations
   alembic upgrade head

   # Seed database (optional)
   python seed.py

   # Start backend server
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Frontend Setup:**

   ```bash
   cd frontend

   # Install dependencies
   npm install
   # or with bun
   bun install

   # Start development server
   npm run dev
   # or
   bun run dev
   ```

5. **Access the application:**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:8000](http://localhost:8000)
   - API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint                | Description             | Auth Required |
| ------ | ----------------------- | ----------------------- | ------------- |
| POST   | `/api/v1/auth/register` | Register new user       | No            |
| POST   | `/api/v1/auth/login`    | Login with credentials  | No            |
| POST   | `/api/v1/auth/google`   | Login with Google OAuth | No            |
| GET    | `/api/v1/auth/me`       | Get current user info   | Yes           |

### Services Endpoints

| Method | Endpoint                                | Description                      | Auth Required  |
| ------ | --------------------------------------- | -------------------------------- | -------------- |
| GET    | `/api/v1/services`                      | List all services (with filters) | No             |
| GET    | `/api/v1/services/recommended`          | Get recommended services         | No             |
| GET    | `/api/v1/services/categories`           | List all categories              | No             |
| GET    | `/api/v1/services/{id}`                 | Get service details              | No             |
| GET    | `/api/v1/services/provider/my-services` | Get provider's services          | Yes (Provider) |
| POST   | `/api/v1/services/provider/my-services` | Create new service               | Yes (Provider) |

### Bookings Endpoints

| Method | Endpoint                   | Description             | Auth Required  |
| ------ | -------------------------- | ----------------------- | -------------- |
| POST   | `/api/v1/bookings`         | Create new booking      | Yes            |
| GET    | `/api/v1/bookings/me`      | Get user's bookings     | Yes            |
| GET    | `/api/v1/bookings/managed` | Get provider's bookings | Yes (Provider) |
| GET    | `/api/v1/bookings/all`     | Get all bookings        | Yes (Admin)    |

### Additional Endpoints

- **Favorites**: `/api/v1/favorites`
- **Reviews**: `/api/v1/reviews`
- **Payments**: `/api/v1/payments`
- **Providers**: `/api/v1/providers`
- **Admin**: `/api/v1/admin`

Full interactive API documentation available at: **[http://localhost:8000/docs](http://localhost:8000/docs)**

---

## 📁 Project Structure

```
booking-platform/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # API endpoints
│   │   ├── core/            # Config & security
│   │   ├── models/          # Database models
│   │   └── schemas/         # Pydantic schemas
│   ├── alembic/             # Database migrations
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # Context providers
│   │   ├── pages/           # Page components
│   │   └── utils/           # API utilities
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 🔧 Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost/booking_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm run test
```

---

## 🚀 Deployment

The application is containerized and can be deployed to:

- **Docker Swarm**
- **Kubernetes**
- **AWS ECS/EKS**
- **Google Cloud Run**
- **Heroku**

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- Your Name - [@yourusername](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- FastAPI for the excellent Python framework
- React team for the amazing frontend library
- shadcn/ui for the beautiful component library
- All contributors and supporters of this project
