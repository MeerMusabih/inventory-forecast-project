# Inventory Forecast & Predictive Analytics

ML-powered demand forecasting dashboard for a multi-outlet supermarket chain.

## What's Inside

- **React Dashboard** — Interactive charts, KPIs, inventory views
- **Python Backend** — FastAPI server with 4 ML forecasting models
- **ML Models** — SMA, Holt-Winters, ARIMA, XGBoost
- **Inventory Optimization** — EOQ, safety stock, reorder point calculations
- **Presentation** — `presentation.html` (open in any browser)

## Requirements

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://python.org/) (v3.10 or higher)

## Quick Start

| Platform | Setup | Run |
|----------|-------|-----|
| Windows | Double-click `setup.bat` | Double-click `start.bat` |
| Linux/Mac | `bash setup.sh` | `bash start.sh` |

After setup, open **http://localhost:8000** in your browser.

## Deploy to the Cloud (Render)

1. Push this project to a GitHub repository
2. Go to [render.com](https://render.com) and create a new **Web Service**
3. Connect your GitHub repo
4. Render will auto-detect `render.yaml` and configure everything
5. Your app will be live at `https://your-app-name.onrender.com`

The `render.yaml` file and `build.sh` script handle all build steps automatically.

## Project Structure

```
├── src/                  # React frontend
│   ├── pages/            # Dashboard, Forecast, ML Models, etc.
│   ├── components/       # Charts, cards, layout
│   ├── engine/           # Forecasting & KPI calculations
│   └── api/              # Backend API client
├── backend/              # Python FastAPI backend
│   ├── main.py           # API server (serves frontend too)
│   ├── data/             # Data generator + CSV
│   ├── models/           # ML models (SMA, Holt-Winters, ARIMA, XGBoost)
│   └── engine/           # Inventory optimization
├── scripts/              # Build scripts
├── presentation.html     # Management presentation
├── render.yaml           # Render deployment config
└── build.sh              # Render build script
```
