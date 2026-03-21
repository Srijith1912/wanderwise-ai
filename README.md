# WanderWise AI

An AI-powered travel planning web app with personalized itineraries, saved trips, interactive maps, and a social community feed.

## Features

- 🤖 AI-generated personalized itineraries
- 💾 Save and manage trips
- 🗺️ Interactive map visualization
- 📱 Simple social feed for travelers
- 👤 User authentication

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas
- **AI:** OpenAI API
- **Maps:** Mapbox

## Getting Started

### Prerequisites
- Node.js v22+
- MongoDB Atlas account
- OpenAI API key

### Installation
```bash
git clone https://github.com/YOUR_USERNAME/wanderwise-ai.git
cd wanderwise-ai

# Frontend setup
cd client
npm install
npm run dev

# Backend setup (in new terminal)
cd server
npm install
npm run dev
```

### Environment Variables

Create `.env` in `server/` folder:
```
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
JWT_SECRET=your_secret_here
PORT=5000
```

## Project Status

- ✅ Phase 1: Setup (Complete)
- 🔄 Phase 2: Authentication (In Progress)
- ⏳ Phase 3-8: Upcoming

## License

MIT
