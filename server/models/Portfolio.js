const mongoose = require("mongoose")

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
    },
    holdings: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        units: {
          type: Number,
          required: true,
          min: 0,
        },
        averagePrice: {
          type: Number,
          required: true,
          min: 0,
        },
        totalInvested: {
          type: Number,
          required: true,
          min: 0,
        },
        lastUpdated: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    watchlist: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        addedDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Summary fields (calculated)
    totalInvested: {
      type: Number,
      default: 0,
    },
    totalCurrentValue: {
      type: Number,
      default: 0,
    },
    totalReturns: {
      type: Number,
      default: 0,
    },
    returnsPercentage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Method to update holding
portfolioSchema.methods.updateHolding = function (productId, units, price, type = "buy") {
  const holdingIndex = this.holdings.findIndex((h) => h.productId.toString() === productId.toString())

  if (type === "buy") {
    if (holdingIndex >= 0) {
      // Update existing holding
      const holding = this.holdings[holdingIndex]
      const newTotalInvested = holding.totalInvested + units * price
      const newUnits = holding.units + units

      holding.averagePrice = newTotalInvested / newUnits
      holding.units = newUnits
      holding.totalInvested = newTotalInvested
      holding.lastUpdated = new Date()
    } else {
      // Create new holding
      this.holdings.push({
        productId,
        units,
        averagePrice: price,
        totalInvested: units * price,
        lastUpdated: new Date(),
      })
    }
  } else if (type === "sell") {
    if (holdingIndex >= 0) {
      // Update existing holding
      const holding = this.holdings[holdingIndex]
      const newUnits = holding.units - units
      
      if (newUnits <= 0) {
        // Remove holding completely if all units are sold
        this.holdings.splice(holdingIndex, 1)
      } else {
        // Update holding with remaining units
        holding.units = newUnits
        holding.totalInvested = holding.totalInvested - (units * holding.averagePrice)
        holding.lastUpdated = new Date()
      }
    }
  }

  return this
}

// Method to add to watchlist
portfolioSchema.methods.addToWatchlist = function (productId) {
  const exists = this.watchlist.some((w) => w.productId.toString() === productId.toString())
  if (!exists) {
    this.watchlist.push({ productId })
  }
  return this
}

// Method to remove from watchlist
portfolioSchema.methods.removeFromWatchlist = function (productId) {
  this.watchlist = this.watchlist.filter((w) => w.productId.toString() !== productId.toString())
  return this
}

module.exports = mongoose.model("Portfolio", portfolioSchema)
