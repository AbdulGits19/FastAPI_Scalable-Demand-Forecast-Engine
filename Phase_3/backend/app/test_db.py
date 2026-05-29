import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# 1. Load your .env file
load_dotenv()

# 2. Get the URL from .env
db_url = os.getenv("DATABASE_URL")

print(f"Connecting to: {db_url}")

# 3. Try to connect
try:
    engine = create_engine(db_url) # pyright: ignore[reportArgumentType]
    # The 'with' block ensures the connection closes even if it fails
    with engine.connect() as connection:
        # We run a dummy SQL command that just returns '1'
        result = connection.execute(text("SELECT 1"))
        print("✅ SUCCESS: MySQL is connected to your project!")
        
except Exception as e:
    print("❌ FAILURE: Could not connect to MySQL.")
    print(f"Error details: {e}")