from fastapi import FastAPI
from app.core.database import engine, Base
from app.routers import auth, datasets, forecast, analytics, reports  
from fastapi.middleware.cors import CORSMiddleware

# 1. Database Initialization
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Driven Demand Forecasting & Prediction Web App")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Including Routers
app.include_router(auth.router)
app.include_router(datasets.router)
app.include_router(forecast.router)  
app.include_router(analytics.router)
app.include_router(reports.router) 


@app.get("/")
def read_root():
    return {"message": "Demand Forecasting API is Live!"}