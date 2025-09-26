const express = require("express")
const mongoose = require("mongoose")
const { body, validationResult } = require("express-validator")
const Transaction = require("../models/Transaction")
const User = require("../models/User")
const Product = require("../models/Product")
const Portfolio = require("../models/Portfolio")
const auth = require("../middleware/auth")

const router = express.Router()

// @route   POST /api/transactions/buy
// @desc    Buy a product
// @access  Private
router.post(
  "/buy",
  auth,
  [
    body("productId").isMongoId().withMessage("Invalid product ID"),
    body("units").isFloat({ min: 0.01 }).withMessage("Units must be greater than 0"),
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { productId, units } = req.body
      const userId = req.user._id

      // Get product details
      const product = await Product.findById(productId)
      if (!product || !product.isActive) {
        return res.status(404).json({
          message: "Product not found or not available",
        })
      }

      // Get user details
      const user = await User.findById(userId)
      if (!user || !user.isActive) {
        return res.status(404).json({
          message: "User not found or account inactive",
        })
      }

      // Calculate total cost
      const pricePerUnit = product.pricePerUnit
      const totalCost = units * pricePerUnit

      // Check if user has sufficient balance
      if (user.walletBalance < totalCost) {
        return res.status(400).json({
          message: "Insufficient wallet balance",
          required: totalCost,
          available: user.walletBalance,
        })
      }

      // Create transaction record
      const transaction = new Transaction({
        userId,
        productId,
        type: "buy",
        units,
        pricePerUnit,
        totalAmount: totalCost,
        status: "completed",
      })

      await transaction.save()

      // Update user wallet balance
      user.walletBalance -= totalCost
      await user.save()

      // Update or create portfolio
      let portfolio = await Portfolio.findOne({ userId })
      if (!portfolio) {
        portfolio = new Portfolio({ userId, holdings: [], watchlist: [] })
      }

      // Update holding
      portfolio.updateHolding(productId, units, pricePerUnit, "buy")
      await portfolio.save()

      // Populate transaction for response
      await transaction.populate("productId", "name symbol category")

      res.status(201).json({
        message: "Purchase completed successfully",
        transaction: {
          id: transaction._id,
          product: transaction.productId,
          units: transaction.units,
          pricePerUnit: transaction.pricePerUnit,
          totalAmount: transaction.totalAmount,
          transactionDate: transaction.transactionDate,
        },
        newWalletBalance: user.walletBalance,
      })
    } catch (error) {
      console.error("Buy transaction error:", error)
      res.status(500).json({
        message: "Server error processing purchase",
        error: process.env.NODE_ENV === "development" ? error.message : {},
      })
    }
  },
)

// @route   POST /api/transactions/sell
// @desc    Sell a product
// @access  Private
router.post(
  "/sell",
  auth,
  [
    body("productId").isMongoId().withMessage("Invalid product ID"),
    body("units").isFloat({ min: 0.01 }).withMessage("Units must be greater than 0"),
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { productId, units } = req.body
      const userId = req.user._id

      // Get product details
      const product = await Product.findById(productId)
      if (!product || !product.isActive) {
        return res.status(404).json({
          message: "Product not found or not available",
        })
      }

      // Get user details
      const user = await User.findById(userId)
      if (!user || !user.isActive) {
        return res.status(404).json({
          message: "User not found or account inactive",
        })
      }

      // Get user's portfolio
      const portfolio = await Portfolio.findOne({ userId })
      if (!portfolio) {
        return res.status(400).json({
          message: "No portfolio found. You need to buy products first.",
        })
      }

      // Check if user has enough units to sell
      const holding = portfolio.holdings.find(
        (h) => h.productId.toString() === productId.toString()
      )
      
      if (!holding || holding.units < units) {
        return res.status(400).json({
          message: "Insufficient units to sell",
          available: holding ? holding.units : 0,
          requested: units,
        })
      }

      // Calculate total amount to receive
      const pricePerUnit = product.pricePerUnit
      const totalAmount = units * pricePerUnit

      // Create transaction record
      const transaction = new Transaction({
        userId,
        productId,
        type: "sell",
        units,
        pricePerUnit,
        totalAmount,
        status: "completed",
      })

      await transaction.save()

      // Update user wallet balance
      user.walletBalance += totalAmount
      await user.save()

      // Update portfolio holding
      portfolio.updateHolding(productId, units, pricePerUnit, "sell")
      await portfolio.save()

      // Populate transaction for response
      await transaction.populate("productId", "name symbol category")

      res.status(201).json({
        message: "Sale completed successfully",
        transaction: {
          id: transaction._id,
          product: transaction.productId,
          units: transaction.units,
          pricePerUnit: transaction.pricePerUnit,
          totalAmount: transaction.totalAmount,
          transactionDate: transaction.transactionDate,
        },
        newWalletBalance: user.walletBalance,
      })
    } catch (error) {
      console.error("Sell transaction error:", error)
      res.status(500).json({
        message: "Server error processing sale",
        error: process.env.NODE_ENV === "development" ? error.message : {},
      })
    }
  },
)

// @route   GET /api/transactions
// @desc    Get user transactions with pagination
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status } = req.query
    const userId = req.user._id

    // Build query
    const query = { userId }
    if (type) query.type = type
    if (status) query.status = status

    // Calculate pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    // Get transactions with product details
    const transactions = await Transaction.find(query)
      .populate("productId", "name symbol category")
      .sort({ transactionDate: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    // Get total count for pagination
    const totalTransactions = await Transaction.countDocuments(query)
    const totalPages = Math.ceil(totalTransactions / Number.parseInt(limit))

    res.json({
      success: true,
      data: transactions,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages,
        totalTransactions,
        hasNextPage: Number.parseInt(page) < totalPages,
        hasPrevPage: Number.parseInt(page) > 1,
      },
    })
  } catch (error) {
    console.error("Transactions fetch error:", error)
    res.status(500).json({
      message: "Server error fetching transactions",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    })
  }
})

// @route   GET /api/transactions/:id
// @desc    Get single transaction details
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("productId", "name symbol category pricePerUnit")

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      })
    }

    res.json({
      success: true,
      data: transaction,
    })
  } catch (error) {
    console.error("Transaction fetch error:", error)

    if (error.name === "CastError") {
      return res.status(404).json({
        message: "Transaction not found",
      })
    }

    res.status(500).json({
      message: "Server error fetching transaction",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    })
  }
})

// @route   GET /api/transactions/summary/stats
// @desc    Get transaction summary statistics
// @access  Private
router.get("/summary/stats", auth, async (req, res) => {
  try {
    const userId = req.user._id

    // Aggregate transaction statistics
    const stats = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalBuyTransactions: {
            $sum: { $cond: [{ $eq: ["$type", "buy"] }, 1, 0] },
          },
          totalSellTransactions: {
            $sum: { $cond: [{ $eq: ["$type", "sell"] }, 1, 0] },
          },
          totalAmountInvested: {
            $sum: { $cond: [{ $eq: ["$type", "buy"] }, "$totalAmount", 0] },
          },
          totalAmountReceived: {
            $sum: { $cond: [{ $eq: ["$type", "sell"] }, "$totalAmount", 0] },
          },
        },
      },
    ])

    const result = stats[0] || {
      totalTransactions: 0,
      totalBuyTransactions: 0,
      totalSellTransactions: 0,
      totalAmountInvested: 0,
      totalAmountReceived: 0,
    }

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Transaction stats error:", error)
    res.status(500).json({
      message: "Server error fetching transaction statistics",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    })
  }
})

module.exports = router
