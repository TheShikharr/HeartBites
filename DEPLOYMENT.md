# HeartBites — Final Deployment

## Deployment Architecture

```
┌──────────────────┐     HTTPS      ┌──────────────────┐
│   User Browser   │ ──────────────→│  Vercel (Frontend)│
│                  │                │  heartbites.      │
│                  │                │  vercel.app       │
└──────────────────┘                └──────────────────┘
        │                                    │
        │ HTTPS + WSS                        │ API Calls
        │                                    ▼
        │                          ┌──────────────────┐
        └─────────────────────────→│ Render (Backend)  │
                                   │ heartbites-       │
                                   │ backend.onrender  │
                                   │ .com              │
                                   └──────────────────┘
                                      │      │      │
                              ┌───────┘      │      └───────┐
                              ▼              ▼              ▼
                      ┌────────────┐ ┌────────────┐ ┌────────────┐
                      │  MongoDB   │ │ Cloudinary │ │   Gmail    │
                      │  Atlas     │ │ CDN        │ │   SMTP     │
                      └────────────┘ └────────────┘ └────────────┘
```

---

## Deployment Platforms

| Component | Platform | URL |
|-----------|----------|-----|
| Frontend | Vercel | https://heartbites.vercel.app |
| Backend | Render | https://heartbites-backend.onrender.com |
| Database | MongoDB Atlas | Cloud-hosted cluster |
| Image Storage | Cloudinary | CDN for profile pictures |

---

## Frontend Deployment (Vercel)

### Steps
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Configure project settings:
   - **Root Directory**: `FRONTEND`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Framework Preset**: Vite
4. Deploy

### Configuration File — `vercel.json`
```json
{
    "rewrites": [
        { "source": "/(.*)", "destination": "/index.html" }
    ]
}
```
This rewrites all routes to `index.html` enabling React Router's client-side routing.

### Environment Variables (Vercel Dashboard)
| Variable | Value |
|----------|-------|
| `VITE_MODE` | `production` |

---

## Backend Deployment (Render)

### Steps
1. Push code to GitHub repository
2. Create a new **Web Service** on Render
3. Connect the repository
4. Configure:
   - **Root Directory**: `BACKEND`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
   - **Environment**: Node
5. Add all environment variables
6. Deploy

### Environment Variables (Render Dashboard)

| Variable | Value |
|----------|-------|
| `PORT` | `8080` |
| `MONGODB_URI` | `mongodb+srv://...` |
| `JWT_SECRET` | `<secret_key>` |
| `CLOUDINARY_CLOUD_NAME` | `<cloud_name>` |
| `CLOUDINARY_API_KEY` | `<api_key>` |
| `CLOUDINARY_API_SECRET` | `<api_secret>` |
| `CLIENT_URL` | `https://heartbites.vercel.app` |

### Alternative — Railway Deployment

Configuration file — `railway.json`:
```json
{
    "build": { "builder": "NIXPACKS" },
    "deploy": {
        "startCommand": "node src/index.js",
        "restartPolicyType": "ON_FAILURE"
    }
}
```

---

## CORS Configuration

The backend allows requests from these origins:
```javascript
cors({
    origin: [
        process.env.CLIENT_URL,
        "http://localhost:5173",
        "https://heartbites.vercel.app"
    ],
    credentials: true
})
```

**`credentials: true`** is required for cross-origin JWT cookies to work between Vercel and Render.

---

## Cookie Configuration (Cross-Origin)

```javascript
res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
    httpOnly: true,                     // Not accessible via JavaScript
    sameSite: "None",                   // Required for cross-origin
    secure: true,                       // Required for HTTPS
})
```

| Setting | Why |
|---------|-----|
| `httpOnly` | Prevents XSS attacks from reading the cookie |
| `sameSite: "None"` | Allows cookie to be sent across different domains (Vercel → Render) |
| `secure: true` | Cookie only sent over HTTPS |

---

## Post-Deployment Checklist

| # | Check | Status |
|---|-------|--------|
| 1 | Frontend loads at Vercel URL | ✅ |
| 2 | Backend responds at Render URL | ✅ |
| 3 | MongoDB Atlas connection successful | ✅ |
| 4 | Signup/Login works with JWT cookies | ✅ |
| 5 | Profile picture uploads to Cloudinary | ✅ |
| 6 | Swipe feed loads correctly | ✅ |
| 7 | Matching system creates matches | ✅ |
| 8 | Real-time chat via Socket.IO works | ✅ |
| 9 | CORS allows frontend-backend communication | ✅ |
| 10 | Client-side routing works (refresh on any page) | ✅ |
