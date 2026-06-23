# Backend Configuration for Production Deployment

## CORS Configuration Update Required

Your backend currently has CORS configured to only accept requests from `http://localhost:5173` (local development). When you deploy the frontend to Vercel, you need to update the CORS configuration to accept requests from your Vercel domain.

### Current CORS Configuration (server.js)

```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Recommended Updated Configuration

Replace the CORS configuration in `backend/server.js` with:

```javascript
// Determine allowed origins based on environment
const allowedOrigins = [
  'http://localhost:5173',  // Local development
  'http://localhost:3000',  // Alternative local port
  // Add your Vercel frontend URL here once deployed
  // Example: 'https://your-app-name.vercel.app'
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

### Steps to Update Backend

1. **Update CORS Configuration**: After you deploy the frontend to Vercel, you'll get a URL like `https://your-app-name.vercel.app`. Update the `allowedOrigins` array in the CORS configuration to include this URL.

2. **Redeploy Backend**: Once you update the CORS configuration, redeploy your backend to Render so the changes take effect.

3. **Example Vercel Deployment URL Update**:
   ```javascript
   const allowedOrigins = [
     'http://localhost:5173',
     'https://your-frontend-name.vercel.app'  // Add this after deployment
   ];
   ```

## Environment Variables

Make sure your backend environment variables are properly configured on Render:
- `PORT` - Should be automatically set by Render, or default to 5000
- `MONGODB_URI` - Your MongoDB connection string
- Other API keys and secrets as needed

## Testing the Connection

Once both frontend and backend are deployed:

1. Visit your Vercel frontend URL
2. Open the browser's Developer Tools (F12)
3. Go to the Network tab
4. Try logging in or performing an action
5. Check if API requests are successful (should see 200 status codes)

If you see CORS errors, the CORS configuration needs to be updated and the backend redeployed.
