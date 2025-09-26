"use client"

import { useState, useEffect } from "react"
import { transactionsAPI } from "../services/api"
import toast from "react-hot-toast"

const Transactions = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTransactions: 0,
  })
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    page: 1,
    limit: 10,
  })
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalBuyTransactions: 0,
    totalSellTransactions: 0,
    totalAmountInvested: 0,
    totalAmountReceived: 0,
  })

  useEffect(() => {
    fetchTransactions()
    fetchStats()
  }, [filters])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await transactionsAPI.getAll(filters)
      setTransactions(response.data.data)
      setPagination(response.data.pagination)
    } catch (error) {
      toast.error("Failed to fetch transactions")
      console.error("Transactions fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await transactionsAPI.getStats()
      setStats(response.data.data)
    } catch (error) {
      console.error("Stats fetch error:", error)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }))
  }

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }))
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(price)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      completed: "bg-success-100 text-success-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-danger-100 text-danger-800",
      cancelled: "bg-gray-100 text-gray-800",
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors.pending}`}>
        {status.toUpperCase()}
      </span>
    )
  }

  const getTypeBadge = (type) => {
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          type === "buy" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
        }`}
      >
        {type.toUpperCase()}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
        <p className="text-gray-600 mt-1">View all your trading activities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Buy Orders</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalBuyTransactions}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">📈</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sell Orders</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalSellTransactions}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">📉</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Invested</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalAmountInvested)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-xl">💰</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
              <select
                className="input-field"
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
              >
                <option value="">All Types</option>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="input-field"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Per Page</label>
              <select
                className="input-field"
                value={filters.limit}
                onChange={(e) => handleFilterChange("limit", Number.parseInt(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No transactions found</div>
              <p className="text-gray-400 mt-2">Start trading to see your transaction history</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Units
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{transaction.productId.name}</div>
                          <div className="text-sm text-gray-500">{transaction.productId.symbol}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getTypeBadge(transaction.type)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.units}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(transaction.pricePerUnit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatPrice(transaction.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(transaction.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.transactionDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(pagination.currentPage - 1) * filters.limit + 1} to{" "}
            {Math.min(pagination.currentPage * filters.limit, pagination.totalTransactions)} of{" "}
            {pagination.totalTransactions} transactions
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const page = i + Math.max(1, pagination.currentPage - 2)
              if (page > pagination.totalPages) return null

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    page === pagination.currentPage
                      ? "text-primary-600 bg-primary-50 border border-primary-300"
                      : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              )
            })}

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Transactions
