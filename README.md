# EmpathWrite AI

A premium, full-stack AI Blog Generator built on the MERN stack. EmpathWrite goes beyond robotic AI text generation by focusing on collaborative co-writing, humanization filters, dynamic audience persona alignment, and a fluid, polished editor experience — powered by the **Groq API** (Llama-3.3-70b-versatile).

---

## Features

- **Secure Auth** — JWT stored in HTTP-Only cookies; passwords hashed with bcrypt (10 salt rounds)
- **Audience Alignment Wizard** — Multi-step onboarding wizard to configure target demographic, objective, and narrative tone using Framer Motion slide animations
- **Structured Outline Builder** — AI-powered JSON blueprint generator (H2/H3 hierarchy) with full drag-and-reorder controls
- **Real-Time SSE Streaming** — Token-by-token content delivery from Groq directly into a TipTap rich text canvas
- **Inline AI Context Menu** — Highlight any text to trigger a floating action menu: Humanize, Expand, Condense, and Tone shift
- **Anti-AI Phrasing Engine** — Systemic prompt directives that strip corporate filler phrases and enforce natural, varied sentence cadence
- **Mock Mode** — Full end-to-end functionality without a Groq API key, for development and testing

---

## Architecture & Data Flow

EmpathWrite AI leverages a decoupled architecture to ensure seamless real-time interactions:
1. **Frontend (React/Vite)**: The user configures a blog's metadata and interacts with a rich text editor (TipTap). It sends requests to the backend for outline generation, inline text modifications, and content streaming.
2. **Backend (Node.js/Express)**: Acts as a secure orchestrator. It verifies user sessions (JWT), stores blog data in MongoDB, and communicates securely with the LLM API.
3. **AI Generation (Groq/Llama-3)**: The backend routes (`/api/blogs/...`) build complex, customized system prompts encompassing the user's audience persona, tone, and the 'Anti-AI' directives. These are sent to Groq.
4. **Streaming (SSE)**: For full article generation, the backend uses Server-Sent Events (SSE) to pipe tokens token-by-token from Groq directly to the frontend's TipTap editor, providing a real-time typing experience.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v4, Framer Motion, TipTap, Axios |
| Backend | Node.js, Express.js, Mongoose |
| Database | MongoDB |
| AI | Groq API (`groq-sdk`) running Llama-3.3-70b-versatile |
| Auth | JWT, bcrypt, HTTP-Only Cookies |

---

## Project Structure

```
AI-Blog-Generator/
├── backend/
│   ├── config/
│   │   └── db.js               # Mongoose connection
│   ├── controllers/
│   ├── middleware/
│   │   └── auth.js             # JWT cookie validation
│   ├── models/
│   │   ├── User.js             # User schema w/ bcrypt pre-save hook
│   │   └── Blog.js             # Blog schema w/ configuration + outline
│   ├── routes/
│   │   ├── auth.js             # /api/auth (signup, login, logout)
│   │   ├── blogs.js            # /api/blogs (CRUD)
│   │   └── generate.js         # /api/blogs/:id/outline, /stream, /inline-edit
│   ├── .env                    # Environment config (not committed)
│   └── server.js               # Express app entrypoint
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Wizard.jsx      # Multi-step onboarding wizard
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Dashboard.jsx   # Campaign grid + metrics
    │   │   └── EditorPage.jsx  # TipTap canvas + SSE stream + inline menu
    │   ├── App.jsx             # Router + AuthContext + Axios interceptors
    │   ├── main.jsx
    │   └── index.css           # Tailwind v4 + custom TipTap styles
    ├── vite.config.js          # Vite + Tailwind plugin + /api proxy
    └── index.html
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB running locally on `mongodb://127.0.0.1:27017` (or a MongoDB Atlas URI)
- A Groq API key (optional — app runs in mock mode without one)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/AI-Blog-Generator.git
cd AI-Blog-Generator
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env   # or edit .env directly
```

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/empathwrite
JWT_SECRET=your_strong_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
NODE_ENV=development
```

> If `GROQ_API_KEY` is not set, the app automatically falls back to **Mock Mode** — all AI endpoints return pre-defined structured responses for testing.

### 3. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 4. Run the servers

Open two terminals:

```bash
# Terminal 1 — Backend API (port 5000)
cd backend && npm start

# Terminal 2 — Frontend Dev Server (port 5173)
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Reference

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register new user, returns JWT cookie | No |
| `POST` | `/api/auth/login` | Authenticate user, returns JWT cookie | No |
| `POST` | `/api/auth/logout` | Clears session cookie | Yes |
| `GET` | `/api/blogs` | List all blogs for current user | Yes |
| `POST` | `/api/blogs` | Create a new blog draft | Yes |
| `GET` | `/api/blogs/:id` | Fetch a single blog | Yes |
| `PUT` | `/api/blogs/:id/save` | Save editor content | Yes |
| `DELETE` | `/api/blogs/:id` | Delete a blog | Yes |
| `POST` | `/api/blogs/:id/outline` | Generate structured JSON outline via Groq | Yes |
| `GET` | `/api/blogs/:id/stream` | Stream blog content via SSE | Yes |
| `POST` | `/api/blogs/inline-edit` | Transform selected text (Humanize, Expand, Condense, Tone) | Yes |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Backend port (default: `5000`) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWTs |
| `GROQ_API_KEY` | No | Groq API key for Llama model. Falls back to mock mode if unset. |
| `NODE_ENV` | No | `development` or `production` |

---

## Security Notes

- The Groq API key is **strictly server-side** — never exposed to the client
- All cookies are `HttpOnly`, `SameSite: strict`, and `Secure` in production
- All protected routes validate the JWT on every request via the `protect` middleware
- IDOR protection enforced on all blog operations: queries always filter by both `_id` and `userId`

---

## License

MIT
