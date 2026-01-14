const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const hpp = require("hpp");

const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const { globalErrorHandler } = require("./middleware/errorHandler");
const AppError = require("./utils/appError");

const app = express();

// 1. GLOBAL MIDDLEWARES
// Set Security HTTP headers
app.use(helmet());

// Development logging
app.use(morgan("dev"));

// Limit requests from same API (Brute force protection)
const limiter = rateLimit({
  max: 100, // 100 requests per hour
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// CORS
app.use(cors());

// 2. ROUTES
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);

// 404 Handler for undefined routes
app.all(/(.*)/, (req, res, next) => {
  // <--- FIXED: Regex to match any path
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 3. GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

// 4. SERVER START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
  ################################################
  🛡️  Server listening on port: ${PORT} 🛡️
  ################################################
  `);
});
