const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")
const User = require("../models/User")
const Product = require("../models/Product")

// Get user's watchlist
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("watchlist")
    res.json(user.watchlist)
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Server Error")
  }
})

// Add product to watchlist
router.post("/add/:productId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    const product = await Product.findById(req.params.productId)

    if (!product) {
      return res.status(404).json({ msg: "Product not found" })
    }

    if (user.watchlist.includes(req.params.productId)) {
      return res.status(400).json({ msg: "Product already in watchlist" })
    }

    user.watchlist.push(req.params.productId)
    await user.save()

    res.json({ msg: "Product added to watchlist" })
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Server Error")
  }
})

// Remove product from watchlist
router.delete("/remove/:productId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    user.watchlist = user.watchlist.filter((productId) => productId.toString() !== req.params.productId)

    await user.save()
    res.json({ msg: "Product removed from watchlist" })
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Server Error")
  }
})

module.exports = router
