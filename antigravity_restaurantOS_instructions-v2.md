# RestaurantOS - Antigravity Autonomous Execution Prompt v2

## 🤖 System Directive for Antigravity Agent
You are acting as the principal developer and UI/UX designer building **RestaurantOS** for the VibeAthon6.0 Hackathon. 
Your goal is to build an MVP that satisfies the "Platinum Level" criteria. 

**CRITICAL UI/UX DIRECTIVE:** 
The UI must NOT look "vibe coded like trash and boring." It must look like a premium, top-tier SaaS product. 
- Use **Tailwind CSS** heavily. 
- Implement **Framer Motion** for smooth page transitions and micro-interactions.
- Use a modern design language: subtle glassmorphism, deep dark mode, neon/cyberpunk accents (optional but encouraged), high-quality typography, and consistent spacing. 
- No default unstyled HTML elements. Every button, card, and input must be polished.

**WORKSPACE CONTEXT:**
- The workspace already contains a `frontend` folder and a `backend` folder.
- API keys for Supabase and Gemini are already present in these folders. DO NOT ask the user for keys or pause to generate `.env` templates. 
- Read from the existing environment variables.

---

## 🎨 Phase 1: Frontend UI/UX Overhaul & Design System
**Trigger Prompt 1:**
> "Antigravity, navigate to the `frontend` folder. Install `framer-motion`, `lucide-react`, `clsx`, and `tailwind-merge`. Create a global UI design system in `tailwind.config.js` with a premium dark theme and custom accent colors. Build a set of reusable UI components (Button, Card, Input, Badge) in `src/components/ui/` that look incredibly modern and polished. Ensure the layout has a sidebar for the dashboard and a stunning mobile-first view for the QR menu."

---

## 🗄️ Phase 2: Database Schema & Authentication (Backend & Supabase)
**Trigger Prompt 2:**
> "Antigravity, navigate to the `backend` folder. Using the existing Supabase credentials, write a script to initialize our database schema for `Users`, `Menu_Items`, `Orders`, and `Queue`. Then, in the `frontend` folder, implement the Auth UI using the existing Supabase keys. Make the login page look like a high-end enterprise portal, completely avoiding standard, boring login forms."

---

## 📱 Phase 3: Customer QR Menu & Shopping Cart (Frontend)
**Trigger Prompt 3:**
> "Antigravity, in the `frontend` folder, build the customer QR menu page. Fetch `Menu_Items` from the backend/Supabase. The menu cards must look appetizing and highly styled, featuring 'Live Availability' glowing badges. Implement a seamless, animated shopping cart drawer that slides in from the right when items are added. Connect the checkout function to the `backend` API."

---

## 🧑‍🍳 Phase 4: Owner Dashboard & Real-Time Kanban (Frontend + Backend)
**Trigger Prompt 4:**
> "Antigravity, build the Owner Dashboard in the `frontend` folder. It must feature a stunning layout. Use `recharts` to build beautiful, styled charts for 'Daily Sales' with custom tooltips. Implement a Kanban board for live orders (Pending -> Kitchen -> Served) that looks incredibly smooth with drag-and-drop or animated state transitions. Link this to the `backend` API routes."

---

## 🧠 Phase 5: Intelligent Operations - Gemini Integration (Backend)
**Trigger Prompt 5:**
> "Antigravity, navigate to the `backend` folder. Using the existing Gemini API key, create an Express route `/api/predict-wait`. It must accept the current active tables, pending orders, and party size, then query the Gemini model to predict the wait time. Then, in the `frontend`, build a highly interactive 'Smart Queue' component that displays this AI prediction with a sleek loading animation."

---

## 🚀 Phase 6: Final Polish & README Generation
**Trigger Prompt 6:**
> "Antigravity, review both `frontend` and `backend` folders for any unstyled elements. Fix any UI inconsistencies—make sure it looks like a winning hackathon project. Finally, generate a `README.md` at the root level. List 'Om' as the team member/developer. Document the Tech Stack, the completed User Stories (1-5), and detail exactly how the Gemini AI wait-time prediction works."
