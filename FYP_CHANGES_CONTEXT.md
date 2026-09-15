# StockMind AI — Complete FYP Changes and Updated Project Context

## 1. Purpose of This Document

This document records the changes made to the original StockMind AI prototype during the transition to the formal Final Year Project (FYP) version.

The original prototype was primarily a demonstration of inventory forecasting and dashboard functionality. The project has now been expanded into a complete **AI-powered predictive inventory intelligence and decision-support platform for multi-outlet retail chains**.

FYP_MASTER_SPECIFICATION.md is the authoritative development guide for the implementation. This document records the changes made from the original prototype and the development context aligned with the master specification.

The implementation should remain consistent with the approved FYP proposal.

---

# 2. Final Project Identity

## Project Title

**StockMind AI: An Intelligent Demand Forecasting and Inventory Optimization System for Multi-Outlet Retail Chains**

## Project Type

Product Development + Applied Machine Learning (Final Year Project)

## Project Domain

Artificial Intelligence / Predictive Analytics / Inventory Management / Retail Technology

## Target Users

* Inventory managers
* Store supervisors
* Business owners
* Retail management teams

## Target Businesses

The system is intended for multi-outlet retail businesses such as:

* Supermarket chains
* Grocery chains
* Pharmacy networks
* Other multi-location retail businesses

---

# 3. Major Change From the Original Prototype

The project must no longer be treated as simply:

> "An inventory dashboard with demand forecasting."

The final system is an:

> **Intelligent inventory decision-support platform that progresses from historical data analysis to demand forecasting, inventory optimization, inventory-risk detection, and actionable recommendations.**

The overall workflow is now:

**Historical Sales & Inventory Data**
→ **Data Validation**
→ **Data Preprocessing**
→ **Demand Analysis**
→ **Multiple Forecasting Approaches**
→ **Forecast Evaluation**
→ **Automated Model Selection**
→ **Inventory Optimization**
→ **Stockout/Overstock Risk Detection**
→ **Recommendation Generation**
→ **Inter-Outlet Transfer Analysis**
→ **FastAPI Backend**
→ **React Frontend**
→ **Inventory Intelligence Dashboard**

The product should demonstrate three levels of intelligence:

### Descriptive Intelligence

What has happened?

Examples:

* Historical sales
* Current inventory
* Product performance
* Outlet performance
* Demand trends

### Predictive Intelligence

What is likely to happen?

Examples:

* Future demand
* Expected stockouts
* Projected inventory
* Demand trends
* Forecasting model predictions

### Prescriptive Intelligence

What should the business do?

Examples:

* Reorder product
* Recommended replenishment quantity
* Maintain safety stock
* Prioritize critical inventory
* Transfer stock between outlets

---

# 4. Forecasting Architecture Changes

The forecasting system has been significantly expanded.

The final project must implement and evaluate **four forecasting approaches**:

1. Simple Moving Average (SMA)
2. Holt-Winters Triple Exponential Smoothing
3. ARIMA/SARIMA
4. XGBoost-based forecasting

## Important Terminology

Do NOT describe all four methods as "machine-learning algorithms."

The correct terminology is:

> **Multiple statistical and machine-learning-based forecasting approaches**

SMA, Holt-Winters, and ARIMA are statistical/time-series approaches.

XGBoost is the machine-learning-based forecasting approach.

---

# 5. Simple Moving Average

SMA is included as a baseline forecasting approach.

Purpose:

* Establish a simple forecasting baseline.
* Provide a reference point for evaluating more advanced approaches.
* Provide a simple method for relatively stable demand.

The implementation should allow the moving-average window to be configured where appropriate.

---

# 6. Holt-Winters Forecasting

Holt-Winters Triple Exponential Smoothing must be implemented for demand series where trend and/or seasonality are relevant.

It should be capable of considering:

* Level
* Trend
* Seasonality

The implementation should gracefully handle datasets where sufficient historical data for seasonal modeling is unavailable.

---

# 7. ARIMA/SARIMA Forecasting

ARIMA/SARIMA must be implemented as statistical time-series forecasting approaches.

SARIMA should be used where weekly seasonality is present in daily retail demand.

The implementation should:

* Accept product-outlet demand series.
* Prepare the series appropriately.
* Generate forecasts.
* Handle unsuitable or insufficient data gracefully.
* Produce forecast results that can be evaluated against actual held-out demand.

The project should not claim that ARIMA is universally superior.

---

# 8. XGBoost Forecasting

XGBoost is now explicitly part of the forecasting engine.

It should use appropriately engineered time-series features rather than treating raw dates as ordinary categorical variables.

Potential features include:

* Lagged demand
* Rolling averages
* Time-based features
* Historical sales behavior
* Trend-related features
* Relevant product/outlet information where appropriate

The exact feature set should be determined during implementation and validated through experimentation.

---

# 9. Forecasting Model Evaluation

A major addition is formal forecasting model evaluation.

The system should not assume that one forecasting method is always the best.

The approaches should be evaluated using suitable forecasting error metrics.

Forecasting metrics include:

* RMSE (primary)
* MAE
* MAPE where appropriate / SMAPE as an additional robust percentage metric
* Forecast Bias

The system should:

1. Train/generate forecasts.
2. Evaluate forecasts on held-out data.
3. Calculate forecasting metrics.
4. Compare approaches.
5. Present model performance.
6. Automatically select the best-performing approach based on observed performance and data suitability.

The system automatically selects the best model for each product-outlet combination, while presenting the comparison results for transparency.

---

# 10. Product-Outlet Forecasting

Forecasting must operate at the **product-outlet level** where sufficient historical data is available.

This is important because different outlets can have different demand patterns for the same product.

For example:

Product A:

* Outlet 1 → high demand
* Outlet 2 → medium demand
* Outlet 3 → low demand

The system should therefore avoid treating the entire company as a single demand series when outlet-level information is available.

---

# 11. Inventory Optimization Expansion

The original prototype has been expanded to include a dedicated inventory optimization layer.

The system should calculate:

* Average demand
* Sales velocity
* Safety stock
* Reorder point
* Days of stock remaining
* Recommended replenishment quantity
* Economic Order Quantity (EOQ), where applicable

The purpose is to convert forecasts into practical inventory decisions.

---

# 12. Economic Order Quantity

EOQ is now formally part of the project.

However, EOQ must only be calculated when the required parameters are available.

Potential parameters include:

* Demand
* Ordering cost
* Holding cost

If required parameters are unavailable, the system should not invent them silently.

Instead, EOQ should be:

* Marked unavailable
* Omitted from the calculation
* Or calculated only when suitable parameters are provided

The proposal wording is:

> "EOQ where the required inventory and cost parameters are available."

---

# 13. Safety Stock

Safety stock is now a formal inventory optimization component.

It should be calculated using an appropriate methodology based on the available data and project assumptions.

The implementation should clearly document the assumptions used.

The system should use safety stock as part of:

* Reorder point calculations
* Inventory risk detection
* Replenishment recommendations

---

# 14. Reorder Point

Reorder point is now a formal inventory planning indicator.

It should use relevant demand information, lead-time assumptions, and safety stock where applicable.

The system should compare current inventory against the calculated reorder point to identify inventory requiring attention.

---

# 15. Days of Stock Remaining

The system should estimate how long current inventory is expected to last based on demand/sales velocity.

This indicator is important for stockout detection.

For example:

Current inventory = 100 units

Average daily demand = 20 units

Approximate days of stock remaining = 5 days

The implementation must handle zero or extremely low demand safely.

---

# 16. Stockout Risk Detection

The final system must not only show current stock.

It must identify **potential future stockouts**.

The system should compare:

* Current inventory
* Historical demand
* Forecasted demand
* Projected inventory

The system should estimate when inventory may become insufficient.

This creates a predictive stockout warning rather than a simple low-stock indicator.

---

# 17. Overstock Detection

Overstock detection is now a formal requirement.

The system should identify situations where inventory is significantly higher than expected demand or calculated inventory requirements.

Possible indicators include:

* Current stock
* Forecasted demand
* Days of stock
* Reorder/inventory thresholds

The exact threshold should be configurable or clearly defined in the implementation.

---

# 18. Recommendation Engine

A dedicated recommendation engine has been added.

The system should transform inventory calculations and forecasting results into actionable recommendations.

Recommendations should contain supporting information such as:

* Product
* Outlet
* Current inventory
* Predicted demand
* Inventory status
* Reason for recommendation
* Suggested quantity where applicable

The recommendation engine is a major difference between the original prototype and the final FYP.

---

# 19. Recommendation Priority System

Recommendations now use four priority levels.

## Critical

Expected stockout within approximately **2 days**.

## High

Expected stockout within approximately **3–5 days**.

## Medium

Current inventory is below the calculated reorder point.

## Low

Potential inventory optimization or inter-outlet transfer opportunity.

These thresholds should be configurable.

Do not hard-code them as universal retail standards.

They are project-defined decision-support thresholds.

---

# 20. Recommendation Explainability

Recommendations should not appear as unexplained AI outputs.

Where applicable, the system should display the reasoning or relevant calculated indicators behind a recommendation.

For example:

> "High priority: Outlet A is projected to reach stockout in 4 days based on forecasted demand of 25 units/day and current stock of 100 units."

The exact wording can vary, but the user should be able to understand why the recommendation was generated.

---

# 21. Inter-Outlet Transfer Intelligence

A completely defined inter-outlet transfer capability has been added.

The system should compare:

* Inventory at Outlet A
* Inventory at Outlet B
* Forecasted demand at Outlet A
* Forecasted demand at Outlet B

If:

**Outlet A has excess inventory**

and

**Outlet B is approaching a shortage**

the system can identify a potential transfer opportunity.

The recommendation should contain:

* Source outlet
* Destination outlet
* Product
* Source inventory
* Destination inventory
* Forecasted demand
* Suggested transfer quantity where sufficient information exists
* Reason for recommendation

---

# 22. Important Transfer Rule

StockMind AI does **not** automatically execute inventory transfers.

It provides:

> **Decision-support recommendations**

The user must review and approve any real-world action.

The system should not automatically modify inventory records simply because a transfer opportunity has been detected.

---

# 23. Multi-Outlet Architecture

Multi-outlet functionality has been strengthened.

The system must support:

* Multiple retail outlets
* Outlet-specific inventory
* Outlet-specific historical sales
* Outlet-specific forecasts
* Outlet-specific recommendations
* Company-wide analytics

Users should be able to switch between:

**All Outlets**

and:

**Individual Outlet**

while retaining outlet-specific information.

---

# 24. Global Filtering

The dashboard now requires global filtering.

Users should be able to filter by:

* Outlet
* Product
* Product category
* Date range
* Inventory status

Changing a filter should dynamically update relevant:

* KPIs
* Charts
* Tables
* Forecasts
* Inventory indicators
* Recommendations

The system must maintain consistency between the selected filters and displayed information.

---

# 25. Inventory Intelligence Dashboard

The dashboard is no longer just a basic inventory dashboard.

It is now the:

> **Inventory Intelligence Dashboard**

It should provide a centralized overview of:

* Sales
* Demand
* Inventory
* Forecasts
* Inventory risks
* Recommendations
* Outlet performance

---

# 26. Dashboard KPIs

Where the required data is available, the dashboard should provide KPIs such as:

* Total products
* Total stock
* Low-stock products
* Fast-moving products
* Slow-moving products
* Overstocked products
* Predicted stockouts
* Inventory value
* Other relevant inventory indicators

KPIs should update according to global filters.

---

# 27. Demand Heatmap

A demand heatmap has been added.

The heatmap should visualize relative product demand across outlets.

Possible structure:

Rows:

Products

Columns:

Outlets

Cell value:

Demand/sales measure

This helps identify location-specific demand patterns.

For example:

A product may have:

* High demand at residential outlets
* Medium demand at city-center outlets
* Low demand at another location

The heatmap should help management recognize these patterns quickly.

---

# 28. Product Detail View

The final system should include a detailed product-level analytical view.

Depending on available data, it may include:

* SKU
* Product name
* Category
* Supplier
* Cost
* Selling price
* Current inventory
* Inventory by outlet
* Historical sales
* Forecast
* Projected inventory
* Days of stock
* Reorder point
* Safety stock
* EOQ where applicable
* Recommendations

The purpose is to provide a complete view of a product from one interface.

---

# 29. Outlet Detail View

Each outlet should have a dedicated inventory intelligence view.

It should provide:

* Current inventory
* Low-stock products
* Overstock products
* Fast-moving products
* Slow-moving products
* Top-selling products
* Predicted stockouts
* Demand information
* Recommendations
* Inventory health

---

# 30. Inventory Table

The final application should contain a searchable and sortable inventory table.

Recommended columns:

* Product
* Category
* Outlet
* Current stock
* Average daily sales
* Predicted demand
* Days of stock remaining
* Reorder point
* Recommended replenishment quantity
* Inventory status
* Demand trend

The table should support:

* Search
* Sorting
* Filtering

---

# 31. Data Management

The system must have a proper data management and validation layer.

The pipeline should validate:

* Required fields
* Data types
* Missing values
* Invalid values
* Product records
* Outlet records
* Date values
* Sales values
* Inventory values
* Relevant consistency constraints

Invalid or unsuitable data should not silently enter the forecasting pipeline.

---

# 32. Dataset Strategy

The project may use realistic synthetic retail data where suitable real-world data is unavailable or cannot be used.

The dataset should represent:

* Multiple outlets
* Multiple products
* Product categories
* Historical sales
* Inventory records
* Product-outlet relationships
* Different demand patterns

The synthetic dataset should be realistic enough to demonstrate:

* Trend
* Seasonality where appropriate
* Different outlet demand patterns
* Fast-moving products
* Slow-moving products
* Stockout scenarios
* Overstock scenarios

The dataset must support the entire forecasting and optimization workflow.

---

# 33. Real-Time Claim Removed

Do not describe the system as **real-time** unless actual live transactional integration is implemented.

Preferred terminology:

* Interactive
* Centralized
* Predictive
* Web-based
* Decision-support
* Data-driven

The project currently works with historical/imported data rather than guaranteed live POS transactions.

---

# 34. POS/ERP Integration Removed From Core Scope

Direct integration with commercial:

* POS systems
* ERP systems
* Supplier systems

is outside the core FYP scope.

The architecture should remain extensible enough that such integrations could be added later.

---

# 35. Automated Purchasing Removed

The system does not automatically:

* Create purchase orders
* Place supplier orders
* Purchase inventory
* Execute replenishment

It provides recommendations.

Human users remain responsible for approving real-world inventory actions.

---

# 36. Automated Transfer Execution Removed

The system identifies potential inter-outlet transfers but does not physically or digitally execute them.

It provides a recommendation only.

---

# 37. Out-of-Scope Features

The following are outside the core FYP scope:

* Direct commercial POS integration
* Automated supplier purchase orders
* Full warehouse management
* Automated financial accounting
* Real-time payment processing
* Automated physical stock movement
* Weather-based demand prediction
* Automatic promotion optimization
* Full enterprise multi-company ERP
* Fully automated purchasing
* Automatic execution of inter-outlet transfers

These can be future enhancements.

---

# 38. Technology Stack Finalized

## Frontend

* React
* TypeScript
* Vite
* TailwindCSS
* Suitable charting/visualization library

## Backend

* Python
* FastAPI
* REST APIs
* Pydantic

## Database

* PostgreSQL 15+
* SQLAlchemy 2.x ORM

## Authentication

* JWT (PyJWT)
* passlib / bcrypt for password hashing

## Data Processing

* pandas
* NumPy

## Statistical Forecasting

* statsmodels

## Machine Learning

* scikit-learn
* XGBoost

---

# 39. Architecture

The final architecture consists of:

1. Data Management & Validation
2. Data Preprocessing & Feature Preparation
3. Demand Forecasting
4. Forecast Evaluation
5. Inventory Optimization
6. Risk & Recommendation Engine
7. Backend API
8. Frontend Presentation
9. Inventory Intelligence Dashboard

The architecture should maintain separation between:

* UI
* API
* Business logic
* Forecasting
* Optimization
* Recommendation logic
* Data storage

---

# 40. Backend Architecture

FastAPI should act as the communication layer between the frontend and the underlying system components.

The backend should expose appropriate APIs for:

* Dashboard data
* Inventory
* Products
* Outlets
* Forecasts
* Forecast evaluation
* Inventory calculations
* Recommendations
* Transfer opportunities

Business logic should not be embedded directly inside React components.

---

# 41. Frontend Architecture

React + TypeScript should provide:

* Dashboard
* Inventory table
* Product details
* Outlet details
* Forecast visualizations
* Inventory health visualization
* Demand heatmap
* Recommendations
* Transfer opportunities
* Global filtering

The frontend should primarily handle:

* Presentation
* User interaction
* API communication
* Client-side state where required

Forecasting and optimization calculations should remain on the backend.

---

# 42. Database/Data Model

Persistent data is stored in **PostgreSQL** using **SQLAlchemy** as the ORM/data-access layer.

The final data model should logically support entities for:

* Outlets
* Products
* Product categories
* Historical sales
* Inventory records
* Forecast results
* Forecast evaluation results
* Inventory calculations
* Recommendations
* Transfer opportunities

Product-outlet relationships are particularly important.

---

# 43. Authentication & Role-Based Access

The system includes role-based authentication with three roles.

### Administrator

Manage users, outlets, products, and suppliers; view all analytics; configure system parameters.

### Outlet Manager

View assigned outlet, inventory, forecasts, and recommendations; approve or act on recommendations.

### Analyst

View forecasts, compare models, view evaluation results, and run experiments.

Authentication uses JWT-based tokens. Passwords must never be stored in plaintext.

---

# 44. Inventory Policy Simulation

The system includes an inventory policy simulator to quantitatively compare inventory policies.

Compare at minimum three policies:

## Policy A — Conventional Baseline

Fixed reorder point + fixed safety stock.

## Policy B — Moving Average Policy

30-day average demand estimate.

## Policy C — StockMind Policy

Forecast + automated model selection + demand correction + safety stock + reorder point + inventory optimization.

The simulator replays historical demand and measures for every policy:

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

# 45. Ablation Experiments

The system includes controlled ablation experiments that isolate the contribution of individual components:

### Experiment 1 — Forecasting without demand correction vs with demand correction
### Experiment 2 — Single forecasting model vs automated model selection
### Experiment 3 — Traditional inventory policy vs StockMind inventory policy
### Experiment 4 — No transfer optimization vs transfer optimization

Experiment results are stored and displayed in the Experiments page.

---

# 46. Development Methodology

The project uses an iterative Agile-inspired development process.

The development cycle is:

1. Planning
2. Requirements refinement
3. System design
4. Implementation
5. Unit/module testing
6. Integration
7. Review
8. Refinement

Git should be used for version control.

---

# 47. Testing Expansion

Testing is now formally defined.

The final project should include:

### Unit Testing

Test:

* Demand calculations
* Sales velocity
* Safety stock
* Reorder point
* EOQ
* Days of stock
* Recommendation logic
* Transfer logic

### API Testing

Test:

* REST endpoints
* Request validation
* Response structures
* Error handling

### Integration Testing

Test:

* Frontend ↔ Backend
* Forecasting ↔ Backend
* Optimization ↔ Backend
* Recommendation ↔ Backend
* Complete data pipeline

### Forecasting Evaluation

Evaluate:

* SMA
* Holt-Winters
* ARIMA
* XGBoost

using held-out data.

### UI/System Testing

Test:

* Dashboard
* Filters
* Tables
* Product views
* Outlet views
* Forecast charts
* Recommendations
* Transfer opportunities

### Data Validation Testing

Test:

* Missing data
* Invalid data
* Inconsistent data
* Unsuitable data

### Performance Testing

Evaluate:

* Dashboard response time
* API response time
* Forecast execution time
* System behavior under intended prototype workload

### Regression Testing

Ensure that new changes do not break previously working functionality.

### User Acceptance Testing

Evaluate the system from the perspective of intended users.

---

# 48. Forecasting Evaluation Philosophy

Do not hard-code the assumption:

> XGBoost is best.

or:

> ARIMA is best.

or:

> Holt-Winters is best.

The project should experimentally determine which approach performs better for different demand series.

The final report should discuss the observed results.

This is important for the academic credibility of the AI component.

---

# 49. FYP Contribution

The final contribution of StockMind AI consists of:

### 1. Intelligent Demand Forecasting

Forecast future product demand from historical retail sales.

### 2. Multi-Model Forecasting

Implement and compare:

* SMA
* Holt-Winters
* ARIMA
* XGBoost

### 3. Forecast Evaluation

Evaluate forecasting performance using appropriate metrics.

### 4. Automated Model Selection

Automatically select the best-performing approach per product-outlet combination based on observed forecasting performance.

### 5. Inventory Optimization

Calculate:

* Safety stock
* Reorder point
* EOQ where applicable
* Replenishment quantities
* Days of stock

### 6. Risk Detection

Detect:

* Stockouts
* Potential stockouts
* Overstock
* Low-stock conditions

### 7. Recommendation Engine

Generate prioritized inventory recommendations.

### 8. Inter-Outlet Transfer Intelligence

Identify opportunities to redistribute stock between outlets.

### 9. Multi-Outlet Analytics

Analyze company-wide and outlet-specific inventory conditions.

### 10. Decision-Support Dashboard

Present the complete inventory intelligence workflow through an interactive web application.

---

# 50. Final Product Positioning

StockMind AI should be presented as:

> **An intelligent inventory decision-support platform for multi-outlet retail businesses that combines demand forecasting, forecasting evaluation, inventory optimization, risk detection, and actionable recommendations in a centralized web application.**

It should NOT be presented merely as:

* A forecasting system
* An inventory dashboard
* An ERP
* A POS system
* An automated purchasing system

It is specifically an:

> **AI-powered predictive inventory intelligence and decision-support system.**

---

# 51. Final Development Priority

Implementation should generally proceed in the following order:

## Phase 1 — Understand Existing Code

* Inspect the existing repository
* Identify reusable/prototype components and hardcoded values
* Produce a migration plan

## Phase 2 — Backend Foundation

* PostgreSQL database setup
* SQLAlchemy ORM models and migrations
* Configuration management
* JWT authentication with role-based access
* Repository/service layer architecture

## Phase 3 — Data Pipeline

* Improved synthetic data generator
* Data ingestion and validation
* Data preprocessing
* Stockout detection and demand correction
* External dataset adapter

## Phase 4 — ML Pipeline

* SMA, Holt-Winters, ARIMA/SARIMA, XGBoost
* Feature engineering
* Chronological time-series validation
* Evaluation metrics (RMSE, MAE, MAPE, SMAPE, Bias)
* Automated model selection per product-outlet combination
* Forecast persistence and caching

## Phase 5 — Inventory Engine

* Average demand and sales velocity
* Safety stock
* Reorder point
* EOQ
* Target stock
* Days of stock
* Replenishment quantity
* Stockout detection
* Overstock detection
* Stockout/overstock risk classification

## Phase 6 — Multi-Outlet Optimization

* Surplus/deficit detection
* Transfer opportunity identification
* Transfer quantity optimization
* Transfer recommendation generation

## Phase 7 — Simulation

* Inventory policy simulator
* Baseline, moving average, and StockMind policies
* Historical demand replay
* Cost and service level metrics
* Ablation experiments

## Phase 8 — Frontend

* Connect existing frontend to the new backend
* Dashboard with dynamic KPIs
* Global filters
* Inventory table
* Product detail
* Outlet detail
* Forecast visualizations
* Inventory health
* Demand heatmap
* Recommendation interface
* Transfer interface

## Phase 9 — Testing

* Unit tests
* API tests
* Integration tests
* Forecast evaluation
* UI testing
* Data validation
* Performance
* Regression
* UAT

## Phase 10 — Evaluation

* Run all experiments
* Export metrics, charts, tables
* Generate model comparisons
* Generate inventory policy comparisons
* Document results for the FYP report

---

# 52. Important Implementation Rules

1. Do not remove any core FYP functionality without explicit approval.

2. Do not add major out-of-scope enterprise functionality unless specifically requested.

3. Do not claim that the system is real-time unless live transactional integration is actually implemented.

4. Do not claim that XGBoost, ARIMA, or any other model is always the best.

5. Do not call SMA, Holt-Winters, and ARIMA machine-learning algorithms.

6. Do not automatically execute purchases or transfers.

7. Do not invent missing inventory or cost parameters for EOQ.

8. Recommendations must have understandable supporting information wherever possible.

9. Forecasting must be evaluated using held-out data.

10. Product-outlet relationships must be preserved throughout the data pipeline.

11. Dashboard filters must consistently affect the relevant displayed data.

12. Forecasting and optimization logic must remain separated from the frontend.

13. Backend business logic must remain separated from API routing where practical.

14. The system should gracefully handle insufficient historical data.

15. Synthetic data should represent realistic retail behavior rather than random numbers only.

16. The final implementation must remain consistent with the approved FYP proposal.

---

# 53. Final Definition of Done

The StockMind AI FYP implementation should be considered complete when a user can:

1. Open the web application.
2. View company-wide inventory intelligence.
3. Select an individual outlet.
4. Filter by product/category/date/inventory status.
5. Examine historical sales.
6. View product demand behavior.
7. Generate future demand forecasts.
8. Compare SMA, Holt-Winters, ARIMA/SARIMA, and XGBoost performance.
9. View the forecasting evaluation results.
10. View inventory projections.
11. View days of stock remaining.
12. View safety stock.
13. View reorder point.
14. View EOQ where applicable.
15. View recommended replenishment quantity.
16. Identify potential stockouts.
17. Identify overstock conditions.
18. View prioritized recommendations.
19. Understand why a recommendation was generated.
20. Identify potential inter-outlet transfer opportunities.
21. View demand differences between outlets.
22. Explore product details.
23. Explore outlet details.
24. View demand heatmaps.
25. Interact with the complete system through the web interface.

The final product should demonstrate the complete pipeline:

**Data → Forecast → Evaluation → Optimization → Risk Detection → Recommendation → Decision Support**

This complete end-to-end workflow is the core objective of the StockMind AI FYP.
