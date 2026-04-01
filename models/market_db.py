import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'app.db')

class MarketDB:
    def __init__(self):
        self.init_db()

    def add_user(self, name, email, role, password):
        with self.get_connection() as conn:
            conn.execute("INSERT INTO users (name, email, role, password) VALUES (?, ?, ?, ?)", 
                         (name, email, role, password))
            conn.commit()

    def get_user_by_email(self, email):
        with self.get_connection() as conn:
            user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
            return dict(user) if user else None

    def get_all_users(self):
        with self.get_connection() as conn:
            users = conn.execute("SELECT user_id, name, email, role FROM users").fetchall()
            return [dict(u) for u in users]

    def get_pending_products(self):
        with self.get_connection() as conn:
            # Join with users to get farmer name
            products = conn.execute('''
                SELECT p.*, u.name as farmer_name 
                FROM products p 
                JOIN users u ON p.farmer_id = u.user_id 
                WHERE p.status = 'pending'
            ''').fetchall()
            return [dict(p) for p in products]

    def update_product_status(self, product_id, status):
        with self.get_connection() as conn:
            conn.execute("UPDATE products SET status = ? WHERE product_id = ?", (status, product_id))
            conn.commit()

    def get_market_stats(self):
        with self.get_connection() as conn:
            gross_revenue = conn.execute("SELECT SUM(total_amount) FROM orders").fetchone()[0] or 0.0
            total_orders = conn.execute("SELECT COUNT(*) FROM orders").fetchone()[0] or 0
            # Rough approximation of avg order value
            avg_order = gross_revenue / total_orders if total_orders > 0 else 0.0
            
            # Subscriptions - placeholder, let's treat each farmer as having a 'subscription' for now
            total_farmers = conn.execute("SELECT COUNT(*) FROM users WHERE role = 'farmer'").fetchone()[0] or 0
            
            return {
                'gross_revenue': round(gross_revenue, 2),
                'total_orders': total_orders,
                'avg_order': round(avg_order, 2),
                'total_farmers': total_farmers
            }

    def get_connection(self):
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    def init_db(self):
        with self.get_connection() as conn:
            # Users Table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    role TEXT NOT NULL, -- farmer, customer, admin
                    phone TEXT, -- Optional now
                    password TEXT NOT NULL
                )
            ''')
            # Products Table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS products (
                    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    farmer_id INTEGER,
                    product_name TEXT NOT NULL,
                    price REAL NOT NULL,
                    quantity INTEGER NOT NULL,
                    description TEXT,
                    status TEXT DEFAULT 'approved', -- pending, approved, removed
                    FOREIGN KEY (farmer_id) REFERENCES users (user_id)
                )
            ''')
            # Orders Table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS orders (
                    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    customer_id INTEGER,
                    total_amount REAL NOT NULL,
                    status TEXT DEFAULT 'pending',
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (customer_id) REFERENCES users (user_id)
                )
            ''')
            # Order Items Table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS order_items (
                    item_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    order_id INTEGER,
                    product_id INTEGER,
                    price REAL NOT NULL,
                    quantity INTEGER NOT NULL,
                    FOREIGN KEY (order_id) REFERENCES orders (order_id),
                    FOREIGN KEY (product_id) REFERENCES products (product_id)
                )
            ''')
            
            # Initial Admin (password: admin123)
            conn.execute("INSERT OR IGNORE INTO users (name, email, role, password) VALUES (?, ?, ?, ?)", 
                         ('Super Admin', 'admin@terralogic.pro', 'admin', 'admin123'))
            conn.commit()

# Singleton instance
db = MarketDB()
