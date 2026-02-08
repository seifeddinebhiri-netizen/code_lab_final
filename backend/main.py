from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector
from typing import List, Optional

app = FastAPI()

# Database Configuration
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "oba2005lala!",
    "database": "boursagpt"
}

def get_db_connection():
    try:
        conn = mysql.connector.connect(**db_config)
        return conn
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Erreur de connexion DB: {err}") 
# CORS Middleware for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models for Request Bodies
# ... (Previous imports remain, ensure Optional is imported)

# Pydantic Models
class SignupRequest(BaseModel):
    email: str
    password: str
    full_name: str

class UpdateRoleRequest(BaseModel):
    role: str

class UpdateRiskProfileRequest(BaseModel):
    risk_profile: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: Optional[str] = None
    risk_profile: Optional[str] = None
    capital: float
class LoginRequest(BaseModel):
    email: str
    password: str

class PortfolioItem(BaseModel):
    ticker: str
    company_name: str
    quantity: float
    buy_price: float
    current_price: float

class Alert(BaseModel):
    id: int
    symbol: str
    message: str
    severity: str
    timestamp: str

class AddFundsRequest(BaseModel):
    amount: float

@app.post("/users/{user_id}/add-funds")
def add_funds(user_id: int, request: AddFundsRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        query = "UPDATE users SET capital = capital + %s WHERE id = %s"
        cursor.execute(query, (request.amount, user_id))
        conn.commit()
        return {"message": f"{request.amount} TND ajoutés avec succès", "success": True}
    finally:
        cursor.close()
        conn.close()
# ... (Previous PortfolioItem and Alert models remain)

# --- API Endpoints ---

# 1. Signup (POST /auth/signup)
@app.post("/auth/signup", response_model=UserResponse)
def signup(request: SignupRequest):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Check if user exists
        check_query = "SELECT * FROM users WHERE email = %s"
        cursor.execute(check_query, (request.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")

        # Insert new user with capital = 0
        insert_query = """
            INSERT INTO users (email, password, full_name, capital, role, risk_profile) 
            VALUES (%s, %s, %s, 0, NULL, NULL)
        """
        cursor.execute(insert_query, (request.email, request.password, request.full_name))
        conn.commit()
        user_id = cursor.lastrowid
        
        return {
            "id": user_id,
            "full_name": request.full_name,
            "email": request.email,
            "role": None,
            "risk_profile": None,
            "capital": 0.0
        }
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        cursor.close()
        conn.close()

# 2. Update Role (PATCH /users/{user_id}/role)
@app.patch("/users/{user_id}/role")
def update_role(user_id: int, request: UpdateRoleRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        query = "UPDATE users SET role = %s WHERE id = %s"
        cursor.execute(query, (request.role, user_id))
        conn.commit()
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")
            
        return {"message": "Role updated successfully", "success": True}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        cursor.close()
        conn.close()

# 3. Update Risk Profile (PATCH /users/{user_id}/risk-profile)
@app.patch("/users/{user_id}/risk-profile")
def update_risk_profile(user_id: int, request: UpdateRiskProfileRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        query = "UPDATE users SET risk_profile = %s WHERE id = %s"
        cursor.execute(query, (request.risk_profile, user_id))
        conn.commit()
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")
            
        return {"message": "Risk profile updated successfully", "success": True}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        cursor.close()
        conn.close()

# 1. Login (POST /login) - Updated to include id in response if not present
@app.post("/login", response_model=UserResponse)
def login(request: LoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = "SELECT id, full_name, email, role, risk_profile, capital FROM users WHERE email = %s AND password = %s"
        cursor.execute(query, (request.email, request.password))
        user = cursor.fetchone()
        
        if user:
            return user
        else:
            raise HTTPException(status_code=401, detail="Invalid email or password")
    finally:
        cursor.close()
        conn.close()

# ... (Keep get_portfolio and get_alerts as is, just ensure they are below)

# 3. Portfolio (GET /portfolio/{user_id})
@app.get("/portfolio/{user_id}", response_model=List[PortfolioItem])
def get_portfolio(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Assuming table names: user_portfolio (user_id, stock_id, quantity, buy_price) and stocks (id, ticker, company_name, current_price)
        query = """
            SELECT 
                s.ticker, 
                s.company_name, 
                up.quantity, 
                up.buy_price, 
                s.current_price
            FROM user_portfolio up
            JOIN stocks s ON up.stock_id = s.id
            WHERE up.user_id = %s
        """
        cursor.execute(query, (user_id,))
        portfolio = cursor.fetchall()
        return portfolio
    finally:
        cursor.close()
        conn.close()

# 4. Market Surveillance (GET /alerts)
@app.get("/alerts", response_model=List[Alert])
def get_alerts():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Assuming table name: fraud_alerts (id, symbol, message, severity, created_at)
        query = "SELECT id, symbol, message, severity, created_at as timestamp FROM fraud_alerts ORDER BY created_at DESC LIMIT 20"
        cursor.execute(query)
        alerts = cursor.fetchall()
        # Ensure timestamp is formatted as string if needed, depending on how MySQL returns it vs Pydantic
        for alert in alerts:
            if hasattr(alert['timestamp'], 'strftime'):
                 alert['timestamp'] = alert['timestamp'].strftime("%Y-%m-%d %H:%M:%S")
            else:
                 alert['timestamp'] = str(alert['timestamp'])
        return alerts
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
