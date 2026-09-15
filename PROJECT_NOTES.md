# StockMind AI - Project Notes

## Project Title
**StockMind AI: An Intelligent Demand Forecasting and Inventory Optimization System for Multi-Outlet Retail Chains**

## FYP Registration Details

### Supervisor
- Dr. Muhammad Fawad (Assistant Professor)

### Semester & Program
- Semester: 7
- Program: BSSE

### Project Type
- Product Development Project
- Applied Machine Learning
- Artificial Intelligence

### Sustainable Development Goals (SDGs)
- Goal 8: Decent work and economic growth
- Goal 12: Responsible consumption and production

### Academic Year
- 2026-2027

---

## Project Overview

StockMind AI is an intelligent multi-outlet retail inventory decision-support system that combines:
1. Stockout-aware demand estimation
2. Multi-model demand forecasting (4 algorithms)
3. Automated model selection per product-outlet combination
4. Forecast-driven inventory optimization
5. Multi-outlet inventory balancing and transfer optimization
6. Inventory policy simulation with quantitative performance evaluation
7. Ablation experiments isolating individual component contributions

The system is NOT merely a dashboard. It is a complete decision-support methodology for retail inventory management.

### Primary Research Question
How can machine-learning-based demand forecasting be combined with inventory optimization to reduce stockouts, excess inventory, and inventory-related costs across multiple retail outlets?

---

## Technology Stack

### Frontend
- React 19.x + TypeScript 6.x + Vite 8.x
- TailwindCSS 4.x (UI)
- Recharts 3.x (Charts)
- React Router 7.x (Routing)
- clsx (Conditional classes)
- date-fns (Date handling)
- seedrandom (Deterministic data generation)

### Backend
- Python FastAPI + Uvicorn ASGI server
- SQLAlchemy 2.x ORM
- PostgreSQL 15+ (persistent database)
- pandas + numpy for data processing
- scikit-learn for model evaluation
- statsmodels for ARIMA/SARIMA and Holt-Winters
- XGBoost for gradient boosting model
- scipy for statistics (safety stock z-scores)
- PyJWT for authentication
- passlib/bcrypt for password hashing

### Deployment
- Render cloud platform
- render.yaml for auto-config
- build.sh for build pipeline

---

## Core Problem

Retail chains operating multiple outlets must decide:
- How much inventory should each outlet maintain?
- When should a product be reordered?
- Which products are likely to experience stockouts?
- Which products are overstocked?
- How much demand should be expected in the future?
- Which forecasting model should be trusted for a particular product?
- How much safety stock is required?
- Can inventory be transferred between outlets before placing a new supplier order?
- How can inventory holding costs and stockout costs be reduced?

Traditional systems rely on fixed reorder points, historical averages, manual judgment, static safety stock, and simple demand estimates.

---

## Proposed Solution Components

### 1. Data Management (PostgreSQL)
- Products, categories, suppliers, outlets
- Sales, inventory, purchase orders
- Forecasts, model evaluations
- Recommendations, transfer recommendations
- Users with role-based access

### 2. Demand Forecasting
- Simple Moving Average (SMA) baseline
- Holt-Winters Triple Exponential Smoothing
- ARIMA/SARIMA with auto order selection
- XGBoost with 30+ engineered features

### 3. Model Evaluation
- Chronological time-series validation (rolling/expanding window)
- Metrics: MAE, RMSE, MAPE, SMAPE, Bias
- RMSE as primary selection metric
- Automated best-model selection per product-outlet

### 4. Stockout-Aware Demand Correction
- Stockout detection using inventory signals
- Differentiates genuine zero demand vs stockout-constrained demand
- Replaces censored observations with rolling median
- Experimentally compared with/without correction

### 5. Inventory Optimization
- Safety Stock = Z x sigma x sqrt(L)
- Reorder Point = expected demand during lead time + safety stock
- EOQ = sqrt(2DS/H)
- Target Stock Level = forecasted demand over protection period + safety stock
- Recommended Order Quantity
- Days of Supply
- Stockout Risk (Critical/High/Medium/Low)
- Overstock Risk (Critical/High/Medium/Low)

### 6. Multi-Outlet Transfer Optimization
- Surplus detection (days of supply > 20)
- Deficit detection (days of supply < 7)
- Transfer quantity optimization
- Transfer recommendation generation

### 7. Inventory Policy Simulation
- Policy A: Conventional baseline (fixed reorder point + fixed safety stock)
- Policy B: Moving average policy (30-day average)
- Policy C: StockMind optimized policy
- Historical demand replay
- Metrics: stockout rate, service level, average inventory, holding cost, ordering cost, stockout cost, total cost, turnover

### 8. Ablation Experiments
- Experiment 1: With vs without demand correction
- Experiment 2: Single model vs automated selection
- Experiment 3: Traditional vs StockMind policy
- Experiment 4: No transfers vs transfer optimization

### 9. Authentication & Authorization
- JWT-based authentication
- Three roles: Administrator, Outlet Manager, Analyst
- Password hashing (bcrypt)

---

## Existing Solutions Analyzed

### 1. Oracle Retail Inventory Management
- Enterprise-grade, costly ($50K+ annually)
- No native ML forecasting
- Complex implementation (6-18 months)
- Not suitable for Pakistani SMBs

### 2. Zoho Inventory
- Cloud-based SMB solution
- Single ML model only
- Requires 6-12 months historical data
- Ecosystem lock-in (Zoho Books, CRM)

### 3. inFlow Inventory
- All-in-one inventory management
- No demand forecasting capabilities
- Basic reorder point calculations
- Third-party dependency for forecasting

---

## Key Gaps Addressed by StockMind AI
- Multi-model forecasting (4 approaches with automated selection)
- Stockout-aware demand estimation (unique technical contribution)
- Cost-effective for Pakistani market (zero licensing)
- Local market adaptation (Eid, Ramadan seasons)
- Self-hosted open-source option
- Integrated inventory optimization (EOQ, safety stock, ROP, target stock)
- Multi-outlet transfer optimization
- Inventory policy simulation with quantitative evaluation
- Ablation experiments for component contribution analysis
- Persistent PostgreSQL database
- Role-based authentication
- Interactive visual dashboards

---

## Project Structure

### Target Backend Structure
```
backend/
├── main.py
├── api/
│   ├── auth.py
│   ├── products.py
│   ├── outlets.py
│   ├── sales.py
│   ├── inventory.py
│   ├── forecasts.py
│   ├── recommendations.py
│   ├── optimization.py
│   └── experiments.py
├── core/
│   ├── config.py
│   ├── security.py
│   └── database.py
├── models/
│   ├── baseline.py
│   ├── holt_winters.py
│   ├── arima.py
│   ├── xgboost_model.py
│   ├── demand_correction.py
│   └── evaluation.py
├── optimization/
│   ├── safety_stock.py
│   ├── reorder_point.py
│   ├── eoq.py
│   ├── replenishment.py
│   └── transfers.py
├── simulation/
│   ├── inventory_simulator.py
│   ├── policies.py
│   └── metrics.py
├── services/
│   ├── forecasting_service.py
│   ├── inventory_service.py
│   ├── recommendation_service.py
│   └── model_selection_service.py
├── db/
│   ├── models/
│   └── repositories/
└── data/
    ├── generator.py
    └── preprocessing.py
```

### Target Frontend Structure
```
src/
├── pages/
│   ├── Dashboard/
│   ├── Forecast/
│   ├── Inventory/
│   ├── Products/
│   ├── Outlets/
│   ├── Recommendations/
│   ├── ModelEvaluation/
│   ├── Experiments/
│   ├── Transfers/
│   └── Settings/
├── components/
│   ├── charts/
│   ├── tables/
│   ├── cards/
│   ├── alerts/
│   └── layout/
├── services/api/
├── hooks/
├── context/
├── types/
└── utils/
```

---

## Final Frontend Routes
```
/                          Dashboard
/login                     Login
/inventory                 Inventory Overview
/inventory/:productId/:outletId   Inventory Detail
/forecast                  Forecasting
/forecast/:productId/:outletId    Forecast Detail
/models                    Model Comparison
/products                  Products
/products/:id              Product Detail
/outlets                   Outlets
/outlets/:id               Outlet Detail
/recommendations           Recommendations
/transfers                 Transfer Opportunities
/experiments               Experimental Evaluation
/settings                  System Configuration
```

---

## API Endpoints
```
POST /api/auth/login
GET  /api/products
POST /api/products
GET  /api/products/{id}
GET  /api/outlets
GET  /api/outlets/{id}
GET  /api/inventory
GET  /api/inventory/{product_id}/{outlet_id}
GET  /api/sales/{product_id}/{outlet_id}
POST /api/forecast/run
GET  /api/forecast/{product_id}/{outlet_id}
GET  /api/models/comparison/{product_id}/{outlet_id}
POST /api/model-selection/run
GET  /api/optimization/{product_id}/{outlet_id}
GET  /api/recommendations
GET  /api/recommendations/reorders
GET  /api/recommendations/transfers
POST /api/experiments/run
GET  /api/experiments/{id}
```

---

## Development Phases (Priority Order)

### Phase 1 — Understand Existing Code
Inspect existing repository, identify reusable/prototype components, produce migration plan.

### Phase 2 — Backend Foundation
PostgreSQL, database models, migrations, configuration, authentication, repositories/services.

### Phase 3 — Data Pipeline
Data ingestion, validation, preprocessing, synthetic data generator, stockout detection, demand correction.

### Phase 4 — ML Pipeline
All four models, feature engineering, time-series validation, evaluation metrics, model selection, forecast persistence.

### Phase 5 — Inventory Engine
Demand calculation, safety stock, reorder point, EOQ, target stock, days of supply, order quantity, risk classification.

### Phase 6 — Multi-Outlet Optimization
Surplus/deficit detection, transfer recommendations, transfer ranking.

### Phase 7 — Simulation
Baseline policy, StockMind policy, historical replay, cost calculations, ablation experiments.

### Phase 8 — Frontend
Connect existing frontend to new backend, build all pages.

### Phase 9 — Testing
Unit, integration, ML, API, frontend tests.

### Phase 10 — Evaluation
Run all experiments, export metrics, generate report.

---

## Database Schema (PostgreSQL)

### User
- id, name, email, password_hash, role, outlet_id, created_at

### Outlet
- id, name, location, type, active

### Category
- id, name

### Product
- id, sku, name, category_id, supplier_id, unit, cost, selling_price, lead_time_days, minimum_order_quantity, shelf_life_days, active

### Supplier
- id, name, contact, average_lead_time, reliability_score

### Sale
- id, date, outlet_id, product_id, units_sold, units_returned, revenue

### Inventory
- id, date, outlet_id, product_id, opening_stock, received_stock, units_sold, units_returned, closing_stock

### PurchaseOrder
- id, supplier_id, outlet_id, status, order_date, expected_date, received_date

### PurchaseOrderItem
- purchase_order_id, product_id, quantity, unit_cost

### Forecast
- id, product_id, outlet_id, model, forecast_date, predicted_demand, lower_bound, upper_bound

### ModelEvaluation
- id, product_id, outlet_id, model, mae, rmse, mape, smape, bias, validation_period, created_at

### InventoryRecommendation
- id, product_id, outlet_id, type, priority, quantity, reason, created_at

### TransferRecommendation
- id, product_id, source_outlet_id, destination_outlet_id, quantity, priority, reason, created_at

---

## Quick Start
| Platform | Setup | Run |
|----------|-------|-----|
| Windows | Double-click `setup.bat` | Double-click `start.bat` |
| Linux/Mac | `bash setup.sh` | `bash start.sh` |

## Deployment
- Platform: Render
- Auto-detected via `render.yaml`
- Database: PostgreSQL (Render managed)

---

## Final Positioning

StockMind AI should be described as:

> **An intelligent multi-outlet retail inventory decision-support system that combines stockout-aware demand estimation, machine-learning-based forecasting, automated model selection, inventory optimization, and cross-outlet inventory balancing to improve inventory availability and reduce unnecessary inventory costs.**

It should NOT be described merely as:

> "An inventory dashboard with four ML models."

---

## Important Development Rules

1. Do not fabricate ML results.
2. Do not hardcode performance metrics.
3. Do not claim the system reduces costs unless the simulation demonstrates it.
4. Do not use random train/test splitting for time-series forecasting.
5. Do not introduce unnecessary technologies just to make the project look complex.
6. Prefer clean, understandable architecture over excessive abstraction.
7. Keep the system runnable locally.
8. Keep deployment possible.
9. Document important assumptions.
10. All business calculations must have a clear mathematical or business justification.
11. Prevent data leakage in all ML experiments.
12. Do not remove existing useful prototype features without understanding their purpose.
13. When replacing a prototype implementation, preserve its functionality unless there is a clear reason to remove it.
14. Do not create fake database data merely to make the dashboard look populated.
15. The UI should communicate actual decisions and insights, not just display decorative charts.

---

## Success Criteria

1. The system can ingest and validate retail data.
2. The system can identify stockout-censored observations.
3. The system can generate corrected demand estimates.
4. At least four forecasting approaches can be evaluated.
5. The system can automatically select a model per product-outlet combination.
6. Forecasts can be generated for configurable horizons.
7. Forecast accuracy is measurable.
8. Inventory optimization is based on forecasts.
9. Reorder recommendations are dynamically generated.
10. Transfer recommendations are dynamically generated.
11. The system can simulate inventory policies.
12. Stockout, service-level, and cost metrics can be measured.
13. Results are stored and reproducible.
14. Users can access the system through authenticated roles.
15. The application is deployable.
16. Final results are supported by actual experiments rather than hardcoded claims.

---

## Configuration Parameters (Avoid Hardcoding)

```
service_level = 0.95
z_score = 1.96
ordering_cost = 50.0
holding_cost_rate = 0.25
default_lead_time = 3
forecast_horizon = 14
stockout_threshold = 7
overstock_threshold = 30
minimum_days_supply = 5
maximum_days_supply = 45
```

---

## Final FYP Contribution

The novelty of StockMind AI is the combination of:

1. Stockout-aware demand estimation
2. Multi-model demand forecasting
3. Automated model selection
4. Forecast-driven inventory optimization
5. Multi-outlet inventory balancing
6. Inventory policy simulation
7. Quantitative performance evaluation

The contribution is an integrated decision-support methodology that combines these components and evaluates their effect on retail inventory performance.

---

*Last updated: September 2026*

---

## Change Log

| Date | Session | Changes Made |
|------|---------|--------------|
| 2026-09-09 | Document Conflict Resolution | Resolved cross-document conflicts: baseline = Simple Moving Average (SMA), automated model selection, ARIMA/SARIMA, 4 recommendation priority levels, master spec confirmed as single source of truth; changes doc updated with PostgreSQL, auth, simulation, and ablation |
| 2026-09-08 | Master Specification Alignment | Updated project title to "An Intelligent Demand Forecasting and Inventory Optimization System for Multi-Outlet Retail Chains" |
| 2026-09-08 | Master Specification Alignment | Added full technology stack including PostgreSQL, SQLAlchemy, JWT auth |
| 2026-09-08 | Master Specification Alignment | Added database schema (13 entities) |
| 2026-09-08 | Master Specification Alignment | Added target backend/frontend project structures |
| 2026-09-08 | Master Specification Alignment | Added all API endpoints |
| 2026-09-08 | Master Specification Alignment | Added 10 development phases |
| 2026-09-08 | Master Specification Alignment | Added inventory policy simulation and ablation experiments |
| 2026-09-08 | Master Specification Alignment | Added transfer optimization details |
| 2026-09-08 | Master Specification Alignment | Added authentication and role-based access |
| 2026-09-08 | Master Specification Alignment | Added success criteria, development rules, configuration parameters |
| 2026-09-08 | Master Specification Alignment | Added final positioning and contribution statement |
| 2026-09-02 | FYP Registration Form | Initial project notes created |
| 2026-09-02 | FYP Registration Form | Added project title |
| 2026-09-02 | FYP Registration Form | Documented existing solutions analysis |
| 2026-09-02 | FYP Registration Form | Identified key gaps and value additions |

---

### Notes for Future Sessions:
- Always update this file after significant project discussions
- Add new entries to the Change Log with date, session summary, and changes
- Reference this file at the start of each session for context
- Reference FYP_MASTER_SPECIFICATION.md as the authoritative development guide
