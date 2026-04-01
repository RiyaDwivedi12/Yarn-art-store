# 🚀 Yarn Art Store Deployment Architecture & Roadmap

This document outlines the professional deployment strategy for the Yarn Art Marketplace, transitioning from your local machine to live production using **GitHub** and **Vercel**.

---

## 🏛 1. Proposed Project Architecture for Vercel
Vercel's preferred architecture for MERN apps is "Serverless Functions" for the backend. To ensure your code remains scalable and doesn't crash on deployment, we will use the following structure:

### Current Hierarchy:
- `Frontend/` (Your React Vite app)
- `backend/` (Your Node.js Express server)
- `product/` (Static image assets)
- `.gitignore` (Added by me to keep your repo clean)

### 💡 Recommendation: Unified "Vercel Mono-repo"
Instead of hosting separately, we'll keep both folders but use a `vercel.json` and a specific backend entry point to handle requests seamlessly.

---

## 🛠 2. Pre-Deployment Mandatory Fixes

### A. Dynamic API URLs
Your frontend currently connects to `localhost:5000`. This will break in production.
- **Action**: I will update `Frontend/src/api.js` to use environment variables.

### B. "Serverless-ready" Backend
Express servers on Vercel must export the `app` object without calling `app.listen` directly (Vercel manages the listening automatically).
- **Action**: I will modify `backend/server.js` to export the `app`.

### C. The `vercel.json` Command Center
This file is the "brain" of your deployment. It tells Vercel:
1. "Serve the `/api` requests from my Express server."
2. "Serve all other routes from my React Build."

---

## 🏗 3. Deployment Steps

### Step 1: Push to GitHub 🐱
1. **Initialize Git**:
   ```bash
   git init
   ```
2. **Stage your files**: (Your `node_modules` will be ignored automatically by the `.gitignore` I created).
   ```bash
   git add .
   ```
3. **Commit**:
   ```bash
   git commit -m "chore: Prepare for Vercel deployment"
   ```
4. **Create a Repository on GitHub**: Name it something like `yarn-art-store`.
5. **Connect and Push**:
   ```bash
   git remote add origin https://github.com/YourUsername/yarn-art-store.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Connect to Vercel 🔼
1. Log in to [vercel.com](https://vercel.com).
2. Click **Add New** → **Project**.
3. Import your `yarn-art-store` repository.
4. **Configure Environment Variables**:
   In the Vercel dashboard, you MUST add these variables from your `.env` files:
   
   **Frontend Variables:**
   - `VITE_API_URL`: Set this to `/api`
   
   **Backend Variables:**
   - `MONGO_URI`: `mongodb+srv://yarn-art:riya%401208@yarn-art.ikb9a4z.mongodb.net/yarnart?retryWrites=true&w=majority`
   - `RAZORPAY_KEY_ID`: Your Razorpay Key ID
   - `RAZORPAY_SECRET`: Your Razorpay Secret
   - `CLOUDINARY_CLOUD_NAME`: `dyuhkqbiq`
   - `CLOUDINARY_API_KEY`: `742114358871839`
   - `CLOUDINARY_API_SECRET`: `_aLYMm4Y5mbWkB4ZiH9vJ7es30M`
   - `EMAIL_USER`: `storeyarnart@gmail.com`
   - `EMAIL_PASS`: `dkefglmferyxncgv`
   - `EMAIL_SERVICE`: `gmail`

### Step 3: Verify and Launch! 🚀
Vercel will detect your settings and build both the frontend and backend. Your app will then be live at a URL like `yarn-art-store.vercel.app`.

---

## ⚠️ Important Files I am updating for you:

1. **`.gitignore`**: Already created. It ensures your database credentials (`.env`) and huge `node_modules` folders don't get uploaded to GitHub.
2. **`vercel.json`**: I will create this in your root folder.
3. **`Frontend/src/api.js`**: I will make it production-ready.
4. **`backend/server.js`**: I will make it compatible with Vercel Serverless.

> [!IMPORTANT]
> **Cloudinary Images**: Ensure your Cloudinary credentials are set in Vercel to allow live product image uploads.
