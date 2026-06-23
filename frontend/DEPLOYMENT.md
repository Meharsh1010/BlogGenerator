# Frontend Deployment Guide

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. The `.env.local` file is already configured for local development:
   ```
   VITE_API_BASE_URL=http://localhost:5000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173` and will proxy API requests to `http://localhost:5000`.

## Production Deployment on Vercel

### Step 1: Push to GitHub
1. Make sure your project is pushed to GitHub
2. Commit all changes including the new environment configuration files

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." > "Project"
3. Import your GitHub repository
4. Select the `frontend` folder as the "Root Directory"
5. Set the build command to: `npm run build`
6. Set the output directory to: `dist`
7. Add environment variable:
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** `https://bloggenerator-68x6.onrender.com`

### Step 3: Deploy
Click "Deploy" and wait for the deployment to complete.

## Environment Variables Reference

- `VITE_API_BASE_URL`: The base URL of your backend API
  - Development: `http://localhost:5000`
  - Production: `https://bloggenerator-68x6.onrender.com`

## Configuration Files

- `.env.local` - Local development environment variables (not committed to git)
- `.env.example` - Example environment variables template
- `vercel.json` - Vercel-specific configuration
- `vite.config.js` - Vite build configuration with API base URL support
- `src/config/api.js` - Centralized API configuration for the application
