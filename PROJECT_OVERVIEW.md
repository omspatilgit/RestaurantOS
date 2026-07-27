# 🍽️ RestaurantOS v2

> **VibeAthon 6.0 Hackathon Project (2K26) — Platinum Level & Bonus Architecture**  
> *A full-stack, real-time SaaS platform built to solve core operational challenges in modern restaurants.*

---

## 🏆 Hackathon Level & Criteria Coverage

| Hackathon Level | User Stories | Status | Features Implemented |
|---|---|---|---|
| 🥉 **Bronze Level** | **User Story 1** | ✅ **COMPLETE** | Custom design system, warm food-focused customer theme, dark glassmorphic owner portal, Framer Motion micro-interactions & responsive layout. |
| 🥈 **Silver Level** | **User Stories 2 & 3** | ✅ **COMPLETE** | Supabase Authentication (Email/Password & Google OAuth button), Role-based access, Digital QR menu, Live item availability toggles, Smart Queue, Order management, GST Billing, & Real-time customer tracking. |
| 🥇 **Gold Level** | **User Story 4** | ✅ **COMPLETE** | Staff & Owner Management Dashboard featuring KPI analytics, Recharts hourly revenue & order volume charts, live drag-and-drop Kanban order pipeline, live menu inventory management (with ability to **Add New Dishes**), and **Dedicated Kitchen Display Screen (KDS)**. |
| 💎 **Platinum Level** | **User Story 5** | ✅ **COMPLETE** | **Dual AI Integration**: Google Gemini AI Integration (`@google/genai`) for intelligent wait-time prediction (`POST /api/predict-wait`) and **AI Dish Sommelier** in the customer menu providing personalized, attribute-based recommendations based on mood. |
| 🌟 **Bonus Level** | **Innovative Tech** | ✅ **BONUS** | **Supabase Realtime Synchronization**: Multi-device live sync where customer orders pop up on the owner's desktop in ~1s with **audio-visual toast notifications**, integrated **Real QR Code Generator** for frictionless table seating, Live Table Checking, Post-Meal **Customer Feedback Widget**, and **Seamless Digital Checkout**. |

---

## 👨‍💻 Developer Information

- **Developer & UI/UX Designer**: Om Patil
- **Event**: VibeAthon 6.0 Hackathon (July 2026)

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19 + TypeScript + Vite |
| **Styling & UI** | Tailwind CSS v4 + Framer Motion + Lucide Icons |
| **Data Visualization** | Recharts (Area Chart & Bar Chart) |
| **Drag & Drop** | `@hello-pangea/dnd` |
| **Realtime Sync & DB** | Supabase (Auth, PostgreSQL, Realtime WebSockets) |
| **Backend API** | Node.js + Express.js |
| **AI Intelligence** | Google Gemini API (`@google/genai`) |
| **Hardware APIs** | Web Audio API for Chime Notifications, `qrcode` library for real URL encoding. |

---

## 🎯 Core Features & Workflows

### 1. Frictionless Customer Onboarding
- **Real QR Codes**: Owners can generate and download actual scannable QR codes for Tables 1-10 from the Dashboard.
- **Live Table Selection Grid**: Customers check-in via a glowing, real-time layout grid that dynamically shows which tables are free vs occupied.
- **Smart Wait Time Estimate**: Before sitting down, customers instantly see predicted service times derived from active kitchen backlogs.

### 2. Intelligent Ordering & Checkout
- **AI Dish Sommelier**: Recommends dishes based on dietary, price, and mood attributes on the customer's phone.
- **Digital Billing & Checkout**: Once the food is served, customers get a "Pay & Checkout" option that generates a beautiful digital bill (with 5% GST tax) and bulk-completes their orders, instantly freeing up the physical table.

### 3. Advanced Owner Operations
- **Kanban Order Pipeline**: Real-time drag-and-drop board for Kitchen/Served statuses.
- **Menu Management**: Owners can live-toggle dish availability (updating instantly on the customer's phone) and add brand new dishes dynamically with a sleek modal form.

---

## 🤖 AI Integration Details

### 1. Smart Queue (Gemini Wait-Time Predictor)
Leverages the **Google Gemini API** (`gemini-1.5-flash`) via `POST /api/predict-wait`:
- **Inputs**: Active occupied tables, pending kitchen orders, waiting party size.
- **Output**: JSON payload returning `wait_time_min`, customer-facing `message`, `confidence` level, and operational `factors`.

### 2. AI Dish Sommelier (Customer Menu)
An on-device algorithmic AI that recommends dishes based on real-time menu availability and customer mood (Bestseller, Spicy, Veg, Drink) using attribute-based filtering (price, spice level, category, veg/non-veg).

---

## 🌐 Routes & Portals

| Route | Portal | Description | Access |
|---|---|---|---|
| `/portal` | Customer Check-In | Live Table Selection & real-time Wait Estimate | Public |
| `/portal/menu` | Customer Menu | High-res food cards, AI Sommelier, category filter, & cart sheet | Public |
| `/portal/track` | Live Tracker | Real-time animated order tracker, Feedback Rating, & Digital Checkout | Public |
| `/login` | Owner Portal Login | Supabase Auth (Email/Pass & Google OAuth) | Public |
| `/dashboard` | Dashboard Overview | Recharts analytics, Live Popular Items, QR Code Generator | 🔐 Protected |
| `/dashboard/orders` | Orders Kanban | Real-time drag-and-drop order pipeline with Sound Notifications | 🔐 Protected |
| `/dashboard/kitchen` | Kitchen Display | Full-screen KDS optimized for cooking staff with timers | 🔐 Protected |
| `/dashboard/menu` | Menu Management | Add dishes & toggle live item availability | 🔐 Protected |
| `/dashboard/queue` | Smart AI Queue | Gemini AI wait-time predictor & queue seating | 🔐 Protected |

---

## 🚀 How to Run Locally

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
*API runs on `http://localhost:8000`*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*App runs on `http://localhost:5173`*

---

*Built for VibeAthon 6.0 by Om Patil*
