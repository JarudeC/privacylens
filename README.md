# Portfolio Pilot - AI-Enhanced Full Stack Portfolio Construction Platform

A full-stack web application for portfolio optimization using machine learning, classical algorithms, and custom AI-generated strategies powered by Anthropic Claude.

## Tech Stack & Skills Implemented

**Frontend:**
- Next.js 15 with TypeScript
- React with hooks and context API
- Tailwind CSS for styling
- Recharts for data visualization
- Axios for API calls
- Anthropic Claude SDK integration

**Backend:**
- FastAPI with Python
- Machine Learning models (ARIMA, LSTM, Autoformer)
- Portfolio optimization algorithms (Markowitz, GMVP, Reinforcement Learning)
- NumPy, Pandas, Scikit-learn, PyTorch for data processing

**Database & Authentication:**
- Supabase (OAuth and PostgreSQL)
- JWT token management

## Project Overview

Portfolio Pilot allows users to build and optimize investment portfolios using advanced machine learning techniques and AI-generated custom strategies. The platform combines classical portfolio theory with modern forecasting models and cutting-edge AI to help users create sophisticated, personalized investment strategies.

### Key Features

- **Pre-built Algorithms**: Choose from proven portfolio optimization and forecasting models
- **Real-time Backtesting**: Test strategies against historical data with comprehensive performance metrics
- **Interactive Visualizations**: View portfolio compositions, equity curves, and forecast charts
- **Session History**: Track and compare all your strategy experiments
  
**Home Page** - Landing page with hero section, feature showcase, algorithm overview, and call-to-action elements.

https://github.com/user-attachments/assets/5321954a-5d97-45d7-9c7b-e68909ab53b1

**Dashboard** - Interactive interface for stock selection and model training initiation.

![dashboard](https://github.com/user-attachments/assets/2985319e-233c-435c-8f51-cdf9a873e09d)

**Custom AI Strategies**: Leverage Anthropic Claude to generate bespoke investment algorithms based on natural language descriptions

![custom ai model 1](https://github.com/user-attachments/assets/acc141fd-f2a1-4b98-b1f8-c70076b35f64)

![custom ai model 2](https://github.com/user-attachments/assets/d10bf847-97ab-4cec-a2a1-3a7b804dbf4b)

**History** - View past training results and portfolio performance analytics.

![history](https://github.com/user-attachments/assets/d0081d65-f069-469c-b3ff-11e396194c5b)

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

