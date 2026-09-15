# StockMind AI — Master FYP Development Specification

## 1. PROJECT IDENTITY

**Project Title:**
**StockMind AI: An Intelligent Demand Forecasting and Inventory Optimization System for Multi-Outlet Retail Chains**

**Project Type:** Final Year Project — Product Development + Applied Machine Learning

**University:** Riphah International University Lahore, Pakistan
**School:** Riphah School of Computing & Innovation
**Program:** BS Software Engineering
**Supervisor:** Dr. Muhammad Fawad
**Team:** Meer Musabih & Malaika Saleem
**Academic Year:** 2026–2027

---

# 2. IMPORTANT DEVELOPMENT INSTRUCTION

The existing StockMind AI codebase is a **prototype**, not the final FYP.

Do NOT simply add cosmetic features to the existing prototype.

The goal is to transform the existing prototype into a proper, academically defensible, technically substantial Final Year Project.

The existing implementation should be treated as a starting point. Reuse good components where appropriate, but refactor or replace prototype components that do not satisfy the final architecture.

The final system must demonstrate:

1. Machine-learning-based demand forecasting.
2. Rigorous comparison of forecasting models.
3. Automated model selection.
4. Inventory optimization.
5. Multi-outlet inventory balancing.
6. Stockout-aware demand estimation.
7. Data-driven replenishment recommendations.
8. Persistent database-backed data management.
9. Proper authentication and role-based access.
10. Historical analytics.
11. Quantitative evaluation of forecasting performance.
12. Quantitative evaluation of inventory optimization performance.
13. Comparison against baseline inventory policies.
14. A complete end-to-end working product suitable for an FYP demonstration.

The project must NOT be presented merely as a dashboard.

It is an intelligent decision-support system for retail inventory management.

---

# 3. CORE PROBLEM

Retail chains operating multiple outlets must decide:

* How much inventory should each outlet maintain?
* When should a product be reordered?
* Which products are likely to experience stockouts?
* Which products are overstocked?
* How much demand should be expected in the future?
* Which forecasting model should be trusted for a particular product?
* How much safety stock is required?
* Can inventory be transferred between outlets before placing a new supplier order?
* How can inventory holding costs and stockout costs be reduced?

Traditional inventory systems often rely heavily on:

* fixed reorder points,
* historical averages,
* manual judgment,
* static safety stock,
* simple demand estimates.

StockMind AI should improve these decisions by combining machine learning, statistical forecasting, inventory theory, and multi-outlet optimization.

---

# 4. MAIN RESEARCH QUESTION

The primary research question is:

**How can machine-learning-based demand forecasting be combined with inventory optimization to reduce stockouts, excess inventory, and inventory-related costs across multiple retail outlets?**

Supporting research questions:

1. Which forecasting model provides the most accurate demand predictions for different product-outlet combinations?
2. Does stockout-aware demand correction improve forecasting performance?
3. Can automated model selection outperform the use of a single forecasting algorithm?
4. Can forecast-driven inventory policies reduce simulated stockouts and excess inventory compared with conventional inventory policies?
5. Can cross-outlet inventory transfers reduce stockout risk and unnecessary procurement?

---

# 5. PROJECT AIM

The aim of StockMind AI is to develop an intelligent retail inventory management platform that forecasts product demand, evaluates multiple forecasting algorithms, automatically selects suitable models, calculates optimized inventory policies, identifies stockout and overstock risks, and recommends replenishment or inter-outlet transfers.

---

# 6. PROJECT OBJECTIVES

## Objective 1 — Data Management

Develop a centralized database-backed system for managing:

* products,
* categories,
* suppliers,
* outlets,
* sales,
* inventory,
* purchases,
* stock movements,
* returns,
* forecasts,
* recommendations.

## Objective 2 — Demand Forecasting

Implement and evaluate multiple forecasting approaches:

* Simple Moving Average (SMA) baseline
* Holt-Winters
* ARIMA/SARIMA
* XGBoost

The architecture should allow additional models to be added later.

## Objective 3 — Model Evaluation

Evaluate models using:

* MAE
* RMSE
* MAPE or SMAPE
* Forecast Bias

Use proper time-series validation rather than random train/test splitting.

## Objective 4 — Automated Model Selection

Determine the best-performing model for each product-outlet combination based on validation performance.

The system should not assume that one model is universally best.

## Objective 5 — Stockout-Aware Demand Estimation

Detect periods where observed sales were constrained by unavailable inventory.

Estimate latent demand during stockout periods so that forecasting models do not learn artificially low demand.

## Objective 6 — Inventory Optimization

Calculate:

* Safety Stock
* Reorder Point
* Economic Order Quantity
* Target Stock Level
* Recommended Order Quantity
* Days of Supply
* Stockout Risk
* Overstock Risk

## Objective 7 — Multi-Outlet Optimization

Identify opportunities where:

* one outlet has surplus inventory,
* another outlet has predicted inventory shortage,
* transferring inventory is preferable to immediate procurement.

## Objective 8 — Experimental Evaluation

Compare StockMind's optimized inventory policy against conventional baseline policies.

Measure:

* stockout rate,
* service level,
* average inventory,
* excess inventory,
* inventory holding cost,
* ordering cost,
* stockout cost,
* total inventory cost,
* inventory turnover.

---

# 7. FINAL SYSTEM CONCEPT

StockMind AI should operate as follows:

```text
Retail Data
    ↓
Data Validation & Cleaning
    ↓
Demand Correction
    ↓
Feature Engineering
    ↓
Forecasting Models
    ├── Baseline
    ├── Holt-Winters
    ├── ARIMA/SARIMA
    └── XGBoost
    ↓
Model Evaluation
    ↓
Best Model Selection
    ↓
Demand Forecast
    ↓
Inventory Optimization
    ├── Safety Stock
    ├── Reorder Point
    ├── EOQ
    ├── Target Stock
    └── Order Quantity
    ↓
Multi-Outlet Optimization
    ├── Replenishment Recommendations
    └── Transfer Recommendations
    ↓
Management Dashboard
```

---

# 8. TECHNOLOGY STACK

## Frontend

Use:

* React
* TypeScript
* Vite
* TailwindCSS
* Recharts
* React Router
* date-fns

The existing frontend can be reused and redesigned.

Do not rebuild the entire frontend unnecessarily.

However, prototype-only hardcoded calculations should be moved into proper backend services where appropriate.

---

# 9. BACKEND

Use:

* Python
* FastAPI
* Uvicorn
* pandas
* numpy
* scikit-learn
* statsmodels
* XGBoost
* scipy

Additional libraries may be introduced when justified.

---

# 10. DATABASE

Replace the current CSV/in-memory architecture with a proper relational database.

Preferred database:

**PostgreSQL**

Use SQLAlchemy or an equivalent production-quality ORM/data-access layer.

Database entities should include at minimum:

### User

* id
* name
* email
* password_hash
* role
* outlet_id
* created_at

### Outlet

* id
* name
* location
* type
* active

### Category

* id
* name

### Product

* id
* sku
* name
* category_id
* supplier_id
* unit
* cost
* selling_price
* lead_time_days
* minimum_order_quantity
* shelf_life_days where applicable
* active

### Supplier

* id
* name
* contact information
* average_lead_time
* reliability_score

### Sale

* id
* date
* outlet_id
* product_id
* units_sold
* units_returned
* revenue

### Inventory

* id
* date
* outlet_id
* product_id
* opening_stock
* received_stock
* units_sold
* units_returned
* closing_stock

### Purchase Order

* id
* supplier_id
* outlet_id
* status
* order_date
* expected_date
* received_date

### Purchase Order Item

* purchase_order_id
* product_id
* quantity
* unit_cost

### Forecast

* id
* product_id
* outlet_id
* model
* forecast_date
* predicted_demand
* lower_bound
* upper_bound

### Model Evaluation

* id
* product_id
* outlet_id
* model
* mae
* rmse
* mape
* smape
* bias
* validation_period
* created_at

### Inventory Recommendation

* id
* product_id
* outlet_id
* recommendation_type
* priority
* quantity
* reason
* expected_stockout_risk
* created_at

### Transfer Recommendation

* id
* product_id
* source_outlet_id
* destination_outlet_id
* quantity
* priority
* reason
* created_at

---

# 11. DATA STRATEGY

The current prototype uses synthetic data.

The final FYP should continue supporting synthetic data because it allows controlled experiments, but the data generation must become more realistic.

The existing prototype has:

* 5 outlets
* 40 products
* multiple categories
* approximately one year of daily data
* seasonal effects
* trends
* weekend effects
* stockouts
* returns
* emergency reorders

These concepts should be preserved and improved.

The existing dataset covers approximately:

**2025-07-01 to 2026-08-18**

and uses deterministic generation.

However, the final system should clearly distinguish between:

### Training/Development Dataset

Synthetic but realistic retail data.

### External Validation Dataset

Where possible, use a publicly available retail sales dataset to demonstrate that the methodology is not dependent entirely on our synthetic generator.

The external dataset does not need to contain every field in our database.

A mapping/preprocessing pipeline can adapt the external dataset to the forecasting experiment.

---

# 12. SYNTHETIC DATA GENERATOR

Improve the current generator.

It should simulate:

* 5+ outlets
* 40+ products
* multiple product categories
* different outlet demand profiles
* weekday/weekend patterns
* seasonal patterns
* long-term trends
* promotions
* holidays/events
* random demand shocks
* stockouts
* supplier delays
* returns
* emergency purchases
* overstock
* different supplier lead times

The generator should allow configuration.

Example:

```text
number_of_outlets
number_of_products
date_range
stockout_probability
promotion_probability
seasonality_strength
trend_strength
demand_noise
supplier_delay_probability
```

Use deterministic random seeds for reproducibility.

---

# 13. STOCKOUT-AWARE DEMAND CORRECTION

This is one of the important technical contributions of the project.

Observed sales are not always equal to actual customer demand.

Example:

```text
Actual customer demand = 30
Available inventory = 10
Observed sales = 10
```

If the model learns directly from sales, it may incorrectly conclude that demand was only 10.

Therefore:

### Stockout detection

Use inventory information to identify likely censored demand.

Potential signals:

* closing stock = 0
* consecutive zero-stock days
* sales reaching available inventory
* unusual drop in sales associated with inventory depletion

Do not blindly replace every zero-sales observation.

Differentiate between:

* genuine zero demand,
* stockout-constrained demand.

### Demand correction

Estimate missing demand using an appropriate method such as:

* rolling median,
* nearby non-stockout observations,
* day-of-week adjusted demand,
* model-based estimation.

The method should be documented and evaluated experimentally.

Compare:

```text
Forecasting without demand correction
vs
Forecasting with demand correction
```

and report whether forecasting performance improves.

---

# 14. FORECASTING MODELS

## Model 1 — Baseline

Use a proper baseline.

The baseline is the **Simple Moving Average (SMA)** with a configurable window.

The baseline exists primarily to determine whether more complex models actually add value.

## Model 2 — HOLT-WINTERS

Use:

```text
statsmodels ExponentialSmoothing
```

Components:

* level
* trend
* seasonality

Use weekly seasonality where appropriate.

Period:

```text
7
```

The model should generate future predictions and confidence intervals.

## Model 3 — ARIMA/SARIMA

Implement proper statistical forecasting.

The system should evaluate suitable orders.

For seasonal daily retail demand, SARIMA should be considered where weekly seasonality exists.

Model selection may use:

* ADF stationarity testing
* AIC
* validation RMSE

Do not perform an unnecessarily huge grid search that makes the application unusably slow.

Caching/model persistence should be considered.

## Model 4 — XGBOOST

Use gradient boosting with engineered features.

Potential features:

### Temporal

* day_of_week
* day_of_month
* month
* week_of_year
* day_of_year
* is_weekend
* holiday/event indicators

### Lag

* lag_1, lag_2, lag_3, lag_7, lag_14, lag_28

### Rolling

* rolling_mean_7, rolling_mean_14, rolling_mean_30
* rolling_std_7, rolling_std_14, rolling_std_30
* rolling_min, rolling_max

### Demand

* expanding_mean
* demand_trend
* net_demand

### Returns

* return_lag_1, return_lag_7, rolling_returns

### Inventory

* stock level
* stockout flag
* stockout streak
* days of supply

Avoid target leakage.

Every feature must only use information available before the prediction date.

---

# 15. TIME-SERIES VALIDATION

Do NOT use ordinary random train/test splitting for forecasting evaluation.

Use chronological validation.

Example:

```text
Historical Data
────────────────────────────────────────────────>

Training        Validation        Test
|---------------|-----------------|----------|
```

Prefer rolling/expanding-window validation.

Example:

```text
Fold 1:
Train → Validation

Fold 2:
Train + Validation → Validation

Fold 3:
Train + previous validation → Validation
```

The final test set must remain unseen until final evaluation.

---

# 16. FORECAST HORIZONS

Support multiple horizons:

* 7 days
* 14 days
* 30 days

The primary operational horizon should be configurable.

The default can be:

**14 days**

because inventory decisions often require short-to-medium-term demand planning.

---

# 17. MODEL EVALUATION

For every model calculate:

### MAE — Mean Absolute Error

### RMSE — Root Mean Squared Error (Primary selection metric)

### MAPE — Use only where mathematically appropriate

### SMAPE — Use as an additional robust percentage metric

### Bias — mean(predicted - actual)

---

# 18. MODEL SELECTION

For every product × outlet combination:

1. Train/evaluate candidate models
2. Calculate validation metrics
3. Rank models
4. Select best model
5. Store model performance
6. Use selected model for operational forecasting

---

# 19. INVENTORY OPTIMIZATION

For every product × outlet:

### Average Daily Demand
### Lead Time
### Demand Variability
### Safety Stock — Z × σ × √L
### Reorder Point — expected demand during lead time + safety stock
### EOQ — √(2DS/H)
### Target Stock Level — Forecasted demand over protection period + Safety Stock
### Recommended Order Quantity
### Days of Supply
### Stockout Risk Classification (Critical/High/Medium/Low)
### Overstock Risk Classification (Critical/High/Medium/Low)

---

# 20. MULTI-OUTLET TRANSFER OPTIMIZATION

For every product:

Identify surplus outlets (Days of supply > 20) and deficit outlets (Days of supply < 7).

Evaluate possible transfers considering:

* source surplus
* destination deficit
* forecast demand
* expected stockout date
* transfer quantity
* destination urgency
* source outlet minimum stock

---

# 21. INVENTORY POLICY SIMULATION

Create an inventory simulator.

Compare at minimum:

## Policy A — Conventional Baseline
Fixed reorder point + fixed safety stock

## Policy B — Moving Average Policy
30-day average demand estimate

## Policy C — StockMind Policy
ML forecast + model selection + demand correction + safety stock + reorder point + inventory optimization

---

# 22. SIMULATION METRICS

For every policy calculate:

* Stockout Rate
* Service Level
* Average Inventory
* Excess Inventory
* Inventory Holding Cost
* Ordering Cost
* Stockout Cost
* Total Inventory Cost
* Inventory Turnover

---

# 23. ABLATION EXPERIMENTS

### Experiment 1 — Forecasting without demand correction vs with demand correction
### Experiment 2 — Single forecasting model vs automated model selection
### Experiment 3 — Traditional inventory policy vs StockMind inventory policy
### Experiment 4 — No transfer optimization vs transfer optimization

---

# 24. AUTHENTICATION & ROLES

### Administrator — manage users, outlets, products, suppliers, view all analytics, configure parameters
### Outlet Manager — view assigned outlet, inventory, forecasts, recommendations, approve/act on recommendations
### Analyst — view forecasts, compare models, view evaluation results, run experiments

Use JWT-based authentication. Passwords must never be stored in plaintext.

---

# 25. SYSTEM ARCHITECTURE

```text
┌────────────────────────────────────────────┐
│                React Frontend              │
└───────────────────┬────────────────────────┘
                    │
                REST API
                    │
┌───────────────────▼────────────────────────┐
│              FastAPI Backend               │
│                                            │
│ Authentication                             │
│ Product Service                            │
│ Inventory Service                          │
│ Forecast Service                           │
│ Recommendation Service                     │
│ Optimization Service                       │
│ Evaluation Service                         │
└───────────────┬──────────────┬─────────────┘
                │              │
                ▼              ▼
       ┌──────────────┐  ┌──────────────────┐
       │ PostgreSQL   │  │ ML Engine        │
       └──────────────┘  └──────────────────┘
```

---

# 26. BACKEND PROJECT STRUCTURE

```text
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

---

# 27. FRONTEND STRUCTURE

```text
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

# 28. FINAL FRONTEND ROUTES

```text
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

# 29. CURRENT PROTOTYPE COMPONENTS TO PRESERVE

Preserve/adapt:

* React dashboard
* product pages
* outlet pages
* forecast visualizations
* recommendation UI
* transfer logic
* synthetic data concepts
* SMA baseline
* Holt-Winters
* ARIMA
* XGBoost
* demand correction
* inventory optimization formulas
* model comparison
* existing charts
* API architecture where reusable

However, review every component before keeping it.

---

# 30. CURRENT PROTOTYPE COMPONENTS THAT MUST CHANGE

### CSV as primary data store → PostgreSQL
### In-memory-only business data → Persistent database-backed services
### Hardcoded KPI values → Calculate dynamically
### Hardcoded outlet health scores → Calculate from actual data
### Client-side-only inventory logic → Move to backend services
### Static/simulated recommendations → Generate dynamically
### Simple frontend forecast logic → ML backend should be authoritative
### Random train/test splitting → Chronological time-series validation
### Unsupported claims of model superiority → Measured experiments only

---

# 31. DEVELOPMENT PRIORITY

## Phase 1 — Understand Existing Code
## Phase 2 — Backend Foundation (PostgreSQL, DB models, auth)
## Phase 3 — Data Pipeline (ingestion, validation, preprocessing, generator, stockout detection, demand correction)
## Phase 4 — ML Pipeline (all models, features, validation, evaluation, selection, persistence)
## Phase 5 — Inventory Engine (demand calc, safety stock, ROP, EOQ, target stock, DOS, risk)
## Phase 6 — Multi-Outlet Optimization (surplus/deficit detection, transfers)
## Phase 7 — Simulation (policies, replay, cost calculations)
## Phase 8 — Frontend (connect to new backend)
## Phase 9 — Testing (unit, integration, ML, API, frontend)
## Phase 10 — Evaluation (run experiments, export metrics)

---

# 32. IMPORTANT RULES

1. Do not fabricate ML results.
2. Do not hardcode performance metrics.
3. Do not claim the system reduces costs unless the simulation demonstrates it.
4. Do not use random train/test splitting for time-series forecasting.
5. Do not introduce unnecessary technologies just to make the project look complex.
6. Prefer a clean, understandable architecture over excessive abstraction.
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

# 33. FINAL PRODUCT VISION

```text
LOGIN
  ↓
DASHBOARD → "What needs attention?"
  ↓
Stockout risks / Overstock risks / Reorder recommendations / Transfer opportunities
  ↓
"What will happen?" → Demand Forecast
  ↓
"Which forecast should I trust?" → Model Comparison
  ↓
"What should I do?" → Inventory Optimization → Reorder / Transfer Recommendation
  ↓
"Does this actually work?" → Experimental Evaluation
```

The user should be able to move from:

**Data → Forecast → Risk → Recommendation → Decision → Measured Outcome**

---

# 34. FINAL POSITIONING

StockMind AI should be described as:

> **An intelligent multi-outlet retail inventory decision-support system that combines stockout-aware demand estimation, machine-learning-based forecasting, automated model selection, inventory optimization, and cross-outlet inventory balancing to improve inventory availability and reduce unnecessary inventory costs.**

It should NOT be described merely as:

> "An inventory dashboard with four ML models."

---

# 35. SUCCESS CRITERIA

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
