# ✈️ Travelix — AI Travel Planner

A full-stack, multi-user AI-powered travel planning application that generates personalized itineraries, hotel recommendations, budget estimations, and smart packing lists using Google Gemini AI.

## 🏗️ Architecture

```
┌────────────────────┐     ┌─────────────────────┐     ┌──────────────┐
│   Next.js 16       │────▶│  Express 5 API      │────▶│  MongoDB     │
│   (Tailwind v4)    │     │  (TypeScript)        │     │  (Mongoose)  │
│   Port 3000        │     │  Port 5000           │     │              │
└────────────────────┘     └──────────┬───────────┘     └──────────────┘
                                      │
                                      ▼
                           ┌──────────────────────┐
                           │  Google Gemini API    │
                           │  (gemini-2.5-flash)   │
                           └──────────────────────┘
```

### Tech Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Frontend  | Next.js 16, React 19, Tailwind CSS v4, TypeScript |
| Backend   | Node.js, Express 5, TypeScript |
| Database  | MongoDB with Mongoose 9       |
| AI        | Google Gemini API (`@google/genai`) |
| Auth      | JWT (JSON Web Tokens)         |
| Validation| Zod v4                        |

## ✨ Features

### Core Features
- **JWT Authentication** — Secure register/login with bcrypt password hashing
- **AI-Generated Itineraries** — Day-by-day plans with activities, timings, and costs
- **Smart Hotel Suggestions** — Budget, Mid-Range, and Luxury tiers with real pricing
- **Budget Breakdown** — Categorized cost estimation (Flights, Accommodation, Food, Activities)
- **Editable Itinerary** — Regenerate any day with custom AI instructions
- **Add/Remove Days** — Dynamically expand or shorten your trip
- **Smart Packing Lists** — AI-curated based on destination, duration, and interests
- **Interactive Packing Checklist** — Toggle items as packed with progress tracking

### Data & Security
- **Multi-user Support** — Complete data isolation between users
- **Defense-in-Depth** — Queries scoped by userId + explicit ownership checks
- **Input Validation** — Zod schemas on all API endpoints

### UI/UX
- **Premium Dark Mode** — Glassmorphism cards, gradient accents, micro-animations
- **Responsive Design** — Mobile-first with sidebar on desktop, top bar on mobile
- **Multi-Step Wizard** — Animated trip creation flow
- **Skeleton Loading** — Smooth loading states throughout

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** (Atlas or local instance)
- **Google Gemini API Key** — Get one at [ai.google.dev](https://ai.google.dev)

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Setup

**Backend** — Create `backend/.env`:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
MONGO_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-secure-jwt-secret-at-least-32-characters
JWT_EXPIRE=30d
GEMINI_API_KEY=your-gemini-api-key
```

**Frontend** — Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

## 📁 Project Structure

### Backend (`backend/`)

```
src/
├── config/db.ts              # MongoDB connection
├── controllers/
│   ├── authController.ts     # Register, Login, GetMe
│   └── tripController.ts     # CRUD + AI operations
├── middleware/
│   ├── auth.ts               # JWT protection
│   └── errorHandler.ts       # Centralized error handling
├── models/
│   ├── User.ts               # User schema
│   └── Trip.ts               # Trip schema with sub-documents
├── routes/
│   ├── auth.ts               # /api/auth/*
│   └── trips.ts              # /api/trips/*
├── services/
│   └── aiService.ts          # All Gemini AI interactions
├── types/
│   └── index.ts              # Shared interfaces & Zod schemas
└── server.ts                 # Express entry point
```

### Frontend (`frontend/`)

```
app/
├── globals.css               # Design system (Tailwind v4)
├── layout.tsx                # Root layout (fonts, auth provider)
├── page.tsx                  # Landing page
├── (auth)/
│   ├── login/page.tsx        # Login
│   └── register/page.tsx     # Register
└── (dashboard)/
    ├── layout.tsx            # Sidebar + auth guard
    ├── dashboard/page.tsx    # Trip cards grid
    └── trips/
        ├── new/page.tsx      # Creation wizard
        └── [id]/page.tsx     # Trip detail (itinerary/hotels/budget/packing)
lib/
├── api.ts                    # API client with auth headers
├── auth.tsx                  # Auth context & useAuth hook
└── types.ts                  # Shared TypeScript types
```

## 🔌 API Endpoints

### Authentication (Public)

| Method | Endpoint             | Description      |
|--------|---------------------|------------------|
| POST   | `/api/auth/register` | Register user    |
| POST   | `/api/auth/login`    | Login user       |
| GET    | `/api/auth/me`       | Get current user |

### Trips (Protected — JWT Required)

| Method | Endpoint                      | Description                    |
|--------|-------------------------------|--------------------------------|
| GET    | `/api/trips`                  | List user's trips              |
| POST   | `/api/trips`                  | Create trip (triggers AI)      |
| GET    | `/api/trips/:id`              | Get single trip                |
| PUT    | `/api/trips/:id`              | Update trip (packing, etc.)    |
| DELETE | `/api/trips/:id`              | Delete trip                    |
| POST   | `/api/trips/:id/regenerate-day`| Regenerate a specific day     |
| POST   | `/api/trips/:id/add-day`      | Add a new AI-generated day     |
| POST   | `/api/trips/:id/remove-day`   | Remove a day & renumber        |

## 🤖 AI Design

### Prompt Strategy

All AI interactions use Google Gemini's **structured output** via `responseMimeType: 'application/json'` to guarantee valid JSON responses without fragile regex parsing.

Four specialized prompt functions:

1. **`generateFullTrip()`** — Creates complete itinerary, hotels, budget, and packing list
2. **`regenerateDayItinerary()`** — Re-generates a single day with user instructions
3. **`generateNewDay()`** — Creates a new day avoiding duplicates from existing days
4. **`generatePackingList()`** — Standalone packing list based on destination and interests

### Error Handling

- AI responses are parsed through a `cleanJsonResponse()` helper that handles markdown fences
- Parse failures throw descriptive errors caught by the controller's try/catch
- Users receive friendly error messages, never raw stack traces

## 🎨 Design System

The UI uses a custom dark-mode design system built with Tailwind CSS v4:

- **Palette**: Deep slate base, vibrant indigo/violet accents, amber/emerald status colors
- **Typography**: Inter (UI) + JetBrains Mono (numbers/code)
- **Effects**: Glassmorphism (`backdrop-blur`), gradient text, glow buttons
- **Animations**: fadeIn, slideUp, scaleIn, shimmer, float, pulse-glow
- **Components**: Glass cards, progress bars, badges, skeleton loaders, tooltips

## 📝 License

MIT
