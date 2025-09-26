const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    symbol: {
      type: String,
      required: [true, "Product symbol is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["stock", "mutual_fund"],
      lowercase: true,
    },
    pricePerUnit: {
      type: Number,
      required: [true, "Price per unit is required"],
      min: [0.01, "Price must be greater than 0"],
    },
    metric: {
      type: String,
      required: [true, "Metric is required"],
      enum: ["per_share", "per_unit"],
      default: "per_share",
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    sector: {
      type: String,
      trim: true,
    },
    marketCap: {
      type: Number,
      min: 0,
    },
    // Price history for charts (simplified)
    priceHistory: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    // Metadata
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Generate some dummy price history
productSchema.methods.generatePriceHistory = function () {
  const history = []
  const basePrice = this.pricePerUnit
  const days = 30

  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    // Generate random price variation (±5%)
    const variation = (Math.random() - 0.5) * 0.1
    const price = basePrice * (1 + variation)

    history.push({
      date,
      price: Math.round(price * 100) / 100,
    })
  }

  this.priceHistory = history
  return this
}

module.exports = mongoose.model("Product", productSchema)
