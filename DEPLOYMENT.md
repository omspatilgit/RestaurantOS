# 🚀 Deployment Guide (VibeAthon 2K26)

This guide will walk you through deploying your RestaurantOS project so it is "live and publicly accessible" for the judges. We will deploy the **Backend to Render** and the **Frontend to Vercel**.

---

## 1️⃣ Deploying the Backend (Render.com)

Render is great for Node.js backends.

1. **Push your code to GitHub.** Ensure your entire project (both `frontend` and `backend` folders) is in a single GitHub repository.
2. Go to [Render.com](https://render.com/) and sign in with GitHub.
3. Click **New +** and select **Web Service**.
4. Connect your GitHub repository.
5. Configure the Web Service:
   - **Name**: `restaurantos-api`
   - **Root Directory**: `backend` *(CRITICAL: You must specify `backend` here since it's a monorepo)*
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` *(or `node server.js`)*
6. **Environment Variables**: Scroll down to the Advanced section and add these:
   - `PORT` = `8000`
   - `SUPABASE_URL` = (Your Supabase URL)
   - `SUPABASE_SERVICE_ROLE_KEY` = (Your Supabase Service Key)
   - `GEMINI_API_KEY` = (Your Google Gemini Key)
   - `ALLOWED_ORIGINS` = (Leave this as `*` for now, or add your Vercel URL later once you have it)
7. Click **Create Web Service**. 
8. Render will deploy your backend. Once it says "Live", copy the URL (e.g., `https://restaurantos-api.onrender.com`).

---

## 2️⃣ Deploying the Frontend (Vercel.com)

Vercel is the easiest and fastest way to host React/Vite apps.

1. Go to [Vercel.com](https://vercel.com/) and sign in with GitHub.
2. Click **Add New Project**.
3. Import your GitHub repository.
4. Configure the Project:
   - **Project Name**: `restaurantos-web`
   - **Framework Preset**: `Vite` (Vercel usually auto-detects this)
   - **Root Directory**: `frontend` *(CRITICAL: Edit this to be `frontend`)*
5. **Environment Variables**: Open the Environment Variables section and add your backend URL (the one you copied from Render!):
   - `VITE_API_BASE_URL` = `https://restaurantos-api.onrender.com` (Do not put a `/` at the end)
6. Click **Deploy**.
7. Wait a minute or two. Once done, Vercel will give you a live URL (e.g., `https://restaurantos-web.vercel.app`).

---

## 3️⃣ Final Hackathon Submission Steps

Now that both are live:

1. Copy your Vercel URL and paste it into the `README.md` under **Hosted Application Link**.
2. Make sure your GitHub repository is set to **Public**.
3. Verify that your `README.md` has your Team Name, Tech Stack, and User Stories (I've already formatted the README for you, you just need to paste the links!).
4. Open your live Vercel URL on your phone and test the ordering flow to ensure the Backend and Frontend are communicating properly.
5. Create your PDF presentation based on the `PRESENTATION.md` file provided earlier.
6. Submit! Good luck! 🎉
