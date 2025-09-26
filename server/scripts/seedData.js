const mongoose = require("mongoose")
const Product = require("../models/Product")
require("dotenv").config()

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")

    // Clear existing products
    await Product.deleteMany({})
    console.log("Cleared existing products")

    // Seed data
    const products = [
      {
        name: "Reliance Industries Ltd",
        symbol: "RELIANCE",
        category: "stock",
        pricePerUnit: 2450.75,
        metric: "per_share",
        description:
          "Largest private sector company in India, engaged in petrochemicals, oil & gas, telecom and retail.",
        sector: "Energy",
        marketCap: 16500100000000,
      },
      {
        name: "Tata Consultancy Services",
        symbol: "TCS",
        category: "stock",
        pricePerUnit: 3680.5,
        metric: "per_share",
        description: "Leading global IT services, consulting and business solutions organization.",
        sector: "Information Technology",
        marketCap: 13400000000000,
      },
      {
        name: "HDFC Bank Ltd",
        symbol: "HDFCBANK",
        category: "stock",
        pricePerUnit: 1542.3,
        metric: "per_share",
        description: "Leading private sector bank in India offering banking and financial services.",
        sector: "Banking",
        marketCap: 11800000000000,
      },
      {
        name: "SBI Bluechip Fund",
        symbol: "SBIBLUECHIP",
        category: "mutual_fund",
        pricePerUnit: 68.45,
        metric: "per_unit",
        description: "Large cap equity mutual fund investing in blue chip companies.",
        sector: "Mutual Fund",
        marketCap: 0,
      },
      {
        name: "HDFC Top 100 Fund",
        symbol: "HDFCTOP100",
        category: "mutual_fund",
        pricePerUnit: 756.2,
        metric: "per_unit",
        description: "Large cap mutual fund focusing on top 100 companies by market capitalization.",
        sector: "Mutual Fund",
        marketCap: 0,
      },
    ]

    // Insert products and generate price history
    for (const productData of products) {
      const product = new Product(productData)
      product.generatePriceHistory()
      await product.save()
      console.log(`Created product: ${product.name}`)
    }

    console.log("Seed data inserted successfully")
    process.exit(0)
  } catch (error) {
    console.error("Error seeding data:", error)
    process.exit(1)
  }
}

seedProducts()
