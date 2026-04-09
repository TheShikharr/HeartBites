# HeartBites — Complete Project Documentation

> A full-stack, real-time dating & matchmaking web application built with the MERN stack (MongoDB, Express, React, Node.js).

---

## 1. Project Overview

**HeartBites** is a Tinder-style dating platform where users:
1. **Sign up** with name, email, and password
2. **Complete their profile** — upload a photo (Cloudinary), add bio, gender, DOB, and gender preference
3. **Swipe** through a card-based feed of potential matches (like / pass)
4. **Match** — when two users mutually like each other, a Match is created
5. **Chat** — matched users can send real-time messages via Socket.IO

**Live URLs**: Frontend on **Vercel** (`heartbites.vercel.app`), Backend on **Render** (`heartbites-backend.onrender.com`)

---

## 2. Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite 8, React Router v7, Zustand, Axios, Socket.IO Client, TailwindCSS 3, Lucide React |
| Backend | Node.js, Express 5, Mongoose 9, Socket.IO, JWT, bcryptjs, Cloudinary, Nodemailer, cookie-parser |
| Database | MongoDB Atlas |
| Deployment | Vercel (frontend), Render/Railway (backend) |

---

## 3. Project File Structure

```
HeartBites/
├── BACKEND/
│   ├── src/
│   │   ├── index.js                    # Server entry point
│   │   ├── controllers/
│   │   │   ├── auth.controllers.js     # Auth logic
│   │   │   ├── match.controllers.js    # Swipe & matching logic
│   │   │   └── message.controllers.js  # Chat messaging logic
│   │   ├── models/
│   │   │   ├── user.model.js           # User schema
│   │   │   ├── match.model.js          # Match schema
│   │   │   └── message.model.js        # Message schema
│   │   ├── routes/
│   │   │   ├── auth.route.js           # Auth endpoints
│   │   │   ├── match.route.js          # Match endpoints
│   │   │   └── message.route.js        # Message endpoints
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js       # JWT route protection
│   │   └── lib/
│   │       ├── db.js                   # MongoDB connection
│   │       ├── cloudinary.js           # Cloudinary config
│   │       ├── nodemailer.js           # Email/OTP sender
│   │       ├── socket.js              # Socket.IO server
│   │       └── utils.js               # JWT token helper
│   ├── railway.json
│   └── package.json
│
├── FRONTEND/
│   ├── src/
│   │   ├── main.jsx                    # React DOM entry
│   │   ├── App.jsx                     # Root component + routes
│   │   ├── App.css / index.css         # Styles
│   │   ├── pages/
│   │   │   ├── SignupPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── ProfileSetupPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── MatchesPage.jsx
│   │   │   └── ChatPage.jsx
│   │   ├── store/
│   │   │   └── useAuthStore.js         # Zustand global state
│   │   └── lib/
│   │       ├── axios.js               # HTTP client config
│   │       └── socket.js              # Socket.IO client
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── vercel.json
└── README.md
```

---

## 4. BACKEND — Detailed Breakdown

---

### 4.1 `BACKEND/src/index.js` — Server Entry Point

**Purpose**: Bootstraps the entire Express application.

**What it does step-by-step**:
1. Imports Express, dotenv, cookie-parser, cors, and path
2. Imports the database connector (`connectdb`), all route modules, and the Socket.IO-wrapped `app` and `server`
3. Calls `dotenv.config()` to load `.env` variables
4. Sets `PORT` from env or defaults to `8080`
5. Configures middleware:
   - `express.json({ limit: "10mb" })` — parses JSON bodies up to 10 MB (needed for base64 profile pictures)
   - `express.urlencoded({ limit: "10mb" })` — parses URL-encoded bodies
   - `cookieParser()` — parses cookies so `req.cookies.jwt` is accessible
   - `cors(...)` — allows requests from `CLIENT_URL`, `localhost:5173`, and `heartbites.vercel.app` with credentials
6. Mounts route handlers at `/api/auth`, `/api/match`, `/api/messages`
7. Starts the HTTP server (not `app.listen` — uses the Socket.IO `server`) and connects to MongoDB

**Key Design Decision**: Uses `server.listen()` instead of `app.listen()` because Socket.IO wraps the Express app in an HTTP server.

---

### 4.2 `BACKEND/src/models/user.model.js` — User Schema

**Purpose**: Defines the MongoDB schema for user accounts.

**Fields**:
| Field | Type | Details |
|---|---|---|
| `email` | String | Required, unique — used for login |
| `fullName` | String | Required — display name |
| `password` | String | Required, minlength 6 — stored as bcrypt hash |
| `profilePic` | String | Default `""` — Cloudinary URL after upload |
| `gender` | String | Enum: `"male"`, `"female"`, `"other"` |
| `dob` | Date | Date of birth — used to calculate age |
| `bio` | String | Default `""` — profile bio text |
| `genderPreference` | String | Enum: `"male"`, `"female"`, `"other"`, `"everyone"` (default) |
| `likes` | [ObjectId] | Array of User IDs this user swiped right on |
| `dislikes` | [ObjectId] | Array of User IDs this user swiped left on |

**Options**: `{ timestamps: true }` adds `createdAt` and `updatedAt` automatically.

---

### 4.3 `BACKEND/src/models/match.model.js` — Match Schema

**Purpose**: Represents a mutual match between two users.

| Field | Type | Details |
|---|---|---|
| `users` | [ObjectId] | Array of exactly 2 User IDs, ref → `User` |

Created automatically when User A likes User B AND User B had already liked User A.

---

### 4.4 `BACKEND/src/models/message.model.js` — Message Schema

| Field | Type | Details |
|---|---|---|
| `senderID` | ObjectId | Ref → `User`, required |
| `receiverID` | ObjectId | Ref → `User`, required |
| `content` | String | Required — the message text |

Messages are only allowed between matched users (enforced by controller).

---

### 4.5 `BACKEND/src/controllers/auth.controllers.js`

Contains **5 exported functions**:

#### `signup(req, res)`
1. Extracts `fullName`, `email`, `password` from `req.body`
2. Validates all fields are present and password ≥ 6 chars
3. Checks if email already exists in DB → 400 if duplicate
4. Hashes password with `bcrypt.genSalt(10)` + `bcrypt.hash()`
5. Creates new `User` document and saves to DB
6. Generates JWT token via `generateTokens()` (sets HTTP-only cookie)
7. Returns `201` with `{ _id, fullName, email, profilePic }`

#### `login(req, res)`
1. Extracts `email`, `password` from `req.body`
2. Finds user by email → 400 "Invalid Credentials" if not found
3. Compares password with `bcrypt.compare()` → 400 if wrong
4. Generates JWT cookie
5. Returns `200` with user data

#### `logout(req, res)`
1. Clears the `jwt` cookie by setting `maxAge: 0`
2. Cookie options: `httpOnly: true`, `sameSite: "None"`, `secure: true`
3. Returns `200` "Logged Out Successfully"

#### `updateProfile(req, res)`
1. Extracts `profilePic`, `gender`, `dob`, `bio`, `genderPreference` from body
2. Validates all fields except `profilePic` are present
3. If `profilePic` is provided (base64), uploads to Cloudinary and stores the `secure_url`
4. Updates user via `findByIdAndUpdate()` with `{ new: true }`
5. Returns the updated user object

#### `checkAuth(req, res)`
1. Returns `req.user` (attached by `protectRoute` middleware)
2. Used by the frontend on app load to verify the session

---

### 4.6 `BACKEND/src/controllers/match.controllers.js`

Contains **4 exported functions** + 1 helper:

#### `calculatedAge(dob)` (helper, not exported)
- Calculates age from DOB, accounts for month/day edge cases

#### `getUserProfiles(req, res)`
1. Fetches the current user from DB
2. Finds all existing matches for the current user
3. Builds an **exclusion list**: liked + disliked + matched + self
4. Queries for users NOT in exclusion list AND matching gender preference
5. Maps results to include calculated `age`
6. Returns `{ users: [...] }`

**Gender filtering**: If preference is `"everyone"` → `{ $in: ["male", "female", "other"] }`, otherwise exact match.

#### `getMatches(req, res)`
1. Finds all Match documents containing the current user's ID
2. Populates `users` with `fullName`, `profilePic`, `dob`, `gender`, `bio`
3. Maps to include calculated `age`
4. Returns `{ matches: [...] }`

#### `swipeRight(req, res)`
1. Finds both the current user and liked user
2. Checks if already liked → 400
3. Adds to `currentUser.likes` array
4. **Mutual match check**: If liked user's `likes` includes current user → creates Match, returns `{ isMatch: true }`
5. Otherwise returns `{ isMatch: false }`

#### `swipeLeft(req, res)`
1. Finds both users, checks if already disliked
2. Adds to `currentUser.dislikes` array
3. Returns "Passed Successfully"

---

### 4.7 `BACKEND/src/controllers/message.controllers.js`

#### `sendMessage(req, res)`
1. Extracts `content`, `senderID` (from req.user), `receiverID` (from params)
2. Validates content is present
3. **Match check**: Queries for Match containing both users → 403 if not matched
4. Creates new Message document
5. **Real-time**: Gets receiver's socket ID, emits `"newMessage"` if online
6. Returns `201` with message

#### `getMessage(req, res)`
1. Validates match exists between both users
2. Queries all messages between them (both directions) sorted by `createdAt`
3. Returns `{ messages: [...] }`

---

### 4.8 Routes Summary

#### Auth Routes (`/api/auth`)
| Method | Path | Auth | Handler |
|---|---|---|---|
| POST | `/signup` | ❌ | `signup` |
| POST | `/login` | ❌ | `login` |
| POST | `/logout` | ❌ | `logout` |
| PUT | `/update-profile` | ✅ | `updateProfile` |
| GET | `/check` | ✅ | `checkAuth` |

#### Match Routes (`/api/match`)
| Method | Path | Auth | Handler |
|---|---|---|---|
| GET | `/` | ✅ | `getUserProfiles` |
| GET | `/matches` | ✅ | `getMatches` |
| POST | `/swipe-right/:id` | ✅ | `swipeRight` |
| POST | `/swipe-left/:id` | ✅ | `swipeLeft` |

#### Message Routes (`/api/messages`)
| Method | Path | Auth | Handler |
|---|---|---|---|
| POST | `/send/:id` | ✅ | `sendMessage` |
| GET | `/:id` | ✅ | `getMessage` |

---

### 4.9 `auth.middleware.js` — JWT Protection

#### `protectRoute(req, res, next)`
1. Reads `req.cookies.jwt`
2. No token → 401 "No Token Provided"
3. Verifies with `jwt.verify()` using `JWT_SECRET`
4. Looks up user by decoded `userID`, excluding password
5. Attaches to `req.user`, calls `next()`
6. Catches `TokenExpiredError` / `JsonWebTokenError` → 401

---

### 4.10 Utility Modules (`lib/`)

#### `db.js` — `connectdb()` connects to MongoDB Atlas via `MONGODB_URI`

#### `cloudinary.js` — Configures Cloudinary v2 SDK with cloud name, API key, API secret

#### `nodemailer.js` — Gmail SMTP transporter + `sendEmailOTP(email, otp)` for email verification

#### `socket.js` — Creates Express app + HTTP server + Socket.IO server. Manages `onlineUsers` map. Events: `userConnected`, `disconnect`, `onlineUsers` broadcast. Exports `getReceiverSocketID()`.

#### `utils.js` — `generateTokens(userID, res)` signs JWT (7-day expiry), sets HTTP-only cookie with `sameSite: "None"`, `secure: true`.

---

## 5. FRONTEND — Detailed Breakdown

---

### 5.1 `index.html`
- Loads **Lobster Two** font from Google Fonts
- Contains `<div id="root">` mount point
- Title: "HeartBites"

### 5.2 `main.jsx`
- Creates React 19 root with `createRoot()`
- Wraps `<App>` in `<BrowserRouter>` and `<StrictMode>`

---

### 5.3 `App.jsx` — Root Component & Router

**Hooks**: `authUser`, `checkAuth`, `isLoading` from Zustand store

**On Mount**: Calls `checkAuth()` to verify JWT session

**Routes**:
| Path | Component | Guard |
|---|---|---|
| `/` | `DashboardPage` | Auth required |
| `/signup` | `SignupPage` | Guest only |
| `/login` | `LoginPage` | Guest only |
| `/profile-setup` | `ProfileSetupPage` | Auth required |
| `/update-profile` | `ProfileSetupPage` | Auth required (update mode) |
| `/matches` | `MatchesPage` | Auth required |
| `/chat/:id` | `ChatPage` | Auth required |

---

### 5.4 `useAuthStore.js` — Zustand Store

**State**: `authUser`, `isLoading`, `error`

**Helper — `connectSocket(userId)`**: Connects socket, emits `"userConnected"` with user ID

**Actions**:
- `setAuthUser(user)` — direct state setter
- `checkAuth()` — GET `/auth/check` → sets user + connects socket
- `login(formData)` — POST `/auth/login` → returns `{ success, message }`
- `signup(formData)` — POST `/auth/signup` → returns `{ success, message }`
- `logout()` — POST `/auth/logout` → clears user + disconnects socket

---

### 5.5 `lib/axios.js`
- Axios instance with production/dev `baseURL` detection
- `withCredentials: true` for cross-origin cookie auth

### 5.6 `lib/socket.js`
- Socket.IO client with `autoConnect: false`
- Connects to Render URL in production, localhost in dev
- Logs connect/disconnect/error events

---

### 5.7 Page Components

---

#### `SignupPage.jsx`

**State**: `formData` (fullName, email, password), `error`, `loading`

**Functions**:
- `handleChange(e)` — dynamic field update via `[e.target.name]`
- `handleSubmit(e)` — calls `signup()` → success navigates to `/profile-setup`, failure shows error

**UI**: Gradient background, white card, HeartBites header, 3 inputs, submit button, login link

---

#### `LoginPage.jsx`

**State**: `formData` (email, password), `error`

**Functions**:
- `handleChange(e)` — dynamic field update
- `handleSubmit(e)` — calls `login()` → success navigates to `/`, failure shows error

**UI**: Same style as signup, "Welcome Back" subtitle, 2 inputs, login button, signup link

---

#### `ProfileSetupPage.jsx`

**Dual Mode**: Detects `/update-profile` path → shows "Update" vs "Setup" text

**State**: `formData` (gender, dob, bio, genderPreference), `profilePic` (base64), `preview` (display URL), `error`, `loading`. Pre-fills from `authUser` in update mode.

**Functions**:
- `handleChange(e)` — field update
- `handleImageChange(e)` — reads file as base64 via `FileReader`, sets preview
- `handleSubmit(e)` — PUTs to `/auth/update-profile`, updates Zustand store, navigates to `/`

**UI**: Profile photo circle with upload button, gender select, date picker, bio textarea, preference select, submit + optional cancel button

---

#### `DashboardPage.jsx` — Main Swipe Screen

**State**: `users` (feed), `loading`, `currentIndex`, `swipeDirection` (animation trigger)

**Functions**:
- `fetchUsers()` — GET `/match` for swipeable profiles
- `handleSwipeRight(userId)` — sets direction "right" → 500ms animation → POST `/match/swipe-right/:id` → alerts on match → advances index
- `handleSwipeLeft(userId)` — sets direction "left" → POST `/match/swipe-left/:id` → advances
- `handleLogout()` — logout + navigate

**UI**:
- **Navbar**: Logo, user avatar/name, Matches link, Edit Profile link, Logout
- **Card**: 420px profile image with gradient overlay (name + age), LIKE/NOPE stamp animations, stacked card effect
- **Buttons**: Pass (X), Like (Heart ❤️, purple), Super Like (Star ⭐, yellow) — all with hover scale animations
- **Empty State**: "All caught up!" with refresh
- **Counter**: "2 / 5" progress

**Animation**: CSS `translate-x-[150%] rotate-12 opacity-0` for right, mirrored for left, 500ms duration

---

#### `MatchesPage.jsx`

**State**: `matches` array, `loading`

**Functions**:
- `fetchMatches()` — GET `/match/matches`
- `handleLogout()` — logout + navigate

**Key Logic**: `match.users.find(u => u._id !== authUser._id)` extracts the other user from each match

**UI**:
- **Navbar**: Logo, user info, Discover link, Logout
- **Grid**: 2-column match cards with photo, green online dot, name, age, bio, "Message" button
- **Click** → navigates to `/chat/:userId`
- **Empty State**: "No matches yet!" + "Start Swiping" button

---

#### `ChatPage.jsx` — Real-Time Chat

**State**: `messages`, `newMessage` (input), `matchedUser`, `loading`, `sending`

**Refs**: `messagesEndRef` for auto-scroll

**Functions**:
- `fetchMatchedUser()` — finds user from matches by URL param
- `fetchMessages()` — GET `/messages/:id`
- `handleSend(e)` — POST `/messages/send/:id`, appends to local state
- `scrollToBottom()` — smooth scroll to bottom
- `isSentByMe(msg)` — safely compares sender ID (handles populated & raw ObjectId)

**Socket.IO**:
- Listens for `"newMessage"` → appends if from current chat partner
- Cleanup on unmount via `socket.off("newMessage")`

**UI**:
- **Header**: Back arrow, user avatar + name + status, logo
- **Messages**: Right-aligned purple bubbles (sent), left-aligned white bubbles with avatar (received), timestamps
- **Input**: Text field + purple send button, disabled when empty/sending
- **Loading**: Spinner, **Empty**: "💌 No messages yet, say hello!"

---

## 6. Configuration Files

| File | Purpose |
|---|---|
| `tailwind.config.js` | Content paths + custom fonts (Dancing Script, Lobster Two) |
| `vite.config.js` | React plugin for Fast Refresh + JSX |
| `vercel.json` | SPA rewrite: all paths → `/index.html` |
| `postcss.config.js` | TailwindCSS + Autoprefixer plugins |
| `railway.json` | Nixpacks builder, start command, restart on failure |

---

## 7. Feature Flows

### 7.1 Registration
```
SignupPage → POST /api/auth/signup → JWT cookie set → Zustand authUser set
  → Socket connected → Navigate to /profile-setup
  → ProfileSetupPage → PUT /api/auth/update-profile → Cloudinary upload
  → Navigate to / (Dashboard)
```

### 7.2 Swipe & Match
```
Dashboard loads → GET /api/match → Filtered user feed
Tap ❤️ → POST /api/match/swipe-right/:id
  → Backend: did they like me? YES → Match created → { isMatch: true }
  → NO → { isMatch: false } → Next card
Tap ✕ → POST /api/match/swipe-left/:id → Next card
```

### 7.3 Real-Time Chat
```
Click match → /chat/:userId → GET /api/messages/:id (history)
  → Socket listens "newMessage"
Send → POST /api/messages/send/:id → Backend creates doc
  → Emits "newMessage" to receiver via Socket.IO
  → Receiver's ChatPage appends in real-time
```

### 7.4 Auth Session
```
App mount → checkAuth() → GET /api/auth/check (cookie sent)
  → protectRoute verifies JWT
  → Valid → user data returned → authUser set → socket connected
  → Invalid → 401 → redirect to /login
```

---

## 8. Environment Variables

### Backend `.env`
| Variable | Purpose |
|---|---|
| `PORT` | Server port (default 8080) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | JWT signing secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLIENT_URL` | Frontend URL for CORS |
| `EMAIL_USER` | Gmail for OTP emails |
| `EMAIL_PASS` | Gmail app password |

### Frontend `.env`
| Variable | Purpose |
|---|---|
| `VITE_MODE` | Controls API base URL (production/development) |

---

## 9. Deployment

| Component | Platform | Config |
|---|---|---|
| Frontend | Vercel | Root: `FRONTEND`, Build: `npm run build`, Output: `dist` |
| Backend | Render/Railway | Root: `BACKEND`, Start: `node src/index.js` |
| Database | MongoDB Atlas | Cloud-hosted, connected via `MONGODB_URI` |
| Images | Cloudinary | Profile pics uploaded via SDK |

---

*End of documentation.*
