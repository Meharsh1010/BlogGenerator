# Deployment Checklist

## ✅ Completed: Frontend Configuration

- [x] Created API configuration (`frontend/src/config/api.js`)
- [x] Set up environment variables (`.env.local`, `.env.example`)
- [x] Updated `App.jsx` to use API base URL
- [x] Enhanced `vite.config.js` for environment support
- [x] Created `.gitignore` for security
- [x] Created `vercel.json` for Vercel deployment
- [x] Created deployment documentation

## 📋 Next Steps (You Need to Do)

### Step 1: Deploy Frontend to Vercel
- [ ] Go to https://vercel.com
- [ ] Create a new project from your GitHub repository
- [ ] Set root directory to: `frontend`
- [ ] Add environment variable: `VITE_API_BASE_URL` = `https://bloggenerator-68x6.onrender.com`
- [ ] Click Deploy and wait for completion
- [ ] Note your Vercel URL (will look like: `https://your-app-name.vercel.app`)

### Step 2: Update Backend CORS
- [ ] Open `backend/server.js`
- [ ] Find the CORS configuration (line ~30-37)
- [ ] Add your Vercel URL to `allowedOrigins` array
- [ ] Save and commit changes
- [ ] Push to GitHub/Render - backend will auto-redeploy

### Step 3: Test Connection
- [ ] Visit your Vercel URL
- [ ] Open Developer Tools (F12)
- [ ] Go to Network tab
- [ ] Try logging in or creating content
- [ ] Verify API calls are successful (no CORS errors)
- [ ] Check that data loads from backend

## 📁 Files to Review

**Configuration Files Created:**
- `frontend/.env.local` - For local development
- `frontend/.env.example` - Template for environment variables
- `frontend/src/config/api.js` - API configuration utility
- `frontend/vercel.json` - Vercel deployment settings

**Documentation Created:**
- `DEPLOYMENT_GUIDE.md` - Complete deployment instructions
- `frontend/DEPLOYMENT.md` - Frontend-specific guide
- `BACKEND_SETUP.md` - Backend CORS configuration guide
- `DEPLOYMENT_CHECKLIST.md` - This file

**Modified Files:**
- `frontend/src/App.jsx` - Now imports API config
- `frontend/vite.config.js` - Environment variable support
- `frontend/.gitignore` - Security exclusions

## 🔗 Important URLs

- **Backend**: https://bloggenerator-68x6.onrender.com
- **Frontend Will Be**: https://your-app-name.vercel.app (after deployment)
- **Local Dev**: http://localhost:5173 (frontend) → http://localhost:5000 (backend)

## 🆘 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| CORS errors in browser | Update backend CORS config with Vercel URL and redeploy |
| API calls fail with 404 | Check `VITE_API_BASE_URL` in Vercel environment variables |
| Build fails on Vercel | Run `npm install` locally and commit `package-lock.json` |
| Environment variables not working | Ensure `VITE_` prefix is used and Vercel deployment is redeployed |

## 📞 Support

Each major step has detailed documentation:
- Frontend deployment → See `frontend/DEPLOYMENT.md`
- Backend setup → See `BACKEND_SETUP.md`
- Full process → See `DEPLOYMENT_GUIDE.md`

All files use relative imports and are properly configured for production.
