# WanderWise AI ✈️

An AI-powered travel planning web app where users generate personalized itineraries with a conversational AI assistant, save trips, explore curated destinations on an interactive map, and share travel posts through a social community feed with comments, follows, and bookmarks.

🌍 **Live App:** https://wanderwise-ai-psi.vercel.app

---

## Features

### AI trip planning
- **AI Trip Planner** — Generate day-by-day itineraries (OpenAI `gpt-4o`) from destination, budget, duration, interests, travel style, and an optional start date.
- **AI Chat Assistant** — Conversational refinement of your itinerary: add food experiences, swap activities, change the pace, or brainstorm a destination before you start. Updates the itinerary in place, with quick-reply chips.
- **Real-place validation** — Mapbox Geocoding + an AI "Did you mean…" check (parallel) catch fake/typo'd destinations before generation. Debounced destination autocomplete on the planner and hero search.
- **AI packing list** — Each itinerary comes with a categorized packing checklist you can tick off, **remove items from, and add your own to** (saved per trip).
- **Weather forecast** — 5-day forecast for the destination on the trip detail page (OpenWeather).
- **Trip dates** — Optional start date auto-computes the end date from the trip length.

### Maps & photos
- **Interactive Map** — Genuinely mappable stops are pinned with **place-name labels**, colour-coded by day, with clickable popups. Geocoding is proximity-biased to the destination and drops low-confidence matches, so an ambiguous name won't land on the wrong continent.
- **Attractive photography** — Destination and activity images come from Pexels, with Wikipedia and a curated set as fallbacks.
- **Cards ↔ Timeline** — Toggle the day-by-day plan between a card stack and a vertical timeline.

### Social
- **Community Feed** — Three-column layout with **Latest / Trending / Following** tabs, expand-on-focus composer, animated heart-pop on like, and a trending-destinations + travel-tip right rail.
- **Comments** — Inline, collapsible comment threads on every post (delete your own, or any on your own post).
- **Follow / unfollow** — Follower & following counts with list modals; a **Following** feed of posts from people you follow.
- **Bookmarks** — Save any post and revisit it from the **Saved** tab on your profile.
- **Recency-weighted Trending** — Ranks by likes + comments decayed by post age, so fresh popular posts surface.
- **Shareable posts** — The Share button copies a link that opens the feed and scrolls to (and highlights) that exact post.
- **Image uploads** — Drag-and-drop uploads for posts and profile pictures via Cloudinary, with paste-a-URL as a fallback.

### Account
- **Authentication** — Email/password (JWT) with strong password rules (≥8 chars, uppercase, number, special char) and live validation, plus **Sign in with Google** (OAuth).
- **Unified Profile** — Account hub with bio, location, travel-interest chips, profile picture, posts, saved trips, bookmarks, follow stats, and quick actions.
- **Settings** — Change password and email (both require current-password confirmation).
- **Public Explore landing** — Browse 20 curated destinations + a weekly AI-cached "Trending this week" strip without an account; sign up only when you want to plan or post.

### Look & feel
- **Warm editorial design** — Fraunces serif headlines over a pine / golden-ochre / blossom palette on warm paper; magenta accents live where people and passions are (likes, destination tags, interests).
- **Dark & light themes** — sun/moon toggle in the navbar; preference persists and defaults to your system setting, with no flash on load.
- **A voice, not a template** — headlines and prompts rotate from a pool of editorial lines, so the site never greets you the same way twice. Feed cards rise in with staggered motion; likes burst pink.

> **Optional integrations degrade gracefully:** without their keys, image upload falls back to URL-paste, the weather card and Google button hide, and photos fall back to Wikipedia/curated images — the app still runs.

---

## Tech Stack

**Frontend**
- React + Vite
- Tailwind CSS with a CSS-variable design system — warm paper / deep pine / golden ochre / blossom magenta / espresso ink, with role-tuned **light & dark themes** behind a single `.dark` class
- Fraunces (serif display) + Inter (body) via Google Fonts
- React Router v6, Axios
- react-map-gl v7 + Mapbox GL JS
- Google Identity Services (Sign in with Google)

**Backend**
- Node.js + Express.js
- MongoDB Atlas + Mongoose
- JSON Web Tokens (JWT), bcryptjs

**APIs & services**
- OpenAI API — `gpt-4o` (itinerary generation, chat refinement, weekly trending) · `gpt-4o-mini` (typo correction). JSON structured-output mode.
- Mapbox — Geocoding, Maps, autocomplete
- OpenWeather — 5-day forecast (server-side key)
- Pexels — photography (server-side key) · Wikipedia REST — fallback photos
- Cloudinary — unsigned image uploads
- Google OAuth 2.0 — third-party sign-in

**Deployment**
- Frontend: Vercel · Backend: Render · Database: MongoDB Atlas

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account, OpenAI API key, Mapbox public token
- *(Optional)* Cloudinary, OpenWeather, Pexels, and Google OAuth credentials for the extra features

### Installation

```bash
git clone https://github.com/Srijith1912/wanderwise-ai.git
cd wanderwise-ai

# backend
cd server && npm install

# frontend
cd ../client && npm install
```

### Environment variables

Full templates live in **`server/.env.example`** and **`client/.env.example`**.

`server/.env`:

```
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
CLIENT_URL=http://localhost:5173

# Optional — features hide/fallback if unset:
OPENWEATHER_API_KEY=your_openweather_key       # weather forecast
PEXELS_API_KEY=your_pexels_key                 # nicer photos
GOOGLE_CLIENT_ID=your_google_oauth_client_id   # Google sign-in (same id as client)
```

`client/.env`:

```
VITE_MAPBOX_TOKEN=your_mapbox_public_token
VITE_API_URL=                                  # blank in local dev (Vite proxies /api)

# Optional:
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### Run

```bash
# backend (from /server)
npm run dev        # nodemon, or: npm start

# frontend (from /client)
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000`.

> ⚠️ The live backend uses Render's free tier and may take 30–60 seconds to wake after inactivity.

---

## Project Structure

```
wanderwise-ai/
├── client/                             # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Avatar.jsx               # Image-or-initials gradient avatar
│   │   │   ├── DestinationInput.jsx     # Debounced Mapbox autocomplete
│   │   │   ├── GoogleSignInButton.jsx   # Sign in with Google (GIS)
│   │   │   ├── ImageUpload.jsx          # Cloudinary upload + URL-paste fallback
│   │   │   ├── Layout.jsx / Navbar.jsx
│   │   │   ├── MapView.jsx              # Mapbox map, labeled place pins
│   │   │   ├── PackingList.jsx          # Editable packing checklist
│   │   │   ├── PlannerChat.jsx          # AI refinement chat popup
│   │   │   ├── PostCard.jsx             # Feed card: like/comment/save/share
│   │   │   ├── SmartImage.jsx           # Pexels → Wikipedia → curated fallback
│   │   │   └── WeatherStrip.jsx         # 5-day forecast
│   │   ├── contexts/AuthContext.jsx     # Auth state + useAuth()
│   │   ├── pages/                       # Explore, Feed, Login, Signup, Settings,
│   │   │                                # TripPlanner, TripDetail, SavedTrips, UserProfile
│   │   ├── services/                    # auth, explore, post, trip, user, weather
│   │   └── utils/                       # cloudinary, geocode, passwordRules, photo, wikiPhoto
│   ├── tailwind.config.js · vercel.json · vite.config.js
│
├── server/                             # Express backend
│   ├── controllers/                    # auth, explore, photo, post, trip, user, weather
│   ├── data/destinations.js            # 20 curated destinations
│   ├── middleware/authMiddleware.js
│   ├── models/                         # User, Trip, Post, TrendingCache
│   ├── routes/                         # auth, explore, photo, post, trip, user, weather
│   └── server.js
│
└── README.md
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Register (validates password rules) | No |
| POST | `/api/auth/login` | Login → JWT | No |
| POST | `/api/auth/google` | Verify Google ID token → JWT (find-or-create) | No |
| GET | `/api/auth/me` | Current user | Yes |
| PUT | `/api/auth/profile` | Update name / bio / picture / country / interests | Yes |
| PUT | `/api/auth/password` | Change password | Yes |
| PUT | `/api/auth/email` | Change email | Yes |

### Trips
| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/trips/generate` | Generate AI itinerary | Yes |
| POST | `/api/trips/refine` | Conversational refinement | Yes |
| POST | `/api/trips/suggest-destination` | "Did you mean…" suggestions | Yes |
| POST | `/api/trips/save` | Save a trip | Yes |
| GET | `/api/trips` · `/api/trips/:id` | List / get trips | Yes |
| PUT · DELETE | `/api/trips/:id` | Rename / delete | Yes |

### Posts
| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| POST · GET | `/api/posts` | Create / list posts | Yes |
| GET | `/api/posts/user/:userId` | Posts by a user | Yes |
| POST | `/api/posts/:id/like` | Toggle like | Yes |
| POST · GET | `/api/posts/:id/comment` · `/comments` | Add / list comments | Yes |
| DELETE | `/api/posts/:id/comment/:commentId` | Delete a comment | Yes |
| POST | `/api/posts/:id/save` | Toggle bookmark | Yes |
| GET | `/api/posts/saved/me` | Current user's saved posts | Yes |

### Users (social graph)
| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/users/:id` | Public profile + follow counts + isFollowing | Yes |
| POST | `/api/users/:id/follow` | Toggle follow | Yes |
| GET | `/api/users/:id/followers` · `/following` | Follower / following lists | Yes |
| GET | `/api/users/me/feed` | Posts from people you follow | Yes |

### Explore / Weather / Photos
| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/explore` | Curated destinations (continent / budget / vibe filters) | No |
| GET | `/api/explore/trending` | Weekly AI-cached trending destinations | No |
| GET | `/api/weather?city=` | 5-day forecast (OpenWeather) | Yes |
| GET | `/api/photos?query=` | Best landscape photo (Pexels proxy) | No |

---

## Roadmap

### Recently shipped (Jul 13, 2026)
- ✅ Visual identity v2 — Fraunces serif + pine/ochre/blossom palette, italic-serif logotype
- ✅ Dark/light theme toggle (persisted, system-default, token-level theming)
- ✅ Rotating editorial copy (hero, feed, composer prompts)
- ✅ Profile header redesign (large avatar beside identity, cover removed)
- ✅ Fixed hero titles rendering dark over photos

### Recently shipped (Jul 8, 2026)
- ✅ Comments, follows + Following feed, bookmarks (Saved tab)
- ✅ Cloudinary image uploads (drag-drop) with URL-paste fallback
- ✅ AI packing list (editable), weather forecast, trip start/end dates
- ✅ Cards ↔ Timeline trip view
- ✅ Map reworked to labeled, proximity-accurate place pins
- ✅ Pexels photography with Wikipedia/curated fallbacks
- ✅ Recency-weighted Trending; share-to-post scroll
- ✅ Sign in with Google (OAuth)

### Planned
- [ ] Group trip planning & shared itineraries
- [ ] Expense splitting between travelers (Splitwise-style)
- [ ] Real-time direct messages
- [ ] Stories / 24-hr ephemeral posts
- [ ] Live location sharing in groups
- [ ] Traveler matching

> Notes: an AI per-trip **cost estimate** and per-day **route lines** were prototyped and then removed — cost figures read as misleadingly precise (real expense-splitting is planned instead), and route lines added map clutter versus clean labeled pins.
