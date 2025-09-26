# 📈 NexTrade-Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.18.2-000000)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC)](https://tailwindcss.com/)

> A modern full-stack financial trading application with secure authentication, KYC verification, portfolio management, and real-time trading capabilities.

## 📋 Table of Contents

- **[🌟 Features](#-features)**
- **[🏗️ Architecture](#️-architecture)**
- **[📁 Project Structure](#-project-structure)**
- **[🚀 Quick Start](#-quick-start)**
- **[📚 API Documentation](#-api-documentation)**
- **[🔒 Security Features](#-security-features)**
- **[💰 Demo Data](#-demo-data)**
- **[🚀 Deployment](#-deployment)**
- **[🐛 Troubleshooting](#-troubleshooting)**
- **[🤝 Contributing](#-contributing)**
- **[👤 Author](#-author)**
- **[📄 License](#-license)**

## 🌟 Features

### 🔐 Authentication & KYC
- **JWT Authentication** with secure token storage
- **KYC Verification** with PAN number validation
- **Document Upload** for identity verification
- **Password Security** with bcrypt hashing
- **Protected Routes** with middleware

### 💼 Trading & Portfolio
- **Buy/Sell Transactions** with real-time validation
- **Portfolio Dashboard** with performance metrics
- **Virtual Wallet** with ₹1,00,000 starting balance
- **Watchlist Management** for tracking products
- **Transaction History** with detailed records
- **Returns Calculation** with percentage gains/losses

### 📊 Products & Market Data
- **Stock & Mutual Fund** listings
- **Real-time Pricing** and market information
- **Product Categories** with filtering
- **Detailed Product Pages** with specifications

### 🎨 Modern UI/UX
- **Responsive Design** with Tailwind CSS
- **Interactive Components** and smooth animations
- **Real-time Notifications** with toast messages
- **Loading States** and error handling
- **Mobile-First** approach

## 🏗️ Architecture

- **Frontend**: React 18 with React Router, Tailwind CSS
- **Backend**: Express.js with MongoDB and Mongoose
- **Authentication**: JWT with secure token management
- **File Uploads**: Multer for KYC document handling
- **Security**: Helmet, CORS, Rate limiting, Input validation

## 📁 Project Structure

```
NexTrade-Platform/
├── client/                       # React Frontend
│   ├── public/                   # Static assets
│   └── src/
│       ├── components/           # Reusable UI components
│       ├── pages/                # Page components
│       ├── services/             # API service layer
│       ├── context/              # React context providers
│       └── index.css             # Global styles
│
├── server/                       # Express Backend
│   ├── models/                   # MongoDB schemas
│   ├── routes/                   # API route handlers
│   ├── middleware/               # Custom middleware
│   ├── scripts/                  # Database seeding
│   └── uploads/                  # File upload storage
│
├── setup.sh                      # Automated setup script
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git

### 1) Clone and Setup
```bash
git clone <repository-url>
cd NexTrade-Platform
```

### 2) Manual Setup (Alternative)

**Backend Setup:**
```bash
cd  server
npm install
cp  .env  # Edit with your values
npm run dev
```

**Frontend Setup:**
```bash
cd  client
npm install
cp  .env  # Edit with your values
npm start
```

### 3) Environment Variables

**Server (.env):**
```env
MONGODB_URI=mongodb://localhost:27017/nextrade-platform
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**Client (.env):**
```env
REACT_APP_API_URL=http://localhost:5001/api
```

### 4) Database Seeding
```bash
cd server
npm run seed
```

### URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/api
- **Health Check**: http://localhost:5001/api/health

## 📚 API Documentation

### Authentication
| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password, panNumber, kycDocument }` | Register with KYC |
| POST | `/api/auth/login` | `{ email, password }` | User login |
| GET | `/api/auth/profile` | - | Get user profile |
| POST | `/api/auth/verify-token` | - | Verify JWT token |

### Products
| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| GET | `/api/products` | `category`, `search` | List all products |
| GET | `/api/products/:id` | - | Get product details |

### Transactions
| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/transactions/buy` | `{ productId, units }` | Buy product |
| POST | `/api/transactions/sell` | `{ productId, units }` | Sell product |
| GET | `/api/transactions` | `page`, `limit`, `type` | Get user transactions |
| GET | `/api/transactions/summary/stats` | - | Get transaction statistics |

### Portfolio
| Method | Endpoint | Body | Description |
|---|---|---|---|
| GET | `/api/portfolio` | - | Get portfolio dashboard |
| POST | `/api/portfolio/watchlist` | `{ productId }` | Add to watchlist |
| DELETE | `/api/portfolio/watchlist/:productId` | - | Remove from watchlist |

**Authentication Required**: All routes except auth endpoints require `Authorization: Bearer <token>` header.

## 🔒 Security Features

- **JWT Authentication** with secure token storage
- **Password Hashing** using bcrypt with salt rounds
- **Input Validation** with express-validator
- **File Upload Security** with type and size restrictions
- **Rate Limiting** to prevent API abuse
- **CORS Configuration** for controlled cross-origin requests
- **Security Headers** with Helmet.js
- **PAN Number Validation** with regex patterns
- **KYC Document Verification** with file type restrictions

## 💰 Demo Data

### Starting Balance
- Each user starts with **₹1,00,000** virtual money

### Sample Products
1. **Reliance Industries** (Stock) - ₹2,450.75
2. **TCS** (Stock) - ₹3,680.50
3. **HDFC Bank** (Stock) - ₹1,542.30
4. **SBI Bluechip Fund** (Mutual Fund) - ₹68.45
5. **HDFC Top 100 Fund** (Mutual Fund) - ₹756.20

### Test Flow
1. Register with valid PAN number (format: ABCDE1234F)
2. Upload KYC document (JPEG, PNG, or PDF)
3. Login and explore the dashboard
4. Browse products and add to watchlist
5. Make buy/sell transactions
6. Monitor portfolio performance

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Use PM2 for process management
3. Configure reverse proxy (nginx)
4. Set up SSL certificates
5. Configure MongoDB Atlas for production

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to Vercel, Netlify, or similar
3. Update API base URL for production
4. Configure environment variables

### Environment Variables for Production
```env
# Backend
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nextrade-platform
JWT_SECRET=your-production-secret-key
NODE_ENV=production
PORT=5001
CLIENT_URL=https://your-frontend-domain.com

# Frontend
REACT_APP_API_URL=https://your-backend-domain.com/api
```

## 🐛 Troubleshooting

### Common Issues

**1. CORS Errors**
- Ensure `CLIENT_URL` in server .env matches your frontend URL
- Check CORS configuration in server.js

**2. MongoDB Connection Issues**
- Verify MongoDB is running locally or Atlas connection string
- Check network connectivity and firewall settings

**3. File Upload Issues**
- Ensure uploads directory exists and has proper permissions
- Check file size limits and allowed file types

**4. Authentication Issues**
- Verify JWT secret is set correctly
- Check token expiration settings
- Ensure Authorization header is included in requests

**5. Transaction Errors**
- Verify user has sufficient wallet balance
- Check product availability and active status
- Ensure proper validation of units and product IDs

### Debug Steps
1. Check server logs for error messages
2. Verify environment variables are set correctly
3. Test API endpoints with Postman or curl
4. Check browser console for frontend errors
5. Verify database connection and data integrity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and patterns
- Add proper error handling and validation
- Update documentation for new features
- Test thoroughly before submitting PR
- Use meaningful commit messages

## 👤 Author

**Kush Varshney**  
B.Tech CSE | Full Stack Developer  
[Portfolio](https://kushvarshney.vercel.app/) • [GitHub](https://github.com/Kush-Varshney/) • [LinkedIn](https://www.linkedin.com/in/kush-varshney-490baa250/)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

**Note**: This is a demo application for educational purposes. Do not use for actual financial trading without proper security audits and compliance measures.