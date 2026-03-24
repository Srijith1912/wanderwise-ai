# WanderWise AI

An AI-powered travel planning web app with personalized itineraries, saved trips, interactive maps, and a social community feed.

## Features

- 🤖 AI-generated personalized day-by-day itineraries
- 💾 Save and manage trips
- 🗺️ Interactive map visualization _(coming soon)_
- 📱 Simple social feed for travelers _(coming soon)_
- 👤 User authentication with JWT
- 🔐 Protected routes and secure sessions

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS + React Router
- **Backend:** Node.js + Express.js
- **Database:** MongoDB Atlas + Mongoose
- **Authentication:** JWT + bcryptjs
- **AI:** OpenAI API (gpt-4o-mini)
- **Maps:** Mapbox _(coming soon)_
- **HTTP Client:** Axios
- **Deployment:** Vercel (frontend), Render (backend) _(coming soon)_

## Getting Started

### Prerequisites

- Node.js v22+
- npm v10+
- MongoDB Atlas account
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/Srijith1912/wanderwise-ai.git
cd wanderwise-ai

# Frontend setup
cd client
npm install
npm run dev
# Runs on http://localhost:5173

# Backend setup (in a new terminal)
cd server
npm install
npm start
# Runs on http://localhost:5000
```

### Environment Variables

Create a `.env` file in the `server/` folder:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wanderwise-dev
OPENAI_API_KEY=sk-your-openai-api-key-here
JWT_SECRET=your_super_secret_key_here
PORT=5000
NODE_ENV=development
```

## Project Structure

```
wanderwise-ai/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   ├── pages/                   # Login, Signup, Dashboard, TripPlanner
│   │   ├── contexts/                # AuthContext (global auth state)
│   │   ├── services/                # authService, tripService
│   │   ├── utils/
│   │   ├── App.jsx                  # Main app with routing
│   │   └── main.jsx                 # Vite entry point
│   └── package.json
│
├── server/                          # Express backend
│   ├── controllers/                 # authController, tripController
│   ├── routes/                      # authRoutes, tripRoutes
│   ├── models/                      # User, Trip schemas
│   ├── middleware/                  # authMiddleware (JWT verification)
│   ├── config/
│   ├── server.js                    # Entry point
│   └── package.json
│
├── README.md
└── .gitignore
```

## API Endpoints

### Auth

- `POST /api/auth/register` — Create new user account
- `POST /api/auth/login` — Login and receive JWT token
- `GET /api/auth/me` — Get current user (protected)

### Trips

- `POST /api/trips/generate` — Generate AI itinerary (protected)
- `POST /api/trips/save` — Save itinerary to database (protected)
- `GET /api/trips` — Get all trips for logged-in user (protected)
- `GET /api/trips/:id` — Get single trip by ID (protected)
- `DELETE /api/trips/:id` — Delete a trip (protected)

## Current Progress

| Phase | Task              | Status      |
| ----- | ----------------- | ----------- |
| 1     | Project Setup     | ✅ Complete |
| 2     | Authentication    | ✅ Complete |
| 3     | Trip Planner (AI) | ✅ Complete |
| 4     | Saved Trips       | ⏳ Upcoming |
| 5     | Map Integration   | ⏳ Upcoming |
| 6     | Community Feed    | ⏳ Upcoming |
| 7     | Explore/Trending  | ⏳ Upcoming |
| 8     | Polish & Deploy   | ⏳ Upcoming |

## What's Implemented

### Authentication

- User registration and login with JWT
- Password hashing with bcryptjs
- Protected routes on both frontend and backend
- Session persistence via localStorage
- Token restoration on page refresh

### AI Trip Planner

- Trip planner form (destination, budget, duration, interests, travel style)
- OpenAI-powered itinerary generation (gpt-4o-mini)
- Structured day-by-day itinerary with Morning / Afternoon / Evening activities
- Travel tips and trip summary
- Save generated trips to MongoDB
- Full ownership checks — users can only access their own trips

## Known Issues

### Session Restoration Timing (Minor)

On page refresh, users are briefly redirected to login before the session is restored. Fix planned for Phase 8 (Polish).

## License

MIT

## Author

Srijith Mulupuri

## Acknowledgments

- OpenAI for the AI API
- React, Express, and MongoDB communities
