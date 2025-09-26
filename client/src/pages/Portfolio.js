"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { portfolioAPI, transactionsAPI } from "../services/api"
import toast from "react-hot-toast"

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState({
    summary: {
      totalInvested: 0,
      totalCurrentValue: 0,
      totalReturns: 0,
      returnsPercentage: 0,
    },
    holdings: [],
    watchlist: [],
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("holdings")
  const [sellModal, setSellModal] = useState({
    isOpen: false,
    holding: null,
    units: "",
    loading: false,
  })

  useEffect(() => {
    fetchPortfolio()
  }, [])

  const fetchPortfolio = async () => {
    try {
      setLoading(true)
      const response = await portfolioAPI.getDashboard()
      setPortfolio(response.data.data)
    } catch (error) {
      toast.error("Failed to fetch portfolio")
      console.error("Portfolio fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromWatchlist = async (productId) => {
    try {
      await portfolioAPI.removeFromWatchlist(productId)
      setPortfolio((prev) => ({
        ...prev,
        watchlist: prev.watchlist.filter((item) => item.productId._id !== productId),
      }))
      toast.success("Removed from watchlist")
    } catch (error) {
      toast.error("Failed to remove from watchlist")
    }
  }

  const openSellModal = (holding) => {
    setSellModal({
      isOpen: true,
      holding,
      units: "",
      loading: false,
    })
  }

  const closeSellModal = () => {
    setSellModal({
      isOpen: false,
      holding: null,
      units: "",
      loading: false,
    })
  }

  const handleSellUnits = async () => {
    if (!sellModal.holding || !sellModal.units) {
      toast.error("Please enter the number of units to sell")
      return
    }

    const unitsToSell = parseFloat(sellModal.units)
    if (unitsToSell <= 0) {
      toast.error("Units must be greater than 0")
      return
    }

    if (unitsToSell > sellModal.holding.units) {
      toast.error("You don't have enough units to sell")
      return
    }

    try {
      setSellModal(prev => ({ ...prev, loading: true }))
      
      const response = await transactionsAPI.sell({
        productId: sellModal.holding.productId._id,
        units: unitsToSell,
      })

      toast.success("Sale completed successfully!")
      closeSellModal()
      fetchPortfolio() // Refresh portfolio data
    } catch (error) {
      const message = error.response?.data?.message || "Failed to sell units"
      toast.error(message)
    } finally {
      setSellModal(prev => ({ ...prev, loading: false }))
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(price)
  }

  const getReturnColor = (returns) => {
    if (returns > 0) return "text-success-600"
    if (returns < 0) return "text-danger-600"
    return "text-gray-600"
  }

  const getReturnIcon = (returns) => {
    if (returns > 0) return "↗"
    if (returns < 0) return "↘"
    return "→"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
        <p className="text-gray-600 mt-1">Track your investments and returns</p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Invested</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(portfolio.summary.totalInvested)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(portfolio.summary.totalCurrentValue)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Returns</p>
                <p className={`text-2xl font-bold ${getReturnColor(portfolio.summary.totalReturns)}`}>
                  {getReturnIcon(portfolio.summary.totalReturns)}{" "}
                  {formatPrice(Math.abs(portfolio.summary.totalReturns))}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">📈</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Returns %</p>
                <p className={`text-2xl font-bold ${getReturnColor(portfolio.summary.totalReturns)}`}>
                  {portfolio.summary.returnsPercentage.toFixed(2)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-xl">📊</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("holdings")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "holdings"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Holdings ({portfolio.holdings.length})
            </button>
            <button
              onClick={() => setActiveTab("watchlist")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "watchlist"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Watchlist ({portfolio.watchlist.length})
            </button>
          </nav>
        </div>

        <div className="card-body">
          {activeTab === "holdings" && (
            <div>
              {portfolio.holdings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg">No holdings yet</div>
                  <p className="text-gray-400 mt-2">Start investing to build your portfolio</p>
                  <Link to="/products" className="btn-primary mt-4 inline-block">
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {portfolio.holdings.map((holding) => (
                    <div key={holding.productId._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{holding.productId.name}</h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                holding.productId.category === "stock"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {holding.productId.category === "stock" ? "Stock" : "Mutual Fund"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{holding.productId.symbol}</p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Units Held</p>
                              <p className="text-sm font-medium">{holding.units}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Avg. Price</p>
                              <p className="text-sm font-medium">{formatPrice(holding.averagePrice)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Current Price</p>
                              <p className="text-sm font-medium">{formatPrice(holding.productId.pricePerUnit)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Invested</p>
                              <p className="text-sm font-medium">{formatPrice(holding.totalInvested)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="text-right ml-6">
                          <div className="mb-2">
                            <p className="text-xs text-gray-500">Current Value</p>
                            <p className="text-lg font-bold text-gray-900">{formatPrice(holding.currentValue)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Returns</p>
                            <p className={`text-sm font-medium ${getReturnColor(holding.returns)}`}>
                              {getReturnIcon(holding.returns)} {formatPrice(Math.abs(holding.returns))}
                            </p>
                            <p className={`text-xs ${getReturnColor(holding.returns)}`}>
                              ({holding.returnsPercentage.toFixed(2)}%)
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                        <Link
                          to={`/products/${holding.productId._id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          View Details →
                        </Link>
                        <div className="flex space-x-2">
                          <Link
                            to={`/products/${holding.productId._id}`}
                            className="btn-primary text-xs px-3 py-1"
                          >
                            Buy More
                          </Link>
                          <button 
                            onClick={() => openSellModal(holding)}
                            className="btn-danger text-xs px-3 py-1"
                          >
                            Sell
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "watchlist" && (
            <div>
              {portfolio.watchlist.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg">No items in watchlist</div>
                  <p className="text-gray-400 mt-2">Add products to your watchlist to track them</p>
                  <Link to="/products" className="btn-primary mt-4 inline-block">
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {portfolio.watchlist.map((item) => (
                    <div key={item.productId._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{item.productId.name}</h3>
                          <p className="text-sm text-gray-600">{item.productId.symbol}</p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.productId.category === "stock"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.productId.category === "stock" ? "Stock" : "Mutual Fund"}
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className="text-2xl font-bold text-gray-900">{formatPrice(item.productId.pricePerUnit)}</p>
                        <p className="text-xs text-gray-500">Current Price</p>
                      </div>

                      <div className="flex space-x-2">
                        <Link
                          to={`/products/${item.productId._id}`}
                          className="flex-1 btn-primary text-center text-xs py-2"
                        >
                          Buy Now
                        </Link>
                        <button
                          onClick={() => handleRemoveFromWatchlist(item.productId._id)}
                          className="btn-secondary text-xs px-3 py-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sell Modal */}
      {sellModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Sell Units</h3>
              <button
                onClick={closeSellModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {sellModal.holding && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">{sellModal.holding.productId.name}</h4>
                  <p className="text-sm text-gray-600">{sellModal.holding.productId.symbol}</p>
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Units Held:</span>
                      <span className="ml-2 font-medium">{sellModal.holding.units}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Current Price:</span>
                      <span className="ml-2 font-medium">{formatPrice(sellModal.holding.productId.pricePerUnit)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Units to Sell
                  </label>
                  <input
                    type="number"
                    value={sellModal.units}
                    onChange={(e) => setSellModal(prev => ({ ...prev, units: e.target.value }))}
                    placeholder="Enter units to sell"
                    className="input-field"
                    min="0.01"
                    max={sellModal.holding.units}
                    step="0.01"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available: {sellModal.holding.units} units
                  </p>
                </div>

                {sellModal.units && parseFloat(sellModal.units) > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span>Units to sell:</span>
                        <span className="font-medium">{sellModal.units}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price per unit:</span>
                        <span className="font-medium">{formatPrice(sellModal.holding.productId.pricePerUnit)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="font-medium">Total Amount:</span>
                        <span className="font-bold text-blue-600">
                          {formatPrice(parseFloat(sellModal.units) * sellModal.holding.productId.pricePerUnit)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={closeSellModal}
                    className="flex-1 btn-secondary"
                    disabled={sellModal.loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSellUnits}
                    disabled={sellModal.loading || !sellModal.units || parseFloat(sellModal.units) <= 0}
                    className="flex-1 btn-danger"
                  >
                    {sellModal.loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Selling...
                      </div>
                    ) : (
                      "Sell Units"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Portfolio
