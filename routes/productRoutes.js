const express = require("express");
const productController = require("../controllers/productController");
const authController = require("../controllers/authController");

const router = express.Router();

// Public Routes
router.route("/").get(productController.getAllProducts); // GET /api/products

router.route("/:id").get(productController.getProduct); // GET /api/products/:id

// Protected Routes (Example: Only Admin can delete/update)
// router.use(authController.protect);
// router.use(authController.restrictTo('admin'));

module.exports = router;
