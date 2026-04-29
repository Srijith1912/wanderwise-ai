# WanderWise AI ✈️

An AI-powered travel planning web app where users generate personalized itineraries with a conversational AI assistant, save trips, explore curated destinations on an interactive map, and share travel posts through a community feed.

🌍 **Live App:** https://wanderwise-ai-psi.vercel.app

---

## Features

- **AI Trip Planner** — Generate day-by-day itineraries powered by OpenAI based on destination, budget, duration, interests, and travel style.
- **AI Chat Assistant** — Conversational refinement of your itinerary. Ask the assistant to add food experiences, swap activities, change the pace, or suggest a destination before you start. Updates the itinerary in place.
- **Real-place validation** — Mapbox Geocoding catches fake/typo'd destinations before generation. If Mapbox can't find a place, an AI-powered "Did you mean…" fallback suggests close matches.
- **Interactive Map** — View geocoded activity markers color-coded by day on a Mapbox map, with clickable popups for each activity.
- **Saved Trips** — Save, rename, and delete generated itineraries; full detail view with map and travel tips.
- **Community Feed** — Three-column layout with filter pills (Latest / Trending / Following [coming soon]), expand-on-focus composer, animated heart-pop on like, share-link button, and a right rail with trending destinations + travel-tip card.
- **Image URL paste** — Add images to posts and profile pictures by pasting a public URL (Unsplash, Imgur, etc.). Live preview, no upload needed.
- **Unified Profile** — Account hub combining your bio, location, travel-interests chips, profile picture, posts, saved trips, and quick actions.
- **Settings page** — Change password and email (both require current-password confirmation).
- **Public Explore landing** — Browse 20 curated destinations without an account; sign up only when you want to plan or post.
- **Authentication** — JWT-based with strong password rules (≥8 chars, uppercase, number, special character). Live validation checkmarks on signup.

---

## Tech Stack

**Frontend**

- React + Vite
- Tailwind CSS (custom palette: cream / forest / terracotta / coral / ink)
- Plus Jakarta Sans (display) + Inter (body) via Google Fonts
- React Router v6
- Axios
- react-map-gl v7 + Mapbox GL JS

**Backend**

- Node.js + Express.js
- MongoDB Atlas + Mongoose
- JSON Web Tokens (JWT)
- bcryptjs

**APIs**

- OpenAI API (gpt-4o-mini, JSON-structured-output mode)
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
CLIENT_URL=http://localhost:5173
```

Create `client/.env`:

```
VITE_MAPBOX_TOKEN=your_mapbox_public_token
VITE_API_URL=http://localhost:5000
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

> ⚠️ **Note:** The live backend is hosted on Render's free tier and may take 30–60 seconds to respond after a period of inactivity.

---

## Project Structure

```
wanderwise-ai/
├── client/                          # React frontend (Vite)
│   ├── public/
│   │   └── favicon.svg              # Custom paper-plane favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Avatar.jsx           # Image-or-initials gradient avatar
│   │   │   ├── Layout.jsx           # Navbar + footer wrapper
│   │   │   ├── MapView.jsx          # Mapbox map with day-coded markers
│   │   │   ├── Navbar.jsx           # Sticky navbar + profile dropdown
│   │   │   └── PlannerChat.jsx      # AI chat panel for trip refinement
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx      # Auth state + useAuth() hook
│   │   ├── pages/
│   │   │   ├── ExplorePage.jsx      # Public landing + destinations grid
│   │   │   ├── FeedPage.jsx         # 3-column social feed
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SavedTripsPage.jsx
│   │   │   ├── SettingsPage.jsx     # Password + email change
│   │   │   ├── SignupPage.jsx       # With live password-rule checklist
│   │   │   ├── TripDetailPage.jsx
│   │   │   ├── TripPlannerPage.jsx  # Form + result + sticky chat panel
│   │   │   └── UserProfilePage.jsx  # Unified profile + account hub
│   │   ├── services/
│   │   │   ├── authService.js       # auth + profile + password/email
│   │   │   ├── exploreService.js
│   │   │   ├── postService.js
│   │   │   └── tripService.js       # generate / refine / suggest / save
│   │   ├── utils/
│   │   │   ├── geocode.js           # Mapbox helpers for place validation
│   │   │   └── passwordRules.js     # Shared client/server password rules
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css                # Tailwind + design-system component classes
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js           # Custom palette + fonts
│   ├── vercel.json                  # SPA routing for Vercel
│   └── vite.config.js               # Vite proxy for local dev
│
├── server/                          # Express backend
│   ├── controllers/
│   │   ├── authController.js        # register / login / me / profile / password / email
│   │   ├── exploreController.js
│   │   ├── postController.js
│   │   └── tripController.js        # generate / refine / suggest-destination / save
│   ├── data/
│   │   └── destinations.js          # 20 curated destinations
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Post.js
│   │   ├── Trip.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── exploreRoutes.js
│   │   ├── postRoutes.js
│   │   └── tripRoutes.js
│   └── server.js
│
├── .gitignore
└── README.md
```

---

## API Endpoints

| Method | Endpoint                          | Description                                                                                | Auth |
| ------ | --------------------------------- | ------------------------------------------------------------------------------------------ | ---- |
| POST   | `/api/auth/register`              | Register new user (validates password rules)                                               | No   |
| POST   | `/api/auth/login`                 | Login and get token                                                                        | No   |
| GET    | `/api/auth/me`                    | Get current user                                                                           | Yes  |
| PUT    | `/api/auth/profile`               | Update name / bio / profilePicture / homeCountry / travelInterests                         | Yes  |
| PUT    | `/api/auth/password`              | Change password (verifies current, validates new)                                          | Yes  |
| PUT    | `/api/auth/email`                 | Change email (verifies password, prevents collision)                                       | Yes  |
| POST   | `/api/trips/generate`             | Generate AI itinerary                                                                      | Yes  |
| POST   | `/api/trips/refine`               | Conversational refinement — returns `{ reply, updatedItinerary?, suggestedDestination? }`  | Yes  |
| POST   | `/api/trips/suggest-destination`  | "Did you mean…" suggestions for invalid place names                                        | Yes  |
| POST   | `/api/trips/save`                 | Save a trip                                                                                | Yes  |
| GET    | `/api/trips`                      | Get all user trips                                                                         | Yes  |
| GET    | `/api/trips/:id`                  | Get single trip                                                                            | Yes  |
| PUT    | `/api/trips/:id`                  | Update trip title                                                                          | Yes  |
| DELETE | `/api/trips/:id`                  | Delete a trip                                                                              | Yes  |
| POST   | `/api/posts`                      | Create a post (caption + optional destinationTag + optional imageUrl)                      | Yes  |
| GET    | `/api/posts`                      | Get all posts                                                                              | Yes  |
| GET    | `/api/posts/user/:userId`         | Get posts by a user                                                                        | Yes  |
| POST   | `/api/posts/:id/like`             | Toggle like on post                                                                        | Yes  |
| GET    | `/api/explore`                    | Get destinations (filterable by continent / budget / vibe)                                 | No   |

---

## Roadmap

### Recently Shipped (Apr 27–28, 2026)

- ✅ Full visual redesign — custom palette, typography, layout, navbar, favicon
- ✅ AI conversational chatbot for itinerary refinement
- ✅ Real-place validation with "did you mean…" fallback
- ✅ Settings page (password + email change)
- ✅ Unified Profile / account hub (Dashboard merged in)
- ✅ Public Explore landing
- ✅ Social-media feel feed (filter pills, animated likes, trending sidebar)
- ✅ Image URL paste for posts and profile pictures
- ✅ Strong password rules with live validation checkmarks

### In Progress / Near-Term

- [ ] Comments on posts
- [ ] Follow / unfollow users + Friends page
- [ ] "Following" timeline filter on the feed
- [ ] Cloudinary upload (replacing URL-paste)
- [ ] Weather forecast per destination (OpenWeather API)
- [ ] AI-generated packing list per trip
- [ ] Trip calendar view

### Planned

- [ ] OAuth: Sign in with Google (and optionally GitHub)
- [ ] Group trip planning
- [ ] Expense splitting (Splitwise-style)
- [ ] Real-time direct messages
- [ ] Stories / 24hr ephemeral posts
- [ ] Live location sharing in groups
- [ ] Traveler matching algorithm
