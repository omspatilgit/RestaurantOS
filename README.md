# 🍽️ RestaurantOS 

> **VibeAthon 6.0 Hackathon Project (2K26) — Platinum Level & Bonus Architecture**  
> *A full-stack, real-time SaaS platform built to solve core operational challenges in modern restaurants.*

---

## 📸 Project Walkthrough & Screenshots

### 👤 Customer Experience
**Live Demo Link:** [https://restaurantos-web-one.vercel.app/portal](https://restaurantos-web-one.vercel.app/portal)

#### 1. Customer Ordering Portal
The customer experience starts with a rich digital menu accessed via table QR code. It features an **AI Dish Sommelier** for personalized recommendations and live availability badges.
<br>
<img width="1920" height="1080" alt="Screenshot 2026-07-28 004957" src="https://github.com/user-attachments/assets/b13a85c5-bc46-4ba4-9876-8591cad89ca0" />

#### 2. Live Order Tracker & Feedback
After placing an order, customers see a real-time animated tracker. Once served, they can instantly leave feedback using the post-meal widget.
<br>
<img width="1920" height="1080" alt="Screenshot 2026-07-28 005228" src="https://github.com/user-attachments/assets/ba9741df-b97e-49de-aa9d-d2079f71385a" />

---

### 👨‍🍳 Owner & Staff Experience
**Live Demo Link:** [https://restaurantos-web-one.vercel.app/dashboard](https://restaurantos-web-one.vercel.app/dashboard)

#### 3. Owner Dashboard & Analytics
A centralized glassmorphic dashboard for restaurant owners, featuring real-time KPI analytics, hourly revenue charts, and live order volumes.
<br>
<img width="1920" height="1080" alt="Screenshot 2026-07-28 005452" src="https://github.com/user-attachments/assets/47d6143c-c1f0-4503-b62b-ffdbc6e944dd" />


#### 4. Real-Time Orders Kanban
An interactive drag-and-drop pipeline where staff manage orders. As orders move from *Pending* to *Kitchen* to *Served*, the customer's tracker updates instantly via Supabase Realtime.
<br>
<img width="1920" height="1080" alt="Screenshot 2026-07-28 005432" src="https://github.com/user-attachments/assets/fab7823c-383c-4a72-83f0-9507f5852a81" />


#### 5. Kitchen Display Screen (KDS)
A dedicated, high-contrast, full-screen display for the kitchen staff to easily read incoming tickets, complete with timestamps and special notes.
<br>
<img width="1920" height="1080" alt="Screenshot 2026-07-28 005522" src="https://github.com/user-attachments/assets/461ce8c0-e02f-432e-9025-6a3a82bf8224" />


---

## 🏆 Hackathon Level & Criteria Coverage

| Hackathon Level | User Stories | Status | Features Implemented |
|---|---|---|---|
| 🥉 **Bronze Level** | **User Story 1** | ✅ **COMPLETE** | Custom design system, warm food-focused customer theme, dark glassmorphic owner portal, Framer Motion micro-interactions & responsive layout. |
| 🥈 **Silver Level** | **User Stories 2 & 3** | ✅ **COMPLETE** | Supabase Authentication (Email/Password & Google OAuth button), Role-based access, Digital QR menu, Live item availability toggles, Smart Queue, Order management, GST Billing, & Real-time customer tracking. |
| 🥇 **Gold Level** | **User Story 4** | ✅ **COMPLETE** | Staff & Owner Management Dashboard featuring KPI analytics, Recharts hourly revenue & order volume charts, live drag-and-drop Kanban order pipeline, live menu inventory management, and **Dedicated Kitchen Display Screen (KDS)**. |
| 💎 **Platinum Level** | **User Story 5** | ✅ **COMPLETE** | **Dual AI Integration**: Google Gemini AI Integration (`@google/genai`) for intelligent wait-time prediction (`POST /api/predict-wait`) and **AI Dish Sommelier** in the customer menu providing personalized, attribute-based recommendations based on mood. |
| 🌟 **Bonus Level** | **Innovative Tech** | ✅ **BONUS** | **Supabase Realtime Synchronization**: Multi-device live sync where customer orders pop up on the owner's desktop in ~1s with **audio-visual toast notifications**, integrated **QR Code Generator** for frictionless table seating, and Post-Meal **Customer Feedback Widget**. |

---

## 👨‍💻 Team & Project Info

- **Team Name**: Tendercodex
- **Event**: VibeAthon 6.0 Hackathon (25th - 27th July 2026)
- **Hosted Application Link for owner**: https://restaurantos-web-one.vercel.app/login
- **Hosted Application Link for customers**: https://restaurantos-web-one.vercel.app/portal

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
| **Hardware APIs** | Web Audio API for Chime Notifications, Canvas API for QR Generation |

---

## 🎯 Problems Solved (Problem Statement Mapping)

| Real-World Challenge | How RestaurantOS Solves It |
|---|---|
| **Customers waiting to know dish availability** | Live glowing availability badges on dishes + instant toggle by restaurant staff. |
| **Limited visibility into menu & services** | Rich digital customer menu with spice levels, AI Sommelier recommendations, prep times, veg/non-veg flags, and high-res food photos. |
| **Long table & order waiting times** | AI-driven Smart Queue powered by Gemini API predicting wait times in real time. |
| **Delayed communication staff ↔ kitchen ↔ customer** | Bi-directional Supabase Realtime synchronization between Customer Mobile Tracker, Owner Kanban, and **Kitchen Display Screen (KDS)**. |
| **Manual billing & order processing** | Automated digital cart with 5% GST tax calculation and instant kitchen dispatch via Table QR codes. |
| **Lack of operational analytics** | Real-time sales performance graphs, order status pipeline, daily revenue breakdown, and **Popular Items Analytics**. |

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
| `/portal?table=N` | Customer Check-In | Table selection & customer onboarding | Public |
| `/portal/menu` | Customer Menu | High-res food cards, AI Sommelier, category filter, & cart sheet | Public |
| `/portal/track` | Live Tracker | Real-time animated order tracker + Feedback Rating Widget | Public |
| `/login` | Owner Portal Login | Supabase Auth (Email/Pass & Google OAuth) | Public |
| `/dashboard` | Dashboard Overview | Recharts analytics, Live Popular Items, QR Code Generator | 🔐 Protected |
| `/dashboard/orders` | Orders Kanban | Real-time drag-and-drop order pipeline with Sound Notifications | 🔐 Protected |
| `/dashboard/kitchen` | Kitchen Display | Full-screen KDS optimized for cooking staff with timers | 🔐 Protected |
| `/dashboard/menu` | Menu Management | Live item availability & price controls | 🔐 Protected |
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
