git branch -M main```markdown
# Forecastly — Enterprise Predictive Analytics Ecosystem (Phase 2 Release)

Forecastly is a decoupled, asynchronous demand intelligence architecture engineered to parse multi-row supply chain records, process real-time time-series regression analysis, and stream multi-format data insight matrices over long-horizon modeling windows. 

## 📌 Phase 2 Evolutionary Scope
The Milestone 2 framework upgrades the application from a baseline engineering prototype into an active data-driven environment. Phase 2 implements a persistent relational data tier, replaces static array endpoints with active query filters, handles transaction commits to disk safely, and runs complex machine learning processes inside isolated threads to prevent ASGI pipeline bottlenecks.

---

## 🏗️ Deep-Dive Backend Architecture & Ingestion Design

Forecastly decouples intensive data analytics from user interaction loops using a modular three-tier layout:

1. Asynchronous Gateway Controller (FastAPI & Uvicorn)
   - Built entirely around non-blocking event loops, handling concurrent platform request queries with ultra-low latency.
   - Implements dependency injection chains to enforce state verification, token processing, and database session connection allocations on every route call.

2. Relational Persistence Layer (SQLAlchemy ORM & MySQL)
   - Moves completely away from volatile Phase 1 runtime memory lists.
   - Utilizes persistent table models mapping structural records (SalesData, ForecastHistory, Notification) into a local MySQL instance.
   - Enforces strict transactional integrity, using explicit commit blocks to write records safely before downstream fetch calls look for the data.

3. Parallelized Predictive Analytics Engine
   - Isolates processing tasks inside dedicated algorithmic runtime sequences to protect the main web thread from blocking.
   - Uses Pandas dataframes and NumPy matrices to clean and structure historical data arrays instantly.
   - Evaluates statistical data by running historical parameters concurrently across a distributed matrix of models: XGBoost, Meta Prophet, and Multivariate Regressions.

---

## 📋 Comprehensive Progress Ledger: Phase 1 vs. Phase 2

| Operational Layer | Phase 1 Engineering Baseline | Phase 2 Production Upgrades |
| :--- | :--- | :--- |
| **Data Persistence** | Short-lived, volatile memory lists | Persistent MySQL relational table tracking via SQLAlchemy |
| **Ingestion Pipeline** | Hardcoded code array data injections | Streamed multipart form data uploads (`.csv`) with automated storage |
| **Predictive Execution** | Fixed pre-calculated linear data blocks | Real-time prediction runs over custom 7, 15, or 30-day horizons |
| **Cross-Validation** | Static visual text representations | Automatic validation leaderboard computing MAPE, MAE, and RMSE |
| **Document Streaming** | Simple plain-text data dumps | True high-fidelity binary PDF report generation via ReportLab |
| **Sizing Optimization** | Static pixel margins requiring browser zoom | 100% fluid responsive utility grids optimized for 1080p display views |

---

## 📡 Exhaustive REST API Endpoint Catalog

All application communication paths cross this secure REST gateway network layer:

### 🔒 Core Authentication Router
* **POST** `/auth/login`
  - Body Payload: Form-encoded `username` and `password`.
  - Process: Validates user identifiers and returns a cryptographically signed JWT bearer session token.

### 💾 Dataset Catalog Router
* **GET** `/datasets/list`
  - Query Parameters: None.
  - Process: Pulls from the persistence catalog to return string arrays of all active tables.
* **POST** `/datasets/upload`
  - Body Payload: Multipart `file` (`.csv`).
  - Process: Streams raw spreadsheet input records, maps columns into structural model tables, and commits the records straight to MySQL.

### 🤖 Predictive Analytics & Pipeline Router
* **GET** `/forecast/{product_name}`
  - URL Arguments: `product_name` (str).
  - Query Parameters: `days` (int, 1-30 limit), `model_type` (str: linear/multivariate/xgboost/prophet).
  - Process: Fetches row history, evaluates trends, builds predictions, logs an entry in ForecastHistory, and returns the projection arrays.
* **GET** `/forecast/compare`
  - Query Parameters: `product_name` (str).
  - Process: Evaluates historical row metrics across all algorithms to output map profiles containing error scores (MAPE, MAE, RMSE) and flags the structural winner.
* **GET** `/forecast/history`
  - Query Parameters: `page` (int), `size` (int).
  - Process: Returns paginated user logging streams to populate analytics log histories.

### 📑 Reporting & Document Storage Router
* **GET** `/reports/export/pdf-summary`
  - Query Parameters: `dataset_name` (str), `product_name` (str).
  - Process: Queries actual database rows, structures custom tabular text blocks, draws header charts using ReportLab, and streams a binary corporate PDF file straight to downloads.

---

## 📦 System Installation, Setup, and Ingestion

### 1. Database Initialization
Ensure your persistent MySQL host engine is active and listening on your local workspace port. Initialize the target relational catalog schemas:

```sql
CREATE DATABASE IF NOT EXISTS forecast_db;

```

### 2. Backend Environment Connection & Service Launch

Open a terminal in your project workspace directory, change directories to your backend folder, isolate a virtual Python environment, install your dependencies, and boot up your Uvicorn ASGI server:

```bash
cd backend
python -m venv .venv

# Activate the virtual environment shell:
# Windows Environment (PowerShell/CMD):
.venv\Scripts\activate
# macOS / Linux Systems Terminal:
source .venv/bin/activate

# Install core framework files and analytics packages:
pip install fastapi uvicorn sqlalchemy mysqlclient pandas xlsxwriter reportlab scikit-learn xgboost

```

Fire up your local server router layer on port `8000`:

```bash
uvicorn app.main:app --reload

```

### 3. Frontend Interface Compilation

Open a split terminal window, change directories to your frontend repository root folder, ingest the Node dependency modules, and launch your local client:

```bash
cd frontend
npm install
npm run dev

```

Open your browser framework environment line and head to `http://localhost:5173`.

---

## 🔒 Session Access and Onboarding Profile

To pass through the application gateway during evaluation passes, provide these pre-seeded access definitions at the prompt:

* **Authorized Profile Identifier:** abdul@aol.com
* **Session Verification Key:** password123

---

## 📂 Future Engineering Roadmap & Scalability Directives

Forecastly is completely decoupled to ensure seamless platform expansion:

1. **Compute Distribution:** Long-running model prediction runs can be safely moved off the main FastAPI event threads onto background worker pools via Celery and Redis message brokers.
2. **Persistence Scaling:** Database session pooling configurations are ready to split traffic across read-replicas, keeping lookups lightning-fast even during heavy CSV file write cycles.
3. **Algorithm Modularization:** The backend service loops separate model training parameters cleanly. This allows team members to introduce deep neural networks (e.g., PyTorch or custom transformers) without modifying any front-end React code contracts.

---
