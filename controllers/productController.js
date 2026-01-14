const AppError = require("../utils/appError");

// --- DATABASE SIMULATION ---
const products = [
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
  // ... (Your other 10 products here)
];

exports.getAllProducts = (req, res, next) => {
  let result = [...products];

  // 1. Search
  if (req.query.q) {
    const term = req.query.q.toLowerCase();
    result = result.filter(
      (p) => p.name.toLowerCase().includes(term) || p.category.includes(term)
    );
  }

  // 2. Filter
  if (req.query.category && req.query.category !== "all") {
    result = result.filter((p) => p.category === req.query.category);
  }

  // 3. Sort
  if (req.query.sort) {
    if (req.query.sort === "price_asc")
      result.sort((a, b) => a.price - b.price);
    if (req.query.sort === "price_desc")
      result.sort((a, b) => b.price - a.price);
  }

  // 4. Paginate
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 8;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedResults = result.slice(startIndex, endIndex);

  res.status(200).json({
    status: "success",
    results: result.length,
    data: {
      products: paginatedResults,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(result.length / limit),
      },
    },
  });
};

exports.getProduct = (req, res, next) => {
  const id = req.params.id * 1;
  const product = products.find((el) => el.id === id);

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { product },
  });
};
