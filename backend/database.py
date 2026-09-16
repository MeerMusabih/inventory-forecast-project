import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "data" / "app.db"

def get_conn():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    c = conn.cursor()
    c.executescript("""
        CREATE TABLE IF NOT EXISTS forecast_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            period INTEGER NOT NULL,
            item_no TEXT NOT NULL,
            item_name TEXT,
            branch TEXT,
            quantity REAL DEFAULT 0,
            date TEXT,
            uploaded_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS actual_transfers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            branch_code TEXT,
            item_code TEXT NOT NULL,
            item_name TEXT,
            quantity REAL DEFAULT 0,
            date TEXT,
            uploaded_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS mrp_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT,
            product_name TEXT,
            mrp_monthly REAL DEFAULT 0,
            unit TEXT,
            lead_time_month REAL DEFAULT 1,
            sigma_demand REAL DEFAULT 0,
            sigma_lead_time REAL DEFAULT 0,
            service_level REAL DEFAULT 95,
            unit_price REAL DEFAULT 0,
            ordering_cost REAL DEFAULT 0,
            holding_cost REAL DEFAULT 0,
            stock_on_hand REAL DEFAULT 0,
            moq REAL DEFAULT 0,
            uploaded_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS accurate_forecast (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_no TEXT NOT NULL,
            item_name TEXT,
            branch TEXT,
            quantity REAL DEFAULT 0,
            date TEXT,
            uploaded_at TEXT DEFAULT (datetime('now'))
        );
    """)
    conn.commit()
    conn.close()
