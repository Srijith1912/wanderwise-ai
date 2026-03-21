# WanderWise AI

An AI-powered travel planning web app with personalized itineraries, saved trips, interactive maps, and a social community feed.

## Features

- 🤖 AI-generated personalized itineraries
- 💾 Save and manage trips
- 🗺️ Interactive map visualization
- 📱 Simple social feed for travelers
- 👤 User authentication with JWT
- 🔐 Protected routes and secure sessions

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS + React Router
- **Backend:** Node.js + Express.js
- **Database:** MongoDB Atlas with Mongoose
- **Authentication:** JWT + bcryptjs
- **AI:** OpenAI API
- **Maps:** Mapbox
- **HTTP Client:** Axios
- **Deployment:** Vercel (frontend), Render (backend) - Coming soon

## Getting Started

### Prerequisites

- Node.js v22+
- npm v10+
- MongoDB Atlas account
- OpenAI API key
- Git

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

# Backend setup (in new terminal)
cd server
npm install
npm start
# Runs on http://localhost:5000
```

### Environment Variables

**Backend** - Create `.env` in `server/` folder:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wanderwise-dev
OPENAI_API_KEY=sk-your-openai-api-key-here
JWT_SECRET=your_super_secret_key_change_in_production_12345
PORT=5000
NODE_ENV=development
```

**Frontend** - Uses `http://localhost:5000` as backend URL

## Project Structure

```
wanderwise-ai/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   ├── pages/                   # Page components (Login, Signup, Dashboard)
│   │   ├── contexts/                # React Context (AuthContext)
│   │   ├── services/                # API service layer (authService)
│   │   ├── utils/                   # Helper functions
│   │   ├── App.jsx                  # Main app with routing
│   │   └── main.jsx                 # Vite entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Express backend
│   ├── controllers/                 # Route handlers (authController)
│   ├── routes/                      # API endpoints (authRoutes)
│   ├── models/                      # MongoDB schemas (User)
│   ├── middleware/                  # Auth & error handling (authMiddleware)
│   ├── services/                    # Business logic
│   ├── config/                      # Configuration files
│   ├── server.js                    # Entry point
│   ├── package.json
│   └── .env.example
│
├── README.md
└── .gitignore
```

## Current Phase: Phase 2 ✅ Complete

### What's Implemented

**Backend Authentication:**

- User registration endpoint (`POST /api/auth/register`)
- User login endpoint (`POST /api/auth/login`)
- Get current user endpoint (`GET /api/auth/me`)
- JWT token generation and verification
- Password hashing with bcryptjs
- MongoDB user schema

**Frontend Authentication:**

- AuthContext for global state management
- Login page with email/password form
- Signup page with validation
- Dashboard page (protected route)
- Protected routes using ProtectedRoute component
- Token storage in localStorage
- Session restoration on page refresh
- Responsive UI with Tailwind CSS

**Testing:**

- All endpoints tested in Postman
- Complete signup → login → dashboard flow verified
- Protected routes working correctly
- Token persistence across page refresh

## Project Timeline

| Phase | Task              | Status      | ETA    |
| ----- | ----------------- | ----------- | ------ |
| **1** | Project Setup     | ✅ Complete | Mar 19 |
| **2** | Authentication    | ✅ Complete | Mar 20 |
| **3** | Trip Planner (AI) | ⏳ Upcoming | Mar 26 |
| **4** | Saved Trips       | ⏳ Upcoming | Apr 2  |
| **5** | Map Integration   | ⏳ Upcoming | Apr 9  |
| **6** | Community Feed    | ⏳ Upcoming | Apr 16 |
| **7** | Explore/Trending  | ⏳ Upcoming | Apr 23 |
| **8** | Polish & Deploy   | ⏳ Upcoming | Apr 30 |

## How to Test Authentication

### Sign Up

1. Go to `http://localhost:5173/signup`
2. Fill in name, email, password
3. Click "Sign Up"
4. Should redirect to dashboard

### Log In

1. Go to `http://localhost:5173/login`
2. Enter email and password from signup
3. Click "Log In"
4. Should redirect to dashboard

### Protected Routes

1. While logged in, go to `http://localhost:5173/dashboard`
2. Should see your profile
3. Clear localStorage, refresh
4. Should redirect to login

### Logout

1. Click logout button on dashboard
2. Should redirect to login
3. localStorage should be empty

## Development Notes

### Key Files to Understand

- `client/src/contexts/AuthContext.jsx` - Global auth state management
- `client/src/pages/LoginPage.jsx` - Login form with validation
- `client/src/pages/SignupPage.jsx` - Signup form with password confirmation
- `client/src/pages/DashboardPage.jsx` - Protected page showing user info
- `server/controllers/authController.js` - Auth logic (register, login, getCurrentUser)
- `server/middleware/authMiddleware.js` - JWT verification
- `server/routes/authRoutes.js` - Auth endpoints

### Important Concepts

- **JWT Authentication:** Stateless authentication using signed tokens
- **Protected Routes:** Routes that only render if user is authenticated
- **React Context:** Global state without prop drilling
- **Axios Interceptors:** Automatically add auth token to requests
- **MongoDB + Mongoose:** Schema-based data modeling

## Known Issues & Future Improvements

### Current Session Restoration Bug (Phase 8)

- On page refresh, user briefly redirects to login before session restores
- Causes: Timing gap while checking token validity
- Fix: Add loading state during auth check (Phase 8 - Polish)

### Planned Improvements

- Add email confirmation on signup
- Add password reset functionality
- Add user profile editing
- Add two-factor authentication
- Improve error messages and validation
- Add rate limiting for API endpoints

## Contributing

This is a personal portfolio project. For feedback or suggestions, please open an issue.

## License

MIT

## Author

Srijith Mulupuri
[GitHub](https://github.com/Srijith1912)

## Acknowledgments

- Anthropic's Claude for guidance and learning
- OpenAI for AI API
- React, Express, MongoDB communities
