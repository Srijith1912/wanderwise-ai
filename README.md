# WanderWise AI ✈️

An AI-powered travel planning web app where users can generate personalized itineraries, save trips, explore destinations on an interactive map, and share travel posts through a community feed.

🌍 **Live App:** https://wanderwise-ai-psi.vercel.app

---

## Features

- **AI Trip Planner** — Generate day-by-day itineraries powered by OpenAI based on destination, budget, duration, interests, and travel style
- **Interactive Map** — View geocoded activity markers for each day of your itinerary on a Mapbox map
- **Saved Trips** — Save, rename, and manage your generated itineraries
- **Community Feed** — Share travel posts, like others' moments, and view user profiles
- **Explore Page** — Browse curated destinations from around the world filtered by continent, budget, and vibe
- **Authentication** — Secure JWT-based login and registration with protected routes

---

## Tech Stack

**Frontend**

- React + Vite
- Tailwind CSS
- React Router v6
- Axios
- react-map-gl v7 + Mapbox GL JS

**Backend**

- Node.js + Express.js
- MongoDB Atlas + Mongoose
- JSON Web Tokens (JWT)
- bcryptjs

**APIs**

- OpenAI API (gpt-4o-mini)
- Mapbox Geocoding + Maps API

**Deployment**

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- OpenAI API key
- Mapbox public access token

### Installation

1. Clone the repository

```bash
git clone https://github.com/Srijith1912/wanderwise-ai.git
cd wanderwise-ai
```

2. Install backend dependencies

```bash
cd server
npm install
```

3. Install frontend dependencies

```bash
cd ../client
npm install
```

4. Configure environment variables

Create `server/.env`:

```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
```

Create `client/.env`:

```
VITE_MAPBOX_TOKEN=your_mapbox_public_token
```

5. Run the app

Backend (from `/server`):

```bash
npx nodemon server.js
```

Frontend (from `/client`):

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000`.

---

## Project Structure

```
wanderwise-ai/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # MapView
│   │   ├── contexts/        # AuthContext + useAuth hook
│   │   ├── pages/           # All page components
│   │   └── services/        # API call functions
│   └── vercel.json          # SPA routing config for Vercel
│
├── server/                  # Express backend
│   ├── controllers/         # Route logic
│   ├── data/                # Curated destinations data
│   ├── middleware/          # JWT auth middleware
│   ├── models/              # Mongoose schemas
│   └── routes/              # API route definitions
```

---

## API Endpoints

| Method | Endpoint                  | Description                   | Auth |
| ------ | ------------------------- | ----------------------------- | ---- |
| POST   | `/api/auth/register`      | Register new user             | No   |
| POST   | `/api/auth/login`         | Login and get token           | No   |
| GET    | `/api/auth/me`            | Get current user              | Yes  |
| POST   | `/api/trips/generate`     | Generate AI itinerary         | Yes  |
| POST   | `/api/trips/save`         | Save a trip                   | Yes  |
| GET    | `/api/trips`              | Get all user trips            | Yes  |
| GET    | `/api/trips/:id`          | Get single trip               | Yes  |
| PUT    | `/api/trips/:id`          | Update trip title             | Yes  |
| DELETE | `/api/trips/:id`          | Delete a trip                 | Yes  |
| POST   | `/api/posts`              | Create a post                 | Yes  |
| GET    | `/api/posts`              | Get all posts                 | Yes  |
| GET    | `/api/posts/user/:userId` | Get posts by user             | Yes  |
| POST   | `/api/posts/:id/like`     | Toggle like on post           | Yes  |
| GET    | `/api/explore`            | Get destinations (filterable) | No   |

---

## Future Improvements

- Image uploads on posts
- Comments on posts
- Group trip planning
- Real-time chat
- Expense splitting
- Live location sharing during trips
