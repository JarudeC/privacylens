# PrivacyLens – Pre‑Upload Sensitive Info Scanner for Mobile Videos

React Native mobile app + FastAPI backend that scans videos before users upload them. It flags frames containing sensitive info (e.g., credit card numbers), shows the evidence, and lets users either continue with the original video or switch to an automatically blurred version.

## Tech Stack & Skills Implemented

**Frontend:**
- React Native (Expo)
- React hooks & Context API
- Expo Router (optional)
- Fetch/Axios for API calls
- In‑app notifications/toasts
- Local preview player for flagged frames

**Backend:**
- FastAPI with Python
- CORS and request validation (Pydantic)
- Portfolio optimization algorithms (Markowitz, GMVP, Reinforcement Learning)
- NumPy, Pandas, Scikit-learn, PyTorch for data processing

**Build & Dev:**
- Expo CLI for mobile dev & preview
- Uvicorn for local API

## Project Overview

Portfolio Pilot allows users to build and optimize investment portfolios using advanced machine learning techniques and AI-generated custom strategies. The platform combines classical portfolio theory with modern forecasting models and cutting-edge AI to help users create sophisticated, personalized investment strategies.

### Key Features

- **Pre‑Upload Scanning**: Catch leaks before they hit the internet
- **Evidence Review**: See flagged frames with bounding boxes and labels
- **1‑Tap Redaction**: Auto‑blur sensitive regions; re‑preview instantly
- **Asynchronous Processing**: Submit → poll progress → fetch results; no WebSockets/queues required
  
## Project Structure

```
.
├─ frontend/             ← Next.js web application
│   ├─ app/             ← App router pages and API routes
│   ├─ components/      ← Reusable React components
│   ├─ contexts/        ← React context providers
│   └─ lib/             ← Utility functions and configs
├─ backend/             ← FastAPI server
│   ├─ models/          ← ML portfolio optimization models
│   ├─ forecasting/     ← Time series forecasting models
│   ├─ utils/           ← Helper functions and data processing
│   ├─ main.py          ← FastAPI application entry point
│   └─ requirements.txt ← Python dependencies
└─ README.md           ← This file
```

## Setup & Installation

### Backend Dependencies
```bash
cd backend
pip install torch==2.2.2+cpu --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
```

### Frontend Dependencies
```bash
cd frontend
npm install
```

### Running the Application

**Start Backend Server:**
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Start Frontend Development Server:**
```bash
cd frontend
npm run dev
```

