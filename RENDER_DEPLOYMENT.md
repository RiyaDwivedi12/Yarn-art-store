# 🚀 Yarn Art Store - Render Deployment Guide

This document outlines the exact steps to deploy your MERN stack to **Render.com**.

---

## 🏗 Part 1: Deploying the Backend (Web Service)

1. **Dashboard**: Click **New +** → **Web Service**.
2. **Repository**: Select your `yarn-art-store` GitHub repo.
3. **Settings**:
   - **Name**: `yarn-art-store-backend`
   - **Region**: Select the one closest to you (e.g., Singapore or Oregon).
   - **Branch**: `main`
   - **Root Directory**: `backend` (⚠️ Crucial!)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. **Environment Variables**:
   Under the **Environment** tab, click **Add Environment Variable**:
    - `MONGO_URI`: (Your MongoDB connection string)
    - `RAZORPAY_KEY_ID`: (Your Razorpay Test Key)
    - `RAZORPAY_SECRET`: (Your Razorpay Test Secret)
    - `CLOUDINARY_CLOUD_NAME`: (Your Cloudinary Name)
    - `CLOUDINARY_API_KEY`: (Your Cloudinary API Key)
    - `CLOUDINARY_API_SECRET`: (Your Cloudinary API Secret)
    - `EMAIL_USER`: (Your Email Address)
    - `EMAIL_PASS`: (Your Email App Password)
   - `EMAIL_SERVICE`: `gmail`
   - `NODE_ENV`: `production`

> [!IMPORTANT]
> **Wait for the build to finish!** Once it says "Live", copy your Backend URL (e.g., `https://yarn-art-store-backend.onrender.com`).

---

## 🎨 Part 2: Deploying the Frontend (Static Site)

1. **Dashboard**: Click **New +** → **Static Site**.
2. **Repository**: Select your `yarn-art-store` GitHub repo.
3. **Settings**:
   - **Name**: `yarn-art-store-frontend`
   - **Root Directory**: `Frontend` (⚠️ Crucial!)
   - **Build Command**: `npm run build`
   - **Publish Directory**: `build`
4. **Environment Variables**:
   Under the **Environment** tab, click **Add Environment Variable**:
   - `REACT_APP_API_URL`: (Paste your Backend URL + `/api`) 
     Example: `https://yarn-art-store-backend.onrender.com/api`
   - `REACT_APP_RAZORPAY_KEY`: (Your Razorpay Test Key)

---

## 🛠 Troubleshooting the "404" on Refresh
If you visit `yoursite.com/cart` and refresh the page, Render might show a "404".
- **Fix**: In the Render Static Site dashboard, go to **Redirects/Rewrites**.
- **Add Rule**: 
  - **Source**: `/*`
  - **Destination**: `/index.html`
  - **Action**: `Rewrite`

---

## 😴 A Note on Free Tier "Sleep"
Render's free tier backends go to sleep after 15 minutes of inactivity. 
- **First Visit Advice**: The very first time you open your store in the morning, it might take **30-40 seconds** to load your products. This is because Render is "waking up" your server. After it wakes up, it will be fast!
