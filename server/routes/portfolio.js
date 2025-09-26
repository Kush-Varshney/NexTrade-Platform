const express = require("express")
const mongoose = require("mongoose")
const { body, validationResult } = require("express-validator")
const Portfolio = require("../models/Portfolio")
const Product = require("../models/Product")
const Transaction = require("../models/Transaction")
const auth = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/portfolio
// @desc    Get user portfolio dashboard
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user._id

    // Get or create portfolio
    let portfolio = await Portfolio.findOne({ userId })
      .populate("holdings.productId", "name symbol pricePerUnit category")
      .populate("watchlist.productId", "name symbol pricePerUnit category")

    if (!portfolio) {
      portfolio = new Portfolio({ userId, holdings: [], watchlist: [] })
      await portfolio.save()
    }

    // Calculate current values and returns
    let totalInvested = 0
    let totalCurrentValue = 0

    const holdingsWithCurrentValue = portfolio.holdings.map((holding) => {
      const invested = holding.totalInvested
      const currentValue = holding.units * holding.productId.pricePerUnit
      const returns = currentValue - invested
      const returnsPercentage = invested > 0 ? (returns / invested) * 100 : 0

      totalInvested += invested
      totalCurrentValue += currentValue

      return {
        ...holding.toObject(),
        currentValue,
        returns,
        returnsPercentage,
      }
    })

    const totalReturns = totalCurrentValue - totalInvested
    const totalReturnsPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0

    // Update portfolio summary
    portfolio.totalInvested = totalInvested
    portfolio.totalCurrentValue = totalCurrentValue
    portfolio.totalReturns = totalReturns
    portfolio.returnsPercentage = totalReturnsPercentage
    await portfolio.save()

    res.json({
      success: true,
      data: {
        summary: {
          totalInvested,
          totalCurrentValue,
          totalReturns,
          returnsPercentage: totalReturnsPercentage,
        },
        holdings: holdingsWithCurrentValue,
        watchlist: portfolio.watchlist,
      },
    })
  } catch (error) {
    console.error("Portfolio fetch error:", error)
    res.status(500).json({
      message: "Server error fetching portfolio",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    })
  }
})

// @route   POST /api/portfolio/watchlist
// @desc    Add product to watchlist
// @access  Private
router.post("/watchlist", auth, [body("productId").isMongoId().withMessage("Invalid product ID")], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { productId } = req.body
    const userId = req.user._id

    // Check if product exists
    const product = await Product.findById(productId)
    if (!product || !product.isActive) {
      return res.status(404).json({
        message: "Product not found or not available",
      })
    }

    // Get or create portfolio
    let portfolio = await Portfolio.findOne({ userId })
    if (!portfolio) {
      portfolio = new Portfolio({ userId, holdings: [], watchlist: [] })
    }

    // Check if already in watchlist
    const existingIndex = portfolio.watchlist.findIndex((item) => item.productId.toString() === productId)

    if (existingIndex >= 0) {
      return res.status(400).json({
        message: "Product already in watchlist",
      })
    }

    // Add to watchlist
    portfolio.addToWatchlist(productId)
    await portfolio.save()

    // Populate the new watchlist item
    await portfolio.populate("watchlist.productId", "name symbol pricePerUnit category")

    res.status(201).json({
      message: "Product added to watchlist",
      watchlist: portfolio.watchlist,
    })
  } catch (error) {
    console.error("Add to watchlist error:", error)
    res.status(500).json({
      message: "Server error adding to watchlist",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    })
  }
})

// @route   DELETE /api/portfolio/watchlist/:productId
// @desc    Remove product from watchlist
// @access  Private
router.delete("/watchlist/:productId", auth, async (req, res) => {
  try {
    const { productId } = req.params
    const userId = req.user._id

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "Invalid product ID",
      })
    }

    // Get portfolio
    const portfolio = await Portfolio.findOne({ userId })
    if (!portfolio) {
      return res.status(404).json({
        message: "Portfolio not found",
      })
    }

    // Check if product is in watchlist
    const existingIndex = portfolio.watchlist.findIndex((item) => item.productId.toString() === productId)

    if (existingIndex < 0) {
      return res.status(404).json({
        message: "Product not found in watchlist",
      })
    }

    // Remove from watchlist
    portfolio.removeFromWatchlist(productId)
    await portfolio.save()

    // Populate remaining watchlist
    await portfolio.populate("watchlist.productId", "name symbol pricePerUnit category")

    res.json({
      message: "Product removed from watchlist",
      watchlist: portfolio.watchlist,
    })
  } catch (error) {
    console.error("Remove from watchlist error:", error)
    res.status(500).json({
      message: "Server error removing from watchlist",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    })
  }
})

// @route   GET /api/portfolio/holdings/:productId
// @desc    Get specific holding details
// @access  Private
router.get("/holdings/:productId", auth, async (req, res) => {
  try {
    const { productId } = req.params
    const userId = req.user._id

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "Invalid product ID",
      })
    }

    const portfolio = await Portfolio.findOne({ userId }).populate(
      "holdings.productId",
      "name symbol pricePerUnit category",
    )

    if (!portfolio) {
      return res.status(404).json({
        message: "Portfolio not found",
      })
    }

    const holding = portfolio.holdings.find((h) => h.productId._id.toString() === productId)

    if (!holding) {
      return res.status(404).json({
        message: "Holding not found",
      })
    }

    // Calculate current values
    const currentValue = holding.units * holding.productId.pricePerUnit
    const returns = currentValue - holding.totalInvested
    const returnsPercentage = holding.totalInvested > 0 ? (returns / holding.totalInvested) * 100 : 0

    // Get transaction history for this product
    const transactions = await Transaction.find({
      userId,
      productId,
    })
      .sort({ transactionDate: -1 })
      .limit(10)

    res.json({
      success: true,
      data: {
        ...holding.toObject(),
        currentValue,
        returns,
        returnsPercentage,
        transactions,
      },
    })
  } catch (error) {
    console.error("Holding fetch error:", error)
    res.status(500).json({
      message: "Server error fetching holding details",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    })
  }
})

module.exports = router
