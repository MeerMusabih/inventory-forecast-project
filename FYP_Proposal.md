# Riphah International University Lahore, Pakistan
## Riphah School of Computing & Innovation

# FINAL YEAR PROJECT
## PROJECT PROPOSAL & PLAN

---

## StockMind AI: An Intelligent Demand Forecasting and Inventory Optimization System for Multi-Outlet Retail Chains

---

### Project ID: [Issued by FYP Manager]

---

## Project Team

| Student Name | Student ID | Program | Contact Number | Email Address |
|-------------|-----------|---------|---------------|---------------|
| Meer Musabih | | BSSE | | |
| Malaika Saleem | | BSSE | | |

---

## Project Supervisor
Dr. Muhammad Fawad (Assistant Professor)

---

## Change Record

| Author(s) | Version | Date | Notes | Supervisor's Signature |
|-----------|---------|------|-------|----------------------|
| | 2.0 | | Aligned with FYP Master Development Specification | |
| | 1.0 | | Original Draft | |
| | | | Changes Based on Feedback from Supervisor | |
| | | | Changes Based on Feedback From Faculty | |
| | | | Added Project Plan | |

---

## Project Proposal

### Project Title: StockMind AI: An Intelligent Demand Forecasting and Inventory Optimization System for Multi-Outlet Retail Chains

---

### Executive Summary

StockMind AI is a Final Year Project that develops an intelligent multi-outlet retail inventory decision-support system combining stockout-aware demand estimation, statistical and machine-learning-based forecasting, automated model selection, inventory optimization, cross-outlet inventory balancing, and inventory policy simulation with quantitative performance evaluation. The system addresses critical inventory management challenges — stockouts, overstocking, and manual forecasting errors — by implementing four forecasting approaches (Simple Moving Average (SMA) baseline, Holt-Winters Triple Exponential Smoothing, ARIMA/SARIMA, and XGBoost), stockout-aware demand correction, Economic Order Quantity calculations, safety stock optimization, automated model selection per product-outlet combination, multi-outlet transfer optimization, and an inventory policy simulator that compares StockMind's approach against conventional baseline policies. The target end-users are inventory managers, store supervisors, business owners, and analysts of multi-outlet retail operations (supermarkets, grocery chains, pharmacy networks). The technology stack includes React + TypeScript + Vite + TailwindCSS for the frontend, Python FastAPI for the backend, PostgreSQL for persistent data storage, and scikit-learn/statsmodels/XGBoost for the ML pipeline. The main deliverable is a fully functional, cloud-deployed web application featuring interactive dashboards, multi-model comparison analytics, outlet-level inventory optimization, experimental evaluation of inventory policies, and actionable restocking and transfer recommendations — all at zero licensing cost compared to enterprise alternatives exceeding PKR 50,000 annually.

---

### 1. Introduction

Pakistan's retail sector is rapidly growing, with multi-outlet supermarket chains expanding across urban and suburban areas. These chains face persistent inventory management challenges: stockouts lead to lost revenue and customer dissatisfaction, while overstocking ties up capital and increases waste. Traditional inventory management relies on manual spreadsheet calculations and gut-feel ordering, which fail to account for demand variability, seasonal patterns (Eid, Ramadan), and outlet-specific consumption behaviors. Small and medium-sized retail businesses in Pakistan — the backbone of the retail economy — cannot afford enterprise-grade solutions like Oracle Retail ($50,000+ annually) or complex implementations requiring 6-18 months of setup. StockMind AI is being developed to bridge this gap by providing a cost-effective, AI-powered inventory intelligence platform specifically designed for the operational realities of Pakistani retail chains, with local market adaptation, zero licensing fees, and an academically rigorous evaluation of its components.

---

### 2. Research Questions

The primary research question is:

**How can machine-learning-based demand forecasting be combined with inventory optimization to reduce stockouts, excess inventory, and inventory-related costs across multiple retail outlets?**

Supporting research questions:

1. Which forecasting model provides the most accurate demand predictions for different product-outlet combinations?
2. Does stockout-aware demand correction improve forecasting performance?
3. Can automated model selection outperform the use of a single forecasting algorithm?
4. Can forecast-driven inventory policies reduce simulated stockouts and excess inventory compared with conventional inventory policies?
5. Can cross-outlet inventory transfers reduce stockout risk and unnecessary procurement?

---

### 3. Existing System / Competitive Analysis

The current landscape of inventory management solutions presents several limitations for Pakistani SMB retailers:

**Oracle Retail Inventory Management** is an enterprise-grade solution offering advanced supply chain capabilities, but its annual licensing cost exceeds $50,000, making it inaccessible for most Pakistani retail businesses. It lacks native ML-based demand forecasting and requires 6-18 months of implementation with dedicated IT infrastructure. Oracle's solution is designed for global enterprise clients, not for the operational scale and budget constraints of Pakistani retail chains.

**Zoho Inventory** is a cloud-based SMB solution that offers basic inventory tracking with a single ML model for demand forecasting. However, it requires 6-12 months of historical data before the ML features become useful, and it locks users into the Zoho ecosystem (Zoho Books, Zoho CRM). The platform does not support multi-model comparison, which is critical for understanding which forecasting approach best suits a particular product-outlet combination. Pricing starts at $39/month per warehouse, which can accumulate significantly for multi-outlet operations.

**inFlow Inventory** is an all-in-one inventory management solution popular among SMBs, but it offers no native demand forecasting capabilities. Users must rely on basic reorder point calculations or integrate with third-party forecasting tools, adding complexity and cost. The platform does not provide the analytical depth needed to optimize inventory across multiple outlets with varying demand patterns.

**Key Gaps Identified by StockMind AI:**
- **Multi-model forecasting:** Unlike single-model solutions, StockMind AI compares four forecasting approaches (SMA, Holt-Winters, ARIMA/SARIMA, XGBoost) and automatically identifies the best performer for each product-outlet combination.
- **Stockout-aware demand estimation:** Corrects censored demand during stockout periods, a capability absent in all three competitors.
- **Cost-effective for Pakistani market:** Zero licensing fees; open-source, self-hosted option available.
- **Local market adaptation:** Built-in support for seasonal demand patterns (Eid, Ramadan, weekend variations) specific to the Pakistani retail context.
- **Integrated inventory optimization:** EOQ, safety stock, and reorder point calculations combined with ML forecasts in a single platform.
- **Multi-outlet transfer optimization:** Identifies cross-outlet transfer opportunities before triggering new procurement.
- **Inventory policy simulation:** Quantitatively compares StockMind's approach against conventional baseline policies, providing evidence-based evaluation.
- **Interactive visual dashboards:** Dynamic KPIs, demand heatmaps, and outlet health scoring — no technical expertise required.

---

### 4. Problem Statement

Multi-outlet retail chains in Pakistan face a critical inventory management problem: stockouts result in lost sales (estimated at 4-8% of revenue for retail chains), while overstocking ties up working capital and increases holding costs by 20-30%. Current inventory decisions are made manually using spreadsheets or basic ERP modules that do not leverage historical sales data for demand prediction. Enterprise solutions are prohibitively expensive (PKR 50,000+ annually), while available SMB tools lack ML capabilities or require ecosystem lock-in. There is no integrated, cost-effective solution that combines AI-powered demand forecasting with inventory optimization specifically designed for the Pakistani retail context — where seasonal demand spikes during Eid and Ramadan, multi-outlet distribution, and budget constraints create unique operational challenges.

Furthermore, existing inventory systems do not account for demand censorship during stockout periods, do not compare multiple forecasting models to select the most appropriate one per product-outlet combination, and do not provide quantitative evidence that their optimization recommendations actually improve inventory outcomes compared to conventional policies.

---

### 5. Proposed Solution

StockMind AI proposes a full-stack intelligent decision-support system that integrates machine learning forecasting with inventory optimization and policy simulation:

**FR-1:** The system shall display an interactive dashboard with dynamic KPIs including total products, total stock, total inventory value, low-stock items, fast-moving products, slow-moving products, critical stockout risks, predicted stockouts, overstock items, pending reorders, recommended transfers, forecast accuracy, service level, inventory cost, and inventory turnover.

**FR-2:** The system shall train and compare four forecasting approaches (Simple Moving Average (SMA) baseline, Holt-Winters, ARIMA/SARIMA, XGBoost) for each product-outlet combination and identify the best-performing model based on RMSE using chronological time-series validation.

**FR-3:** The system shall implement stockout-aware demand correction that detects censored demand periods and estimates true demand using rolling median of non-stockout observations, with experimental comparison of forecasting performance with and without correction.

**FR-4:** The system shall calculate Economic Order Quantity (EOQ), safety stock levels, reorder points, target stock levels, and recommended order quantities using demand statistics and configurable service level targets.

**FR-5:** The system shall generate prioritized restocking recommendations (critical, high, medium, low) with specific quantity suggestions and full explainability (why, what, how much, when) for each product at each outlet.

**FR-6:** The system shall identify cross-outlet transfer opportunities where one outlet has surplus inventory and another has predicted shortage, recommending specific transfer quantities and reasons.

**FR-7:** The system shall simulate inventory policies by replaying historical demand and comparing conventional baseline policies, moving average policies, and StockMind's optimized policy, measuring stockout rate, service level, average inventory, holding cost, ordering cost, stockout cost, total inventory cost, and inventory turnover.

**FR-8:** The system shall persist all data in a PostgreSQL database with proper relational modeling for products, categories, suppliers, outlets, sales, inventory, forecasts, model evaluations, recommendations, and transfer recommendations.

**FR-9:** The system shall implement role-based authentication (Administrator, Outlet Manager, Analyst) using JWT-based authentication with password hashing.

**FR-10:** The system shall provide configurable forecast horizons (7, 14, 30 days) and store forecast results with model performance metrics for reproducibility.

**User Stories:**
- "As an inventory manager, I want to see a forecast of demand for each product at each outlet so that I can plan purchases before stockouts occur."
- "As a store supervisor, I want to compare which forecasting model works best for my outlet's products so that I can trust the system's predictions."
- "As a business owner, I want to see which outlets have low health scores and which products are at critical stock levels so that I can prioritize replenishment actions."
- "As an analyst, I want to run experiments comparing different inventory policies so that I can demonstrate the system's value with evidence."
- "As an administrator, I want to configure system parameters and manage users so that the system meets our operational requirements."
- "As a store supervisor, I want to see transfer recommendations between outlets so that I can prevent stockouts without placing new supplier orders."

**Non-Functional Requirements:**
- NFR-1: The dashboard shall load within 3 seconds on a standard broadband connection.
- NFR-2: The system shall support concurrent access by up to 20 users without performance degradation.
- NFR-3: All data shall be stored securely with no unauthorized access; the system shall use HTTPS in production.
- NFR-4: The ML model comparison shall complete within 30 seconds for a standard 365-day dataset.
- NFR-5: All ML experiments shall be reproducible using deterministic seeds and stored experiment metadata.
- NFR-6: Passwords shall never be stored in plaintext; JWT tokens shall be used for session management.
- NFR-7: Inventory policy simulation shall process the full historical dataset within 60 seconds.
- NFR-8: Model training results and forecasts shall be persisted to avoid redundant retraining.

**Revenue Model (Entrepreneurial Consideration):**
StockMind AI is proposed as a freemium/open-source product. The core platform is free; premium features (multi-outlet synchronization, custom ML models, priority support) can be offered via subscription for larger retail chains. Key cost drivers are cloud hosting (~PKR 5,000/month on Render) and development time.

---

### 6. Scope of the Project

**Included Modules/Features:**

1. **Interactive Dashboard:** Dynamic KPI cards (total products, total stock, total inventory value, low-stock items, fast-moving products, slow-moving products, critical stockout risks, predicted stockouts, overstock items, pending reorders, recommended transfers, forecast accuracy, service level, inventory cost, inventory turnover), sales trend charts, top products by demand, outlet health comparison, and demand heatmap. Supports filtering by outlet, product, product category, date range, and inventory status.

2. **Multi-Model Forecasting Engine:** Implementation of four forecasting approaches — Simple Moving Average (SMA) baseline, Holt-Winters Triple Exponential Smoothing (captures level, trend, weekly seasonality), ARIMA/SARIMA with auto order selection (ADF stationarity testing, AIC-based order selection), and XGBoost (30+ engineered features including lags, rolling statistics, stockout flags, and return patterns). Models are evaluated using RMSE (primary), MAE, MAPE, SMAPE, and bias metrics with automatic best-model selection per product-outlet combination.

3. **Stockout-Aware Demand Correction:** Stockout detection using closing stock monitoring with differentiation between genuine zero demand and stockout-constrained demand. True demand estimation by replacing censored observations with rolling median of non-stockout observations. Experimental evaluation comparing forecasting performance with and without demand correction.

4. **Inventory Optimization Engine:** EOQ calculation (sqrt(2DS/H)), safety stock computation (Z x sigma_d x sqrt(L)) with configurable service levels (default 95%), reorder point calculation, target stock level calculation, recommended order quantity determination, demand trend analysis (30-day vs 60-day comparison), stockout risk assessment (critical/high/medium/low), overstock risk assessment, days of supply calculation, and weekly demand pattern analysis.

5. **Multi-Outlet Transfer Optimization:** Cross-outlet surplus/deficit detection, transfer opportunity identification between outlets with surplus and deficit stock, transfer quantity optimization considering source surplus, destination deficit, forecast demand, expected stockout date, and destination urgency.

6. **Inventory Policy Simulation:** Historical demand replay simulator comparing three policies: (A) Conventional baseline (fixed reorder point + fixed safety stock), (B) Moving average policy (30-day average demand), (C) StockMind optimized policy (ML forecast + model selection + demand correction + safety stock + reorder point + inventory optimization). Simulation measures stockout rate, service level, average inventory, excess inventory, holding cost, ordering cost, stockout cost, total inventory cost, and inventory turnover.

7. **Ablation Experiments:** Controlled experiments evaluating: (1) Forecasting with vs without demand correction, (2) Single model vs automated model selection, (3) Traditional vs StockMind inventory policy, (4) No transfer optimization vs transfer optimization.

8. **Persistent Data Management:** PostgreSQL database with SQLAlchemy ORM for managing products, categories, suppliers, outlets, sales, inventory, purchase orders, forecasts, model evaluations, inventory recommendations, and transfer recommendations.

9. **Authentication and Authorization:** JWT-based authentication with three roles: Administrator (full access), Outlet Manager (outlet-scoped access), Analyst (read-only analytics access).

10. **Historical Analytics:** Stored forecasts, model evaluations, and experiment results for historical analysis and reproducibility.

**Excluded Features:**
- Direct commercial POS integration (future enhancement)
- Automated supplier purchase orders / fully automated purchasing
- Automatic execution of inter-outlet transfers
- Full warehouse management
- Automated financial accounting
- Real-time payment processing
- Automated physical stock movement
- Weather-based demand prediction
- Automatic promotion optimization
- Full enterprise multi-company ERP
- Mobile application (web-responsive only)
- Multi-warehouse supply chain optimization beyond multi-outlet transfers
- Predictive maintenance or supply chain logistics beyond inventory optimization

---

### 7. System Architectural Design

The system follows a three-tier architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
│                  React + TypeScript + Vite                      │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │Dashboard │ │ Forecast │ │   Model  │ │Inventory │          │
│  │  Page    │ │  Page    │ │Evaluation│ │  Page    │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │Products  │ │ Outlets  │ │Recommen- │ │Experiment│          │
│  │  Page    │ │  Page    │ │dations   │ │  Page    │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                       │
│  │Transfer  │ │Settings  │ │  Login   │                       │
│  │  Page    │ │  Page    │ │  Page    │                       │
│  └──────────┘ └──────────┘ └──────────┘                       │
│         TailwindCSS (UI) + Recharts (Charts)                   │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST API (JSON)
┌────────────────────────┴────────────────────────────────────────┐
│                    APPLICATION LAYER                            │
│                   Python FastAPI                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  API Layer: auth, products, outlets, sales, inventory,   │   │
│  │  forecasts, recommendations, optimization, experiments   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Service Layer: forecasting, inventory, recommendation,  │   │
│  │  model selection services                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ML Engine (4 models): Baseline, Holt-Winters,          │   │
│  │  ARIMA/SARIMA, XGBoost + Demand Correction + Evaluation  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Optimization: Safety Stock, Reorder Point, EOQ,        │   │
│  │  Target Stock, Replenishment, Transfers                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Simulation: Inventory Simulator, Policy Comparison,     │   │
│  │  Cost Metrics, Service Level Calculation                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                     DATA LAYER                                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  PostgreSQL + SQLAlchemy ORM                              │   │
│  │  Persistent storage for: products, outlets, sales,        │   │
│  │  inventory, forecasts, model evaluations, recommendations │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Synthetic Data Generator + Data Preprocessing Pipeline   │   │
│  │  External Dataset Adapter (for validation)                │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Deployment Architecture:**
- **Frontend:** Built with Vite, served as static files from FastAPI's `/dist` directory
- **Backend:** FastAPI with Uvicorn, deployed on Render cloud platform
- **Database:** PostgreSQL (Render managed database or external)
- **CI/CD:** Render auto-detection via `render.yaml` configuration

**Technology Stack:**
| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + TypeScript | 19.x |
| Build Tool | Vite | 8.x |
| UI Framework | TailwindCSS | 4.x |
| Charts | Recharts | 3.x |
| Routing | React Router | 7.x |
| Backend | Python FastAPI | 0.115+ |
| ORM | SQLAlchemy | 2.x |
| Database | PostgreSQL | 15+ |
| ML Library | scikit-learn | 1.5+ |
| Time Series | statsmodels | 0.14+ |
| Gradient Boosting | XGBoost | 2.1+ |
| Data Processing | pandas + numpy | 2.2+ / 2.0+ |
| Deployment | Render | Cloud |

---

### 8. Implementation Tools and Techniques

**Development Methodology:**
Agile iterative development with two-week sprints. Each sprint delivers incremental functionality with regular testing and validation.

**Development Tools:**
- **IDE:** Visual Studio Code with TypeScript and Python extensions
- **Version Control:** Git with GitHub
- **Frontend Build:** Vite with TypeScript compilation and TailwindCSS processing
- **Backend Server:** Python FastAPI with Uvicorn ASGI server
- **ML Libraries:** scikit-learn (model evaluation), statsmodels (ARIMA, Holt-Winters), XGBoost (gradient boosting)
- **Data Processing:** pandas, numpy, scipy (statistics)
- **Database:** PostgreSQL with SQLAlchemy ORM
- **Deployment:** Render platform with automatic builds

**ML Implementation Approach:**
- **Data Preprocessing:** Stockout detection and demand correction using rolling median estimation with differentiation between genuine zero demand and stockout-constrained demand
- **Model Training:** Chronological time-series validation (rolling/expanding window), NOT random train/test splitting
- **Feature Engineering (XGBoost):** 30+ features including temporal (day_of_week, month, week_of_year), lag (1, 2, 3, 7, 14, 28 days), rolling statistics (mean, std, min, max over 7, 14, 30-day windows), demand indicators, return features, and stockout indicators — all preventing target leakage
- **Model Evaluation:** RMSE (primary), MAE, MAPE, SMAPE, and forecast bias metrics
- **Auto-Selection:** Best model identified by minimum RMSE across all four algorithms per product-outlet combination
- **Model Caching:** Trained models and forecasts persisted to database to avoid redundant retraining

**Simulation Approach:**
- Historical demand replay comparing three inventory policies
- Configurable cost parameters (holding cost rate, ordering cost, stockout penalty)
- Quantitative measurement of stockout rate, service level, average inventory, excess inventory, total cost, and inventory turnover
- Ablation experiments isolating the contribution of individual system components

**Testing Strategy:**
- Unit tests for individual ML models, inventory calculations, and business logic
- Integration tests for API → Service → Database workflows
- ML tests for feature generation, no target leakage, model output shape, and metric calculations
- API endpoint testing via FastAPI's test client
- Frontend component testing with React Testing Library

---

### 9. Project Plan

#### 9.1. Development Phases

**Phase 1 — Understand Existing Code (Week 1)**
- Inspect entire existing repository
- Identify reusable code, duplicated code, prototype shortcuts, hardcoded values
- Document current architecture boundaries
- Produce migration plan

**Phase 2 — Backend Foundation (Weeks 2-3)**
- PostgreSQL database setup
- SQLAlchemy ORM models and migrations
- Configuration management
- JWT authentication with role-based access
- Repository/service layer architecture

**Phase 3 — Data Pipeline (Weeks 3-4)**
- Improved synthetic data generator with configurable parameters
- Data ingestion and validation
- Data preprocessing pipeline
- Stockout detection and demand correction
- External dataset adapter

**Phase 4 — ML Pipeline (Weeks 5-7)**
- Simple Moving Average (SMA) baseline
- Holt-Winters Triple Exponential Smoothing
- ARIMA/SARIMA with auto order selection
- XGBoost with feature engineering
- Chronological time-series validation
- Model evaluation metrics (RMSE, MAE, MAPE, SMAPE, Bias)
- Automated model selection per product-outlet combination
- Forecast persistence and caching

**Phase 5 — Inventory Engine (Weeks 7-8)**
- Demand calculation service
- Safety stock, reorder point, EOQ, target stock calculations
- Days of supply calculation
- Recommended order quantity determination
- Stockout and overstock risk classification

**Phase 6 — Multi-Outlet Optimization (Week 8)**
- Surplus/deficit detection across outlets
- Transfer opportunity identification
- Transfer quantity optimization
- Transfer recommendation generation

**Phase 7 — Simulation (Weeks 9-10)**
- Inventory policy simulator
- Baseline policy implementation
- Moving average policy implementation
- StockMind optimized policy implementation
- Historical demand replay
- Cost and service level metrics calculation
- Ablation experiment framework

**Phase 8 — Frontend (Weeks 10-12)**
- Connect existing frontend to new backend
- Dashboard with dynamic KPIs
- Forecasting pages with model comparison
- Inventory optimization pages
- Recommendations and transfers pages
- Experiments and evaluation pages
- Authentication and settings pages

**Phase 9 — Testing (Weeks 12-13)**
- Unit tests
- Integration tests
- ML tests
- API tests
- Frontend tests

**Phase 10 — Evaluation (Weeks 13-14)**
- Run all experiments
- Export metrics, charts, tables
- Generate model comparisons
- Generate inventory policy comparisons
- Document results for FYP report

#### 9.2. Work Breakdown Structure (WBS)

1. **Project Management**
   1.1. Work Breakdown Structure (WBS)
   1.2. Roles & Responsibility Matrix
   1.3. Change Control System

2. **Reports / Documentation**
   2.1. Final Documentation Introduction
   2.2. Literature / Market Survey
   2.3. Requirements Analysis
   2.4. System Design
   2.5. Implementation
   2.6. Testing & Performance Evaluation
   2.7. Conclusion & Outlook
   2.8. End User Documentation
   2.9. Application Administration Documentation
   2.10. System Administrator Documentation

3. **System**
   3.1. Development Environment
   3.1.1. IDE (VS Code)
   3.1.2. Version Control (Git + GitHub)
   3.1.3. Server (FastAPI + Uvicorn)
   3.1.4. Database (PostgreSQL + SQLAlchemy)
   3.2. Presentation Layer
   3.2.1. Dashboard Page (KPIs, Charts, Outlet Health)
   3.2.2. Forecast Page (Model Comparison, Predictions)
   3.2.3. Products Page (Product List, Demand Ranking)
   3.2.4. Outlets Page (Outlet Detail, Health Scoring)
   3.2.5. Recommendations Page (Restock Actions, Transfer Suggestions)
   3.2.6. Inventory Page (Stock Levels, Reorder Alerts)
   3.2.7. Model Evaluation Page (Comparison, Metrics)
   3.2.8. Experiments Page (Policy Simulation, Ablation)
   3.2.9. Settings Page (System Configuration)
   3.2.10. Login Page (Authentication)
   3.3. Business Logic Layer
   3.3.1. ML Forecasting Engine (Baseline, Holt-Winters, ARIMA/SARIMA, XGBoost)
   3.3.2. Demand Correction Module (Stockout Detection, True Demand Estimation)
   3.3.3. Model Evaluation Engine (RMSE, MAE, MAPE, SMAPE, Bias)
   3.3.4. Automated Model Selection Engine
   3.3.5. Inventory Optimization Engine (EOQ, Safety Stock, Reorder Point, Target Stock)
   3.3.6. Recommendation Engine (Priority Scoring, Explainability)
   3.3.7. Transfer Optimization Engine (Surplus/Deficit Detection, Transfer Quantity)
   3.3.8. KPI Calculation Engine (Revenue, Stock Health, Days Remaining, Turnover)
   3.3.9. Inventory Policy Simulator (Baseline, Moving Average, StockMind)
   3.3.10. Experiment Framework (Ablation Studies)
   3.4. Data Management Layer
   3.4.1. PostgreSQL Database Schema
   3.4.2. SQLAlchemy ORM Models and Migrations
   3.4.3. Data Generator (Configurable Synthetic Data)
   3.4.4. Data Validation Pipeline
   3.4.5. External Dataset Adapter
   3.4.6. Forecast and Model Evaluation Persistence
   3.5. API Layer
   3.5.1. REST API Endpoints (FastAPI)
   3.5.2. Authentication API (JWT)
   3.5.3. CORS Configuration
   3.5.4. Static File Serving (Built React App)
   3.6. Security Layer
   3.6.1. Password Hashing
   3.6.2. JWT Authentication
   3.6.3. Role-Based Authorization
   3.6.4. Input Validation

#### Roles & Responsibility Matrix

| WBS # | WBS Deliverable | Activity # | Activity to Complete the Deliverable | Duration (# of Days) | Responsible Team Member(s) & Role(s) |
|-------|----------------|-----------|--------------------------------------|---------------------|--------------------------------------|
| 1.1 | WBS | 1 | Create and maintain WBS document | 2 | [Team Lead] |
| 1.2 | Roles & Responsibility Matrix | 2 | Define team roles and assign responsibilities | 1 | [Team Lead] |
| 2.1 | Final Documentation Introduction | 3 | Write project introduction and background | 3 | [Member 1] |
| 2.2 | Literature / Market Survey | 4 | Research existing solutions and competitive analysis | 5 | [Member 2] |
| 2.3 | Requirements Analysis | 5 | Document functional and non-functional requirements | 3 | [Member 1] |
| 2.4 | System Design | 6 | Create system architecture and design diagrams | 4 | [Member 2] |
| 3.1 | Development Environment | 7 | Set up IDE, Git, Python, Node.js, PostgreSQL | 2 | [All Members] |
| 3.2.1 | Dashboard Page | 8 | Implement KPI cards, charts, outlet health | 5 | [Member 1] |
| 3.2.2 | Forecast Page | 9 | Implement model selection, prediction display | 4 | [Member 2] |
| 3.2.3 | Products Page | 10 | Implement product list, demand ranking | 3 | [Member 1] |
| 3.2.4 | Outlets Page | 11 | Implement outlet detail, health scoring | 3 | [Member 2] |
| 3.2.5 | Recommendations Page | 12 | Implement restock actions, transfer suggestions | 4 | [Member 1] |
| 3.2.6 | Inventory Page | 13 | Implement stock levels, reorder alerts | 3 | [Member 2] |
| 3.2.7 | Model Evaluation Page | 14 | Implement model comparison, metrics display | 4 | [Member 2] |
| 3.2.8 | Experiments Page | 15 | Implement policy simulation results, ablation display | 4 | [Member 1] |
| 3.3.1 | ML Forecasting Engine | 16 | Implement Baseline, Holt-Winters, ARIMA/SARIMA, XGBoost | 12 | [Member 2] |
| 3.3.2 | Demand Correction Module | 17 | Implement stockout detection, demand estimation | 3 | [Member 2] |
| 3.3.3 | Model Evaluation Engine | 18 | Implement RMSE, MAE, MAPE, SMAPE, bias calculation | 3 | [Member 2] |
| 3.3.4 | Model Selection Engine | 19 | Implement automated per-product-outlet model selection | 3 | [Member 2] |
| 3.3.5 | Inventory Optimization Engine | 20 | Implement EOQ, safety stock, reorder point, target stock | 5 | [Member 1] |
| 3.3.6 | Recommendation Engine | 21 | Implement priority scoring, explainability | 3 | [Member 1] |
| 3.3.7 | Transfer Optimization Engine | 22 | Implement surplus/deficit detection, transfer quantity | 3 | [Member 1] |
| 3.3.8 | KPI Calculation Engine | 23 | Implement revenue, stock health, turnover | 2 | [Member 1] |
| 3.3.9 | Inventory Policy Simulator | 24 | Implement baseline, moving average, StockMind policies | 5 | [Member 1] |
| 3.3.10 | Experiment Framework | 25 | Implement ablation experiments, results export | 4 | [Member 2] |
| 3.4.1 | Database Schema | 26 | Design and create PostgreSQL schema | 3 | [Member 1] |
| 3.4.2 | ORM Models | 27 | Implement SQLAlchemy models and migrations | 3 | [Member 1] |
| 3.4.3 | Data Generator | 28 | Improve synthetic data generator | 4 | [Member 2] |
| 3.4.4 | Data Validation | 29 | Implement data validation pipeline | 2 | [Member 2] |
| 3.5.1 | REST API Endpoints | 30 | Implement all FastAPI endpoints | 6 | [Member 1] |
| 3.5.2 | Authentication API | 31 | Implement JWT authentication and roles | 3 | [Member 1] |
| 2.5 | Implementation Report | 32 | Document implementation details and decisions | 3 | [All Members] |
| 2.6 | Testing & Performance | 33 | Execute tests and document results | 5 | [All Members] |
| 2.7 | Conclusion & Outlook | 34 | Write conclusion and future work | 2 | [Team Lead] |
| 2.8 | End User Documentation | 35 | Create user guide with screenshots | 3 | [Member 1] |
| 4.0 | Cloud Deployment | 36 | Deploy to Render with PostgreSQL | 3 | [Member 2] |

---

### 10. Database Design

The system uses PostgreSQL with SQLAlchemy ORM. Core entities:

| Entity | Key Fields |
|--------|-----------|
| User | id, name, email, password_hash, role, outlet_id |
| Outlet | id, name, location, type, active |
| Category | id, name |
| Product | id, sku, name, category_id, supplier_id, unit, cost, selling_price, lead_time_days, minimum_order_quantity, active |
| Supplier | id, name, contact, average_lead_time, reliability_score |
| Sale | id, date, outlet_id, product_id, units_sold, units_returned, revenue |
| Inventory | id, date, outlet_id, product_id, opening_stock, received_stock, units_sold, units_returned, closing_stock |
| PurchaseOrder | id, supplier_id, outlet_id, status, order_date, expected_date, received_date |
| Forecast | id, product_id, outlet_id, model, forecast_date, predicted_demand, lower_bound, upper_bound |
| ModelEvaluation | id, product_id, outlet_id, model, mae, rmse, mape, smape, bias, validation_period |
| InventoryRecommendation | id, product_id, outlet_id, type, priority, quantity, reason, created_at |
| TransferRecommendation | id, product_id, source_outlet_id, destination_outlet_id, quantity, priority, reason |

---

### 11. Experimental Evaluation Plan

The system will conduct the following experiments:

**Experiment A — Forecast Accuracy:**
Compare Baseline, Holt-Winters, ARIMA/SARIMA, XGBoost using MAE, RMSE, MAPE, SMAPE, Bias.

**Experiment B — Demand Correction:**
Compare forecasting without stockout correction vs with stockout correction.

**Experiment C — Automated Model Selection:**
Compare single fixed model vs per-product/outlet model selection.

**Experiment D — Inventory Optimization:**
Compare traditional inventory policy vs StockMind optimized policy.

**Experiment E — Transfer Optimization:**
Compare no inter-outlet transfers vs StockMind transfer recommendations.

All results will be stored in the database and displayed in the Experiments page.

---

### References

1. Hyndman, R.J., & Athanasopoulos, G. (2021). *Forecasting: Principles and Practice* (3rd ed.). OTexts.
2. Box, G.E.P., Jenkins, G.M., Reinsel, G.C., & Ljung, G.M. (2015). *Time Series Analysis: Forecasting and Control* (5th ed.). Wiley.
3. Chen, T., & Guestrin, C. (2016). XGBoost: A Scalable Tree Boosting System. *Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining*, 785-794.
4. Silver, N. (2012). *The Signal and the Noise: Why So Many Predictions Fail — but Some Don't*. Penguin.
5. Oracle Retail. (2024). Oracle Retail Inventory Management. https://www.oracle.com/retail/
6. Zoho Corporation. (2024). Zoho Inventory. https://www.zoho.com/inventory/
7. Nooji Inc. (2024). inFlow Inventory. https://www.inflowinventory.com/
8. Pakistan Bureau of Statistics. (2023). *Pakistan Economic Survey 2022-23*.
9. Khan, M.A., & Khan, S. (2023). Inventory Management Challenges in Pakistani Retail Sector: A Survey of SME Retailers. *Journal of Supply Chain Management*, 15(2), 45-62.
10. Render. (2024). Render Documentation. https://render.com/docs
11. Kenneth, W. (1915). A Formulation of the Theory of Inventory Management. *Journal of the Operations Research Society*, 3(1), 35-41.
12. Makridakis, S., Spiliotis, E., & Assimakopoulos, V. (2018). The M4 Competition: Results, findings, conclusion and way forward. *International Journal of Forecasting*, 34(4), 802-808.

---

## List of Faculty Proposed Changes

| Project Title | Proposed Change | Proposed By | Supervisor's Decision |
|--------------|----------------|-------------|----------------------|
| | | | Approved/Disapproved and/or Comments |
| | | | |
| | | | |
| | | | |

---

Date: __________________				Supervisor's Signature: ______________

---

## APPROVAL

### Project Supervisor
Comments: ___________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

Name:______________________________	
Date:_______________________________	Signature:__________________________

---

### Project Manager
Comments: ___________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

Date:_______________________________	Signature:__________________________
