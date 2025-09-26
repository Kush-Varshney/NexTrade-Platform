"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { productsAPI } from "../services/api"
import toast from "react-hot-toast"

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: "all",
    search: "",
    sortBy: "name",
    sortOrder: "asc",
  })

  useEffect(() => {
    fetchProducts()
  }, [filters])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await productsAPI.getAll(filters)
      setProducts(response.data.data)
    } catch (error) {
      toast.error("Failed to fetch products")
      console.error("Products fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(price)
  }

  const getCategoryBadgeColor = (category) => {
    return category === "stock" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Browse and invest in stocks and mutual funds</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search products..."
                className="input-field"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="input-field"
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="stock">Stocks</option>
                <option value="mutual_fund">Mutual Funds</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                className="input-field"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              >
                <option value="name">Name</option>
                <option value="pricePerUnit">Price</option>
                <option value="symbol">Symbol</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <select
                className="input-field"
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No products found</div>
          <p className="text-gray-400 mt-2">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link key={product._id} to={`/products/${product._id}`} className="block">
              <div className="card hover:shadow-lg transition-shadow duration-200">
                <div className="card-body">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-gray-600 font-mono">{product.symbol}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(
                        product.category,
                      )}`}
                    >
                      {product.category === "stock" ? "Stock" : "Mutual Fund"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Price {product.metric.replace("_", " ")}</span>
                      <span className="text-lg font-bold text-gray-900">{formatPrice(product.pricePerUnit)}</span>
                    </div>

                    {product.sector && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Sector</span>
                        <span className="text-sm text-gray-900">{product.sector}</span>
                      </div>
                    )}

                    {product.marketCap > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Market Cap</span>
                        <span className="text-sm text-gray-900">
                          ₹{(product.marketCap / 1000000000000).toFixed(2)}T
                        </span>
                      </div>
                    )}
                  </div>

                  {product.description && (
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">{product.description}</p>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-primary-600 font-medium">View Details →</span>
                      <div className="flex space-x-2">
                        <button className="text-xs bg-primary-50 text-primary-600 px-2 py-1 rounded hover:bg-primary-100 transition-colors">
                          Buy
                        </button>
                        <button className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded hover:bg-gray-100 transition-colors">
                          Watch
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Results Summary */}
      <div className="text-center text-sm text-gray-500">
        Showing {products.length} product{products.length !== 1 ? "s" : ""}
      </div>
    </div>
  )
}

export default Products
