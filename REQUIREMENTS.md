# 📋 Project Requirements (VibeAthon 6.0)

This document outlines the software, hardware, and external service requirements needed to run the **RestaurantOS** project locally and in production.

## 💻 System Prerequisites
To run the local development environment, you need:
- **Node.js**: v18.0.0 or higher
- **Package Manager**: `npm` (comes with Node.js) or `yarn` / `pnpm`
- **Operating System**: Windows, macOS, or Linux
- **Web Browser**: Modern browser (Chrome, Edge, Firefox, Safari)

## 📦 Core Tech Stack Dependencies
*(All package dependencies are automatically managed via `package.json`)*

**Frontend (`/frontend`)**:
- `react` / `react-dom` (^19.x)
- `vite` (Build Tool)
- `tailwindcss` (Styling)
- `framer-motion` (Animations)
- `lucide-react` (Icons)
- `recharts` (Data Analytics)
- `@supabase/supabase-js` (Database & Realtime)
- `@emailjs/browser` (Email Notifications)
- `@hello-pangea/dnd` (Kanban Drag & Drop)

**Backend (`/backend`)**:
- `express` (REST API Server)
- `@google/genai` (Google Gemini AI SDK)
- `@supabase/supabase-js` (Database interaction)
- `cors` (Cross-Origin Resource Sharing)
- `dotenv` (Environment Variable Management)

## 🔑 External API & Service Requirements
To fully utilize all features of RestaurantOS, you need the following third-party accounts and API keys:

1. **Supabase**:
   - PostgreSQL Database
   - Real-time WebSockets
   - Authentication (Email & Google OAuth)
   - *Requires*: `SUPABASE_URL` and `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`

2. **Google Gemini API**:
   - Used for the Smart Queue Wait-Time Predictor and the Pre-Booking AI Chatbot.
   - *Requires*: `GEMINI_API_KEY` (Free tier is sufficient)

3. **EmailJS**:
   - Used for sending booking confirmation emails to customers.
   - *Requires*: `SERVICE_ID`, `TEMPLATE_ID`, and `PUBLIC_KEY` (Configured in the frontend codebase).

## 🚀 Environment Variables (`.env`)
To run the project, the following `.env` configurations are required.

**Backend (`backend/.env`)**:
```env
PORT=8000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
GEMINI_API_KEY=your_google_gemini_api_key
ALLOWED_ORIGINS=*
```

**Frontend (`frontend/.env`)**:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
