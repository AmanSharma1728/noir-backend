const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const AppError = require("../utils/appError");

const USERS = []; // In-memory user store
const JWT_SECRET = "your-ultra-secure-secret-key-that-is-long";
const JWT_EXPIRES_IN = "2h";

const signToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

exports.signup = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    if (USERS.find((u) => u.email === email)) {
      return next(new AppError("User already exists", 400));
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = {
      id: Date.now(),
      name,
      email,
      password: hashedPassword,
      role: "user",
    };

    USERS.push(newUser);

    const token = signToken(newUser.id, newUser.role);

    res.status(201).json({
      status: "success",
      token,
      data: { user: { name: newUser.name, email: newUser.email } },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    const user = USERS.find((u) => u.email === email);

    // Verify Password
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
    }

    const token = signToken(user.id, user.role);

    res.status(200).json({
      status: "success",
      token,
      data: { user: { name: user.name, email: user.email } },
    });
  } catch (err) {
    next(err);
  }
};

// Middleware to Protect Routes
exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return next(new AppError("You are not logged in!", 401));

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user to request
    next();
  } catch (err) {
    return next(new AppError("Invalid token. Please log in again.", 401));
  }
};

// Middleware for Roles (RBAC)
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};
