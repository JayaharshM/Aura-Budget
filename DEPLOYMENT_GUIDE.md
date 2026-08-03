# 🚀 Aura Budget - Complete Deployment Guide

This guide outlines the step-by-step procedure to deploy the **Aura Budget** application to production.

---

## 🏗️ Architecture & Requirements Overview

Aura Budget consists of three main operational components:
1. **Frontend**: React 18 + Vite static SPA (Needs static hosting like Vercel, Netlify, or Render).
2. **Backend**: Node.js / Express server with **Socket.IO** (real-time budget rooms) + **Python 3 runtime** (for `forecast.py` machine learning models).
3. **Database**: Cloud MongoDB database (MongoDB Atlas).

---

## 📋 Step 1: Pre-Deployment Code Adjustments

### 1. Fix Hardcoded Backend URLs in Frontend
Currently, the frontend connects directly to `http://localhost:5001`. For production, update the code to use environment variables.

- **`frontend/src/App.jsx`**:
```javascript
// Replace hardcoded localhost lines:
const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:5001/api';

const SOCKET_URL = import.meta.env.VITE_API_URL 
  || 'http://localhost:5001';
```

- **`frontend/src/components/Auth.jsx`**:
```javascript
// Replace hardcoded fetch URL line:
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const response = await fetch(`${baseUrl}${endpoint}`, { ... });
```

---

## 🗄️ Step 2: Database Setup (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in.
2. Create a new Cluster (Free M0 Shared cluster).
3. Under **Database Access**, create a user with read/write permissions.
4. Under **Network Access**, add `0.0.0.0/0` (allow access from backend server IPs).
5. Click **Connect** -> **Drivers** -> Copy your Connection String (`MONGODB_URI`).
   - Format: `mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/aura_budget?retryWrites=true&wmode=majority`

---

## ⚙️ Step 3: Deploy Backend (Render / Railway / Docker)

Since the backend spawns a Python script (`forecast.py`), the hosting server must support both **Node.js** and **Python 3 with packages** (`scikit-learn`, `pandas`, `numpy`, `joblib`), along with WebSocket support for **Socket.IO**.

### Option A: Deploy on Render (Recommended)
1. Push your repository to GitHub.
2. Create a new **Web Service** on [Render](https://render.com).
3. Connect your repository.
4. Configure service parameters:
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: 
     ```bash
     npm install && pip install -r ml/requirements.txt
     ```
   - **Start Command**:
     ```bash
     node server.js
     ```
5. Configure **Environment Variables** in Render:
   | Variable | Value |
   | --- | --- |
   | `MONGODB_URI` | MongoDB Atlas Connection URI |
   | `JWT_SECRET` | Strong secret key string |
   | `GROQ_API_KEY` | Groq LPU API key |
   | `GEMINI_API_KEY` | Google Gemini API key |
   | `OPENAI_API_KEY` | OpenAI API key (Whisper audio) |
   | `ALPHA_VANTAGE_API_KEY` | Stock data API key |
   | `PYTHON_VERSION` | `3.10.0` |

### Option B: Deploy with Docker
You can build a Docker container for the backend with Python and Node pre-installed:

**`backend/Dockerfile`**:
```dockerfile
FROM node:18-slim

# Install Python & pip
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node dependencies
COPY package*.json ./
RUN npm install

# Install Python dependencies
COPY ml/requirements.txt ./ml/
RUN pip3 install --no-cache-dir -r ml/requirements.txt --break-system-packages

COPY . .

EXPOSE 5001
CMD ["node", "server.js"]
```

---

## 🎨 Step 4: Deploy Frontend (Vercel / Netlify)

1. Go to [Vercel](https://vercel.com) and click **Add New Project**.
2. Select your GitHub repository.
3. Set **Framework Preset** to `Vite`.
4. Set **Root Directory** to `frontend`.
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://your-backend-service.onrender.com`
6. Click **Deploy**.

---

## 🧪 Step 5: Post-Deployment Testing Checklist

- [ ] **Authentication**: Register and log in.
- [ ] **Real-time Sync**: Join a budget room from 2 devices and verify live updates.
- [ ] **AI Advisor**: Test AI budget suggestions (Groq) and general financial insights (Gemini).
- [ ] **ML Forecast**: Run spending forecast to ensure Python script execution succeeds.
- [ ] **Stock Lookup**: Search & fetch stock prices via Alpha Vantage.
