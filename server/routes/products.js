const express = require("express")
const Product = require("../models/Product")
const auth = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/products
// @desc    Get all products with optional filtering
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const { category, search, sortBy = "name", sortOrder = "asc" } = req.query

    // Build query
    const query = { isActive: true }

    if (category && category !== "all") {
      query.category = category
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { symbol: { $regex: search, $options: "i" } },
        { sector: { $regex: search, $options: "i" } },
      ]
    }

    // Build sort object
    const sortObj = {}
    sortObj[sortBy] = sortOrder === "desc" ? -1 : 1

    const products = await Product.find(query).sort(sortObj).select("-priceHistory") // Exclude price history for list view

    res.json({
      success: true,
      count: products.length,
      data: products,
    })
  } catch (error) {
    console.error("Products fetch error:", error)
    res.status(500).json({
      message: "Server error fetching products",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    })
  }
})

// @route   GET /api/products/:id
// @desc    Get single product with price history
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      })
    }

    if (!product.isActive) {
      return res.status(404).json({
        message: "Product is not available",
      })
    }

    res.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error("Product fetch error:", error)

    if (error.name === "CastError") {
      return res.status(404).json({
        message: "Product not found",
      })
    }

    res.status(500).json({
      message: "Server error fetching product",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    })
  }
})

// @route   GET /api/products/category/:category
// @desc    Get products by category
// @access  Private
router.get("/category/:category", auth, async (req, res) => {
  try {
    const { category } = req.params
    const { limit = 10 } = req.query

    const products = await Product.find({
      category: category.toLowerCase(),
      isActive: true,
    })
      .limit(Number.parseInt(limit))
      .select("-priceHistory")
      .sort({ name: 1 })

    res.json({
      success: true,
      count: products.length,
      data: products,
    })
  } catch (error) {
    console.error("Category products fetch error:", error)
    res.status(500).json({
      message: "Server error fetching category products",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    })
  }
})

// @route   GET /api/products/:id/price-history
// @desc    Get product price history for charts
// @access  Private
router.get("/:id/price-history", auth, async (req, res) => {
  try {
    const { days = 30 } = req.query

    const product = await Product.findById(req.params.id).select("name symbol priceHistory")

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      })
    }

    // Filter price history by days
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - Number.parseInt(days))

    const filteredHistory = product.priceHistory.filter((entry) => entry.date >= cutoffDate)

    res.json({
      success: true,
      data: {
        name: product.name,
        symbol: product.symbol,
        priceHistory: filteredHistory,
      },
    })
  } catch (error) {
    console.error("Price history fetch error:", error)

    if (error.name === "CastError") {
      return res.status(404).json({
        message: "Product not found",
      })
    }

    res.status(500).json({
      message: "Server error fetching price history",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    })
  }
})

module.exports = router
