const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    type: {
      type: String,
      enum: ["buy", "sell"],
      required: [true, "Transaction type is required"],
    },
    units: {
      type: Number,
      required: [true, "Units are required"],
      min: [0.01, "Units must be greater than 0"],
    },
    pricePerUnit: {
      type: Number,
      required: [true, "Price per unit is required"],
      min: [0.01, "Price must be greater than 0"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "completed",
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
    // Metadata
    fees: {
      type: Number,
      default: 0,
    },
    notes: String,
  },
  {
    timestamps: true,
  },
)

// Calculate total amount before saving
transactionSchema.pre("save", function (next) {
  this.totalAmount = this.units * this.pricePerUnit + this.fees
  next()
})

// Index for efficient queries
transactionSchema.index({ userId: 1, transactionDate: -1 })
transactionSchema.index({ productId: 1 })

module.exports = mongoose.model("Transaction", transactionSchema)
