# 🚀 Quick Start: Deploy to Vercel in 3 Steps

## Your Status
✅ Backend already deployed: `https://bloggenerator-68x6.onrender.com`
✅ Frontend configured and ready for deployment
⏳ You need to: Deploy frontend to Vercel and update backend CORS

---

## Step 1: Deploy Frontend to Vercel (5 minutes)

1. Go to **[vercel.com](https://vercel.com)** and sign up/login
2. Click **"Add New..."** → **"Project"**
3. Select your GitHub repository
4. Configure:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
5. Add Environment Variable:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://bloggenerator-68x6.onrender.com`
6. Click **Deploy** ✅

**After deployment, note your Vercel URL** (example: `https://yourblog-xyz.vercel.app`)

---

## Step 2: Update Backend CORS (2 minutes)

1. Open `backend/server.js`
2. Find the CORS configuration (around line 30-37)
3. Replace this:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

With this:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://bloggenerator-68x6.onrender.com',
  'https://your-vercel-url.vercel.app'  // ← Replace with your Vercel URL from Step 1
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

4. Commit and push to GitHub
5. Render will auto-redeploy your backend ✅

---

## Step 3: Test (1 minute)

1. Visit your Vercel URL
2. Try logging in or creating content
3. Open **DevTools (F12)** → **Network tab**
4. Verify API calls succeed (look for green 200 status codes) ✅

---

## ✨ Done!

Your full-stack application is now live:
- **Frontend**: `https://your-vercel-url.vercel.app` (on Vercel)
- **Backend**: `https://bloggenerator-68x6.onrender.com` (on Render)
- **Database**: Connected to your MongoDB

---

## 📖 Need More Details?

- Detailed steps → See **`DEPLOYMENT_GUIDE.md`**
- Frontend setup → See **`frontend/DEPLOYMENT.md`**
- Troubleshooting → See **`DEPLOYMENT_CHECKLIST.md`**

## 🔧 Local Development (Optional)

Keep developing locally:
```bash
cd frontend
npm run dev
```
Runs on `http://localhost:5173` → proxies to `http://localhost:5000`

---

**Questions?** Check the documentation files or review the environment variable configuration in:
- `frontend/.env.example` (template)
- `frontend/.env.local` (local dev, not committed)
- `frontend/src/config/api.js` (configuration code)
