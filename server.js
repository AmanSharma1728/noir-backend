/**
 * NOIR E-COMMERCE BACKEND
 * Environment: Node.js + Express
 * Standard: REST API
 */

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

// ==========================================
// 1. CONFIGURATION & CONSTANTS
// ==========================================
const CONFIG = {
  PORT: 3000,
  JWT_SECRET: "noir_enterprise_secret_key_v1", // In production, use process.env.JWT_SECRET
  JWT_EXPIRY: "2h",
  CORS_ORIGIN: "*", // Update this to 'http://localhost:4200' for strict security
};

const app = express();

// ==========================================
// 2. MIDDLEWARE LAYER
// ==========================================

// Global Middleware
app.use(cors({ origin: CONFIG.CORS_ORIGIN }));
app.use(express.json());

// Request Logger (Audit Trail)
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(
    `[${timestamp}] ${req.method} ${req.originalUrl} | IP: ${req.ip}`
  );
  next();
};
app.use(requestLogger);

// Authentication Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({
      status: "error",
      code: "UNAUTHORIZED",
      message: "Access token is missing or invalid.",
    });
  }

  jwt.verify(token, CONFIG.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        status: "error",
        code: "FORBIDDEN",
        message: "Token has expired or is invalid.",
      });
    }
    req.user = user;
    next();
  });
};

// ==========================================
// 3. DATA LAYER (Mock Database)
// ==========================================

// In-Memory Store
const DB = {
  users: [],
  carts: {}, // Map<UserEmail, CartItem[]>
  products: [
    {
      id: 101,
      name: "Noir Oversized Trench",
      price: 120.0,
      category: "jackets",
      stock: 15,
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 102,
      name: "Essential White Tee",
      price: 25.0,
      category: "tops",
      stock: 50,
      rating: 4.5,
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 103,
      name: "Slim Fit Charcoal Jeans",
      price: 60.0,
      category: "bottoms",
      stock: 30,
      rating: 4.2,
      image:
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 104,
      name: "Urban Leather Tote",
      price: 85.0,
      category: "accessories",
      stock: 10,
      rating: 4.7,
      image:
        "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 105,
      name: "Monochrome Sneakers",
      price: 95.0,
      category: "shoes",
      stock: 20,
      rating: 4.6,
      image:
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 106,
      name: "Woolen Turtle Neck",
      price: 55.0,
      category: "tops",
      stock: 25,
      rating: 4.4,
      image:
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 107,
      name: "Pleated Black Trousers",
      price: 45.0,
      category: "bottoms",
      stock: 35,
      rating: 4.3,
      image:
        "https://images.unsplash.com/photo-1506629082955-511b1aa002c4?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 108,
      name: "Minimalist Silver Watch",
      price: 150.0,
      category: "accessories",
      stock: 5,
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 109,
      name: "Bomber Jacket Olive",
      price: 90.0,
      category: "jackets",
      stock: 12,
      rating: 4.5,
      image:
        "https://images.unsplash.com/photo-1559551409-dadc959f76b8?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 110,
      name: "Striped Linen Shirt",
      price: 35.0,
      category: "tops",
      stock: 40,
      rating: 4.1,
      image:
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 111,
      name: "Denim Trucker Jacket",
      price: 75.0,
      category: "jackets",
      stock: 18,
      rating: 4.6,
      image:
        "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 112,
      name: "Everyday Backpack",
      price: 50.0,
      category: "accessories",
      stock: 22,
      rating: 4.4,
      image:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    },
  ],
};

// ==========================================
// 4. CONTROLLER LOGIC (Business Logic)
// ==========================================

const AuthController = {
  login: (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "error", message: "Email and password are required." });
    }

    // Admin Bypass (For Development/Demo)
    if (email === "admin@noir.com" && password === "admin123") {
      const token = jwt.sign({ email, role: "admin" }, CONFIG.JWT_SECRET, {
        expiresIn: CONFIG.JWT_EXPIRY,
      });
      return res.json({
        status: "success",
        data: { token, user: { email, name: "Admin User", role: "admin" } },
      });
    }

    // Standard User Check
    const user = DB.users.find(
      (u) => u.email === email && u.password === password
    );
    if (!user) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { email: user.email, role: "user" },
      CONFIG.JWT_SECRET,
      { expiresIn: CONFIG.JWT_EXPIRY }
    );
    res.json({
      status: "success",
      data: {
        token,
        user: { email: user.email, name: user.name, role: "user" },
      },
    });
  },

  signup: (req, res) => {
    const { email, password, name } = req.body;

    if (DB.users.find((u) => u.email === email)) {
      return res
        .status(409)
        .json({ status: "error", message: "User already exists." });
    }

    const newUser = { id: Date.now(), email, password, name, role: "user" };
    DB.users.push(newUser);

    res
      .status(201)
      .json({ status: "success", message: "User registered successfully." });
  },
};

const ProductController = {
  getAll: (req, res) => {
    try {
      let { page = 1, limit = 8, category, sort, min, max, q } = req.query;
      let result = [...DB.products];

      // 1. Search
      if (q) {
        const term = q.toLowerCase();
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes(term) || p.category.includes(term)
        );
      }

      // 2. Filter by Category
      if (category && category !== "all") {
        result = result.filter((p) => p.category === category);
      }

      // 3. Filter by Price Range
      if (min) result = result.filter((p) => p.price >= Number(min));
      if (max) result = result.filter((p) => p.price <= Number(max));

      // 4. Sorting
      if (sort === "price_asc") result.sort((a, b) => a.price - b.price);
      else if (sort === "price_desc") result.sort((a, b) => b.price - a.price);
      else if (sort === "newest") result.sort((a, b) => b.id - a.id); // Assuming higher ID = newer

      // 5. Pagination
      const totalItems = result.length;
      const totalPages = Math.ceil(totalItems / limit);
      const startIndex = (Number(page) - 1) * Number(limit);
      const paginatedData = result.slice(
        startIndex,
        startIndex + Number(limit)
      );

      // Simulated Network Latency (200ms)
      setTimeout(() => {
        res.json({
          status: "success",
          data: {
            products: paginatedData,
            pagination: {
              totalItems,
              totalPages,
              currentPage: Number(page),
              limit: Number(limit),
            },
          },
        });
      }, 200);
    } catch (error) {
      res
        .status(500)
        .json({ status: "error", message: "Internal Server Error" });
    }
  },

  getOne: (req, res) => {
    const product = DB.products.find((p) => p.id === Number(req.params.id));
    if (!product) {
      return res
        .status(404)
        .json({ status: "error", message: "Product not found." });
    }
    res.json({ status: "success", data: product });
  },
};

const CartController = {
  getCart: (req, res) => {
    const userId = req.user.email;
    const cart = DB.carts[userId] || [];

    // Calculate totals
    const subtotal = cart.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );

    res.json({
      status: "success",
      data: {
        items: cart,
        summary: { subtotal, tax: subtotal * 0.1, total: subtotal * 1.1 },
      },
    });
  },

  addToCart: (req, res) => {
    const userId = req.user.email;
    const { productId, quantity = 1 } = req.body;

    const product = DB.products.find((p) => p.id === productId);
    if (!product)
      return res
        .status(404)
        .json({ status: "error", message: "Product invalid." });

    if (!DB.carts[userId]) DB.carts[userId] = [];

    const existingItem = DB.carts[userId].find(
      (item) => item.product.id === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      DB.carts[userId].push({ product, quantity });
    }

    res.json({ status: "success", message: "Item added to cart." });
  },
};

const AdminController = {
  verifySeller: (req, res) => {
    // In a real app, this would validate req.body against a strict schema (e.g., Joi/Zod)
    const { businessName, taxId, address } = req.body;

    if (!businessName || !taxId) {
      return res
        .status(400)
        .json({ status: "error", message: "Missing business details." });
    }

    console.log(
      `[ADMIN ACTION] Seller Verification Request: ${businessName} (${taxId})`
    );

    res.json({
      status: "success",
      message:
        "Application submitted successfully. Compliance team will review within 24-48 hours.",
    });
  },
};

// ==========================================
// 5. ROUTING LAYER
// ==========================================

// Auth Routes
app.post("/api/auth/login", AuthController.login);
app.post("/api/auth/signup", AuthController.signup);

// Product Routes (Public)
app.get("/api/products", ProductController.getAll);
app.get("/api/products/:id", ProductController.getOne);

// Cart Routes (Protected)
app.get("/api/cart", verifyToken, CartController.getCart);
app.post("/api/cart", verifyToken, CartController.addToCart);

// Admin Routes (Protected + Role Check simulated)
app.post("/api/admin/seller-check", verifyToken, AdminController.verifySeller);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Endpoint not found." });
});

// ==========================================
// 6. SERVER START
// ==========================================
app.listen(CONFIG.PORT, () => {
  console.log(`\n---------------------------------------------------------`);
  console.log(` NOIR SERVER STARTED`);
  console.log(` Environment: Development (Simulated Production)`);
  console.log(` URL: http://localhost:${CONFIG.PORT}`);
  console.log(`---------------------------------------------------------\n`);
});
