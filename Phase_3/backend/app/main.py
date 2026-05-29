import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.database import engine, Base, get_db
from app.models.audit import AuditHistory  # Phase 3 Telemetry Data Model

# --- CORE ROUTER IMPORTS ---
from app.routers import auth, datasets, forecast, analytics, reports, notifications, admin, monitoring

# 1. Initialize Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Driven Demand Forecasting & Prediction Web App")

# 2. CORS Mapping
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 🔥 3. IP-AWARE SYSTEM METRICS INTERCEPTOR ---
@app.middleware("http")
async def audit_traffic_interceptor(request: Request, call_next):
    """
    Centralized Telemetry Interceptor: Captures request telemetry, execution speed, 
    and client network source IP coordinates to satisfy MySQL constraints.
    """
    start_time = time.time()
    
    # Process the route pipeline down to routers
    response = await call_next(request)
    
    execution_time_ms = round((time.time() - start_time) * 1000, 2)
    path = str(request.url.path)
    method = str(request.method)
    status_code = int(response.status_code)
    
    # 🌐 EXTRACT SOURCE IP: Fallback safely to localhost if connection attributes are missing
    client_ip = "127.0.0.1"
    if request.client and request.client.host:
        client_ip = str(request.client.host)
    
    # Skip noisy core interface asset files or docs paths
    if not path.startswith(("/docs", "/openapi.json", "/favicon.ico")):
        db: Session = Session(bind=engine)
        try:
            # Map parameters safely to your database model attributes
            log_entry = AuditHistory(
                endpoint_url=path,
                request_method=method,
                execution_time_ms=float(execution_time_ms),
                # 🔥 CRITICAL FIX: Bind the resolved network IP to your required column field!
                source_ip=client_ip,
                user_id=None
            )
            
            # Dynamic Column Backup Check for Status parameter
            if hasattr(AuditHistory, "status"):
                setattr(log_entry, "status", status_code)
            elif hasattr(AuditHistory, "status_code"):
                setattr(log_entry, "status_code", status_code)
            
            db.add(log_entry)
            db.commit()  
            print(f"📡 [AUDIT LOG SUCCESS] -> {method} {path} | IP: {client_ip} | Speed: {execution_time_ms}ms")
            
        except Exception as err:
            db.rollback()
            print(f"❌ [AUDIT LOG ERROR] Internal Database Rejection: {str(err)}")
        finally:
            db.close()  
            
    return response


# 4. Core Router Mounting
app.include_router(auth.router)
app.include_router(datasets.router)
app.include_router(forecast.router)   
app.include_router(analytics.router)
app.include_router(reports.router)
app.include_router(notifications.router)
app.include_router(admin.router)
app.include_router(monitoring.router)