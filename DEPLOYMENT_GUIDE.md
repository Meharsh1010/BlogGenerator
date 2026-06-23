# Complete Deployment Guide: Frontend to Vercel & Backend Integration

## Overview

Your BlogGenerator has:
- **Backend**: Already deployed on Render at `https://bloggenerator-68x6.onrender.com`
- **Frontend**: Ready to deploy on Vercel and configured to connect to your backend

## Quick Start Steps

### 1. **Verify Frontend Configuration** ✅

The frontend is already configured with:
- Environment variable: `VITE_API_BASE_URL`
- API configuration file: `frontend/src/config/api.js`
- Axios automatically uses the backend URL for all API calls
- `.env.local` is set up for local development
- `.gitignore` excludes sensitive environment files

### 2. **Deploy Frontend to Vercel**

#### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# From the project root, deploy the frontend folder
cd frontend
vercel deploy --prod
```

#### Option B: Using GitHub (Recommended)
1. Push your project to GitHub (if not already done)
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New" > "Project"
4. Select your GitHub repository
5. Configure as follows:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add Environment Variables:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://bloggenerator-68x6.onrender.com`
7. Click **Deploy**

### 3. **Update Backend CORS** (Important!)

After you get your Vercel frontend URL (example: `https://your-app-name.vercel.app`), you need to update your backend's CORS configuration:

1. Open `backend/server.js`
2. Find the CORS configuration (around line 30)
3. Update the `origin` to include your Vercel URL:

```javascript
const allowedOrigins = [
  'http://localhost:5173',  // Local development
  'https://bloggenerator-68x6.onrender.com', // Backend URL
  'https://your-app-name.vercel.app'  // Your Vercel frontend URL
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

4. Commit and push these changes to GitHub/Render
5. Render will automatically redeploy your backend

### 4. **Test the Connection**

Once both are deployed:

1. Visit your Vercel frontend URL
2. Open browser Developer Tools (F12)
3. Go to the **Network** tab
4. Try logging in or creating a post
5. Verify API requests show success (200 status codes)
6. Check **Console** for any CORS errors

## File Changes Made

The following files have been created/modified for frontend deployment:

### Created Files:
- `frontend/.env.local` - Local development environment variables
- `frontend/.env.example` - Environment variable template
- `frontend/.gitignore` - Git ignore rules for environment files
- `frontend/src/config/api.js` - Centralized API configuration
- `frontend/vercel.json` - Vercel deployment configuration
- `frontend/DEPLOYMENT.md` - Detailed deployment guide
- `BACKEND_SETUP.md` - Backend CORS configuration guide

### Modified Files:
- `frontend/src/App.jsx` - Now imports and uses API base URL
- `frontend/vite.config.js` - Enhanced with environment variable support

## Environment Variables

| Variable | Development Value | Production Value |
|----------|-------------------|------------------|
| `VITE_API_BASE_URL` | `http://localhost:5000` | `https://bloggenerator-68x6.onrender.com` |

## Local Development

To continue developing locally:

```bash
cd frontend
npm install  # If needed
npm run dev
```

Your frontend will be available at `http://localhost:5173` and API requests will proxy to `http://localhost:5000`.

## Troubleshooting

### CORS Errors
If you see errors like "Access-Control-Allow-Origin", the backend's CORS configuration doesn't include your Vercel URL. Update `backend/server.js` and redeploy.

### API 404 Errors
Check that:
1. The `VITE_API_BASE_URL` is set correctly in Vercel
2. Your backend is running and accessible
3. The endpoint paths match between frontend and backend

### Build Errors
Make sure you've run:
```bash
cd frontend
npm install
```

## Next Steps

1. ✅ Frontend is configured - review `frontend/DEPLOYMENT.md`
2. 🔄 Deploy to Vercel using the steps above
3. 🔧 Update backend CORS configuration with your Vercel URL
4. ✅ Redeploy backend on Render
5. 🧪 Test the complete flow from Vercel to Render

## Need Help?

Check:
- `frontend/DEPLOYMENT.md` - Frontend-specific deployment details
- `BACKEND_SETUP.md` - Backend CORS configuration details
- Browser Network tab during requests to see actual API endpoints being called
