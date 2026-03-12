import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("trustline.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    password TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    min_investment REAL,
    expected_return REAL,
    duration_months INTEGER,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT,
    path TEXT,
    type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed Admin if not exists
const adminExists = db.prepare("SELECT * FROM admin WHERE email = ?").get("admin@trustline.com");
if (!adminExists) {
  db.prepare("INSERT INTO admin (email, password) VALUES (?, ?)").run("admin@trustline.com", "admin123");
}

// Seed some initial products if empty
const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
if (productCount.count === 0) {
  const initialProducts = [
    { title: "Fixed Income Fund", description: "Stable returns with low risk. Ideal for conservative investors.", min_investment: 1000, expected_return: 8.5, duration_months: 12, image_url: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800" },
    { title: "Equity Growth Fund", description: "High growth potential by investing in top-performing stocks.", min_investment: 5000, expected_return: 15.0, duration_months: 36, image_url: "https://images.unsplash.com/photo-1611974708602-ac524856505d?auto=format&fit=crop&q=80&w=800" },
    { title: "Real Estate REIT", description: "Diversified portfolio of commercial and residential properties.", min_investment: 10000, expected_return: 12.0, duration_months: 24, image_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800" }
  ];
  const insertProduct = db.prepare("INSERT INTO products (title, description, min_investment, expected_return, duration_months, image_url) VALUES (?, ?, ?, ?, ?, ?)");
  initialProducts.forEach(p => insertProduct.run(p.title, p.description, p.min_investment, p.expected_return, p.duration_months, p.image_url));
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
  app.use("/uploads", express.static(uploadsDir));

  // --- API ROUTES ---

  // Auth: User Register
  app.post("/api/auth/register", (req, res) => {
    const { name, email, phone, password } = req.body;
    try {
      const result = db.prepare("INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)").run(name, email, phone, password);
      res.json({ success: true, userId: result.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Auth: User Login
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    if (user) {
      res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    } else {
      res.status(401).json({ success: false, error: "Invalid credentials" });
    }
  });

  // Auth: Admin Login
  app.post("/api/admin/login", (req, res) => {
    const { email, password } = req.body;
    const admin = db.prepare("SELECT * FROM admin WHERE email = ? AND password = ?").get(email, password) as any;
    if (admin) {
      res.json({ success: true, admin: { id: admin.id, email: admin.email } });
    } else {
      res.status(401).json({ success: false, error: "Invalid admin credentials" });
    }
  });

  // Products: Get All
  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products ORDER BY created_at DESC").all();
    res.json(products);
  });

  // Products: Add (Admin)
  app.post("/api/admin/products", (req, res) => {
    const { title, description, min_investment, expected_return, duration_months, image_url } = req.body;
    try {
      const result = db.prepare("INSERT INTO products (title, description, min_investment, expected_return, duration_months, image_url) VALUES (?, ?, ?, ?, ?, ?)").run(title, description, min_investment, expected_return, duration_months, image_url);
      res.json({ success: true, productId: result.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Products: Delete (Admin)
  app.delete("/api/admin/products/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM products WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Users: Get All (Admin)
  app.get("/api/admin/users", (req, res) => {
    const users = db.prepare("SELECT id, name, email, phone, created_at FROM users ORDER BY created_at DESC").all();
    res.json(users);
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
