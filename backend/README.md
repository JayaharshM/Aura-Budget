# Aura Budget - Backend

REST API and real-time server for the Aura Budget application. Built with Node.js, Express, Socket.io, and MongoDB Atlas.

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MongoDB Atlas (via Mongoose)
- **Real-time**: Socket.io
- **AI / LLM**: Groq (Llama 3.3), Google Gemini
- **ML Forecasting**: Python (scikit-learn) via child process
- **Auth**: JSON Web Tokens (JWT) + bcrypt
- **File Upload**: Multer (audio transcription)

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- Python 3.9 or higher (for the forecasting endpoint)
- A MongoDB Atlas cluster

### Installation

```bash
# Clone the repository
git clone https://github.com/JayaharshM/aura-backend.git
cd aura-backend

# Install Node dependencies
npm install

# Install Python dependencies
pip install -r ml/requirements.txt
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on (default: 5001) |
| `FRONTEND_URL` | URL of the deployed frontend (used for CORS) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `GROQ_API_KEY` | Groq API key for LLM features |
| `GEMINI_API_KEY` | Google Gemini API key for AI insights |
| `ALPHA_VANTAGE_API_KEY` | Alpha Vantage key for stock price lookups |

### Running Locally

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

The server starts on `http://localhost:5001` by default.

---

## API Overview

All protected routes require a `Bearer <token>` Authorization header.

### Auth

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive a JWT |

### User

| Method | Route | Description |
|---|---|---|
| POST | `/api/user/onboarding` | Save onboarding profile data |
| POST | `/api/user/reset` | Wipe all user data (requires password) |

### Transactions

| Method | Route | Description |
|---|---|---|
| GET | `/api/transactions` | Get all transactions for the current user |
| POST | `/api/transactions` | Add a new transaction |
| DELETE | `/api/transactions/:id` | Delete a transaction |

### Budgets

| Method | Route | Description |
|---|---|---|
| GET | `/api/budgets` | Get all personal budgets |
| POST | `/api/budgets` | Create or update a budget |
| DELETE | `/api/budgets/:id` | Delete a budget |

### Subscriptions, Goals, Investments

Standard CRUD endpoints under `/api/subscriptions`, `/api/goals`, and `/api/investments`.

### Collaboration Rooms

| Method | Route | Description |
|---|---|---|
| GET | `/api/rooms` | List joined rooms |
| POST | `/api/rooms` | Create a room |
| POST | `/api/rooms/join` | Join a room by code |

### AI Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/insights` | Get AI financial insights (Groq) |
| POST | `/api/ai/parse-day` | Parse a day description into transactions |
| POST | `/api/ai/suggest-budget` | Generate a personalized budget plan |
| POST | `/api/ai/stock-suggestions` | Get AI stock suggestions |
| POST | `/api/ai/transcribe` | Transcribe an audio file to text |

### Forecasting

| Method | Route | Description |
|---|---|---|
| POST | `/api/forecast` | Run ML spending forecast (calls forecast.py) |

### Stocks

| Method | Route | Description |
|---|---|---|
| GET | `/api/stocks/search` | Search for a stock symbol |
| GET | `/api/stocks/price` | Get the current price for a symbol |

---

## Real-time Events (Socket.io)

The server emits and listens on the following events:

| Event | Direction | Description |
|---|---|---|
| `join_room` | Client -> Server | Join a collaboration room |
| `leave_room` | Client -> Server | Leave a collaboration room |
| `join_user_room` | Client -> Server | Subscribe to personal notifications |
| `new_transaction` | Server -> Client | A new transaction was added to a room |
| `new_comment` | Server -> Client | A new comment was posted in a room |
| `room_update` | Server -> Client | Room data was updated |
| `room_deleted` | Server -> Client | A room was deleted |
| `request_processed` | Server -> Client | A join request was accepted or rejected |

---

## Deployment

This backend is designed to be deployed on platforms like **Render**, **Railway**, or **Fly.io**.

Set all environment variables listed above in your hosting platform's settings. The `start` script (`node server.js`) is used for production.

The `uploads/` directory is used at runtime by Multer to temporarily store audio files during transcription. No files in it are committed to the repository.
