const express = require("express")
const jwt = require("jsonwebtoken")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const Portfolio = require("../models/Portfolio")
const auth = require("../middleware/auth")
const upload = require("../middleware/upload")

const router = express.Router()

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  })
}

// @route   POST /api/auth/register
// @desc    Register user with KYC
// @access  Public
router.post(
  "/register",
  upload.single("kycDocument"),
  [
    body("name").trim().isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Please enter a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("panNumber")
      .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
      .withMessage("Please enter a valid PAN number (e.g., ABCDE1234F)"),
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

      const { name, email, password, panNumber } = req.body

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { panNumber }],
      })

      if (existingUser) {
        return res.status(400).json({
          message:
            existingUser.email === email
              ? "User with this email already exists"
              : "User with this PAN number already exists",
        })
      }

      // Check if KYC document was uploaded
      if (!req.file) {
        return res.status(400).json({
          message: "KYC document is required",
        })
      }

      // Create new user
      const user = new User({
        name,
        email,
        password,
        panNumber: panNumber.toUpperCase(),
        kycDocument: {
          filename: req.file.filename,
          path: req.file.path,
          uploadDate: new Date(),
        },
      })

      await user.save()

      // Create portfolio for the user
      const portfolio = new Portfolio({
        userId: user._id,
        holdings: [],
        watchlist: [],
      })
      await portfolio.save()

      // Generate token
      const token = generateToken(user._id)

      // Update last login
      user.lastLogin = new Date()
      await user.save()

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          panNumber: user.panNumber,
          kycStatus: user.kycStatus,
          walletBalance: user.walletBalance,
        },
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({
        message: "Server error during registration",
        error: process.env.NODE_ENV === "development" ? error.message : {},
      })
    }
  },
)

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Please enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
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

      const { email, password } = req.body

      // Find user by email
      const user = await User.findOne({ email }).select("+password")
      if (!user) {
        return res.status(401).json({
          message: "Invalid email or password",
        })
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(401).json({
          message: "Account is deactivated. Please contact support.",
        })
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        return res.status(401).json({
          message: "Invalid email or password",
        })
      }

      // Generate token
      const token = generateToken(user._id)

      // Update last login
      user.lastLogin = new Date()
      await user.save()

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          panNumber: user.panNumber,
          kycStatus: user.kycStatus,
          walletBalance: user.walletBalance,
          lastLogin: user.lastLogin,
        },
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({
        message: "Server error during login",
        error: process.env.NODE_ENV === "development" ? error.message : {},
      })
    }
  },
)

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        panNumber: user.panNumber,
        kycStatus: user.kycStatus,
        walletBalance: user.walletBalance,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    res.status(500).json({
      message: "Server error fetching profile",
    })
  }
})

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  auth,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { name } = req.body
      const user = await User.findById(req.user._id)

      if (name) user.name = name
      await user.save()

      res.json({
        message: "Profile updated successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          panNumber: user.panNumber,
          kycStatus: user.kycStatus,
          walletBalance: user.walletBalance,
        },
      })
    } catch (error) {
      console.error("Profile update error:", error)
      res.status(500).json({
        message: "Server error updating profile",
      })
    }
  },
)

// @route   POST /api/auth/verify-token
// @desc    Verify JWT token
// @access  Private
router.post("/verify-token", auth, (req, res) => {
  res.json({
    message: "Token is valid",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      kycStatus: req.user.kycStatus,
      walletBalance: req.user.walletBalance,
    },
  })
})

module.exports = router
