# 📦 Parcel Delivery API

A backend service for managing parcel deliveries, users, and role-based operations.  
This system supports **senders, receivers, admins, and super admins**, providing secure parcel tracking and management.

**Base URL:**  
👉 `http://localhost:5000` (Development)  
👉 `https://parcel-delivery-api-sigma.vercel.app` (Production)

---

## 🚀 Project Overview

The **Parcel Delivery API** is designed to handle end-to-end parcel delivery management.  
It allows:
- **Senders** to create and manage parcels.
- **Receivers** to confirm deliveries and view delivery history.
- **Admins/Super Admins** to manage users, parcels, and system-wide operations.
- Supports **Google OAuth login**, JWT authentication, and secure parcel tracking.

---

## ✨ Features

- 🔐 **Role-based Authentication** (Admin, Super Admin, Sender, Receiver)  
- 📦 **Parcel Management**  
  - Create, update, cancel, and track parcels  
  - Change parcel delivery date/time  
  - Block/unblock parcels with logs  
- 👤 **User Management**  
  - Register/login with role  
  - Block/unblock users (admin/super-admin only)  
- 📊 **Parcel Status Logs** (audit trail of parcel activities)  
- 📝 **Receiver History & Delivery Confirmation**  
- ⚡ **JWT Authentication & Google OAuth2.0 Support**

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js, TypeScript  
- **Database:** MongoDB + Mongoose  
- **Authentication:** JWT & Google OAuth  
- **Validation:** Zod schema validation  
- **Error Handling:** Centralized custom error handler  

---

## 📍 API Endpoints

### 🔑 Auth (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST   | `/api/v1/auth/login` | All | Login with credentials (email & password) |
| POST   | `/api/v1/auth/refresh-token` | All | Refresh expired access token |
| POST   | `/api/v1/auth/logout` | All | Logout and clear refresh token |
| POST   | `/api/v1/auth/reset-password` | Authenticated (All Roles) | Reset password(oldPassword & newPassword) |
| GET    | `/api/v1/auth/google/callback` | Public | Google OAuth callback handler |

---

### 👤 User (`/api/v1/user`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST   | `/api/v1/user/register` | Public | Register a new user (SENDER by default) |
| GET    | `/api/v1/user/all-users` | Admin, Super Admin | Get all users |
| GET    | `/api/v1/user/:id` | Admin, Super Admin | Get a single user info |
| GET    | `/api/v1/user/me` | Admin, Super Admin, Sender, Receiver | Get self profile data |
| PATCH  | `/api/v1/user/:id` | Admin, Super Admin, Sender, Receiver | Update user (self or by admin can change roll) |


#### Register user
**POST** `/api/v1/user/register`

**Request Body**
```json
{ 
  "name": "Sender",
  "email": "sender@gmail.com",
  "password": "S@12345678"
}
```
---

### 📦 Parcel (`/api/v1/parcel`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST   | `/api/v1/parcel/create` | Sender, Admin, Super Admin | Create a new parcel |
| GET    | `/api/v1/parcel/all-parcel` | Admin, Super Admin | Get all parcels (admin can filter with page=1&limit=10&status=DISPATCHED&trackingId=TRK-megzqfil-ALLRLD) |
| GET    | `/api/v1/parcel/sender` | Sender | Get all parcels created by sender |
| GET    | `/api/v1/parcel/receiver` | Receiver | Get parcels assigned to receiver |
| GET    | `/api/v1/parcel/history` | Receiver | Get receiver’s delivery history |
| GET    | `/api/v1/parcel/:id` | All Roles | Get parcel by ID |
| GET    | `/api/v1/parcel/tracking-id/:id` | Public | Get parcel by Tracking ID |
| DELETE | `/api/v1/parcel/:id` | Admin, Super Admin, Sender | Delete a parcel (Admins always can. If **Sender**, only when status = `REQUESTED`) |
| PATCH  | `/api/v1/parcel/cancel/:id` | Sender | Cancel a parcel (if not shipped yet) |
| PATCH  | `/api/v1/parcel/delivery/:id` | Receiver | Confirm parcel delivery |
| PATCH  | `/api/v1/parcel/block/:id` | Admin, Super Admin | Block or unblock a parcel |
| PATCH  | `/api/v1/parcel/status/:id` | Admin, Super Admin | Update parcel status (e.g., REQUESTED → IN_TRANSIT) |

---

####  Create Parcel
**POST** `/api/v1/parcels`

**Request Body**
```json
{
  "receiver": "64dcbf1a2f9a5b8c87654321",
  "type": "Electronics",
  "weight": 2.5,
  "address": "123, Dhaka, Bangladesh",
  "fee": 150,
  "deliveryDate": "2025-08-25"
}
```
### 📜 Status Logs
Each parcel maintains a `statusLogs` array for audit trails:  
```json
{
  "status": "DISPATCHED",
  "location": "Warehouse - Dhaka",
  "note": "Parcel dispatched",
  "updatedBy": "64c8f3a9e23f2f45d1a1b123",
  "timestamp": "2025-08-16T10:20:30Z"
}
```


## ▶️ Run the Project

### 1. Clone the repo
```sh
git clone https://github.com/sultanmahmud07/Parcel-Delivery-API.git
cd Parcel-Delivery-API
```

### 2. Install dependencies
```sh
npm install
```

### 3. Setup `.env`
Create a `.env` file in the root with the values from above.

```env
PORT=5000
DB_URL=your_mongo_connection_string
NODE_ENV=development

# JWT
JWT_ACCESS_SECRET=access_secret
JWT_ACCESS_EXPIRES=1d
JWT_REFRESH_SECRET=refresh_secret
JWT_REFRESH_EXPIRES=30d

# BCRYPT
BCRYPT_SALT_ROUND=10

# SUPER ADMIN
SUPER_ADMIN_EMAIL=super@gmail.com
SUPER_ADMIN_PASSWORD=12345678

# Google
GOOGLE_CLIENT_SECRET=your_google_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Express Session
EXPRESS_SESSION_SECRET=express-session

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

---
### 4. Run server
```sh
npm run dev
```

Server will run on: **http://localhost:5000**