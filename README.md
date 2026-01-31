# 🏦 SmartBank – Full Stack Banking Application

SmartBank is a full-stack banking application built using **FastAPI**, **React**, and **MongoDB**.  
It supports **secure user banking operations** and a powerful **admin dashboard** for monitoring and control.

---

## 🚀 Features

### 👤 User Features

- User Signup & Login (JWT Authentication)
- KYC Verification (PAN, address, phone)
- Bank Account Creation (Savings / Current / FD)
- Initial balance credited automatically
- Dashboard with:
  - Account details
  - Balance & daily transaction limit
  - Money transfer
  - Transaction history (Credit / Debit)

### 🛡 Admin Features

- Secure Admin Signup (Bank Secret Required)
- Admin Login
- Search users by name or account number
- View complete user profile & transaction history
- Credit / Debit classification
- Transaction filters (date, type, amount)
- Analytics summary:
  - Total Credit
  - Total Debit
  - Net Flow
  - Total Transactions
- Update daily transaction limit
- Deactivate user accounts

---

## 🧱 Tech Stack

### Frontend

- React.js
- React Router
- Tailwind CSS
- Axios

### Backend

- FastAPI
- Python
- JWT Authentication
- MongoDB (Motor)
- Pydantic

### Database

- MongoDB Atlas

---

## 🔐 Authentication & Security

- JWT-based authentication
- Role-based access control (User / Admin)
- Protected routes
- Admin signup protected using Bank Secret
- Server-side validations

---

## ⚙️ Environment Variables

- MONGO_URI=your_mongodb_uri
- JWT_SECRET=your_jwt_secret
- BANK_ADMIN_SECRET=your_bank_secret

---

## 🧪 Run Locally

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

### Frontend
cd frontend
npm install
npm run dev
```
