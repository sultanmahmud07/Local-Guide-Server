# Local Guide Backend (Node.js + Express + MongoDB)

A scalable backend API powering the **Local Guide Platform**, where travelers can book personalized tours from local guides.  
This repository contains authentication, tour management, booking workflow, reviews, messaging, and payment integration.

---

## 🌍 Live API URL  
**Production:** https://your-api-domain.com  
**Swagger Docs (optional):** https://your-api-domain.com/api-docs  

---

## 🚀 Features  
### ✅ **Authentication & Authorization**
- JWT-based secure auth  
- Role-based access control (Admin, Guide, Tourist)  
- Email/password + provider support  

### 🎒 **Tours Module**
- Create, update, delete tours (with images)  
- Filtering, searching & pagination  
- Public/private tour visibility  
- Guide analytics (tour count, recent bookings, earnings)

### 📅 **Booking System**
- Traveler requests → Guide accepts/declines  
- Status lifecycle: `PENDING → CONFIRMED → COMPLETED → CANCELLED`  
- Group size, date/time, fee calculation  
- Integrated payment workflow  

### ⭐ **Reviews**
- Tourist can review a tour after completion  
- Guides get average ratings & review count  
- Integrated into Explore listings

### 💬 **Messaging**
- Tourist → Guide custom request  
- Stored message thread per booking  

### 💳 **Payment Integration**
- SSLCommerz (or your provider)  
- Payment initialization + status update  
- Admin payment overview analytics  

### 📊 **Admin Dashboard Analytics**
- Total users (active/inactive/blocked)  
- User growth (7 days / 30 days)  
- Users by role  
- Total bookings, payments, guides, tours  
- Chart-ready data for dashboard  

---

## 🛠️ Technology Stack
### **Backend**
- Node.js  
- Express.js  
- TypeScript  
- Mongoose (MongoDB)  
- JWT Authentication  
- Multer (file uploads)  
- Zod Validation  
- SSLCommerz / Stripe Payment Gateway  

### **Dev Tools**
- Nodemon  
- ESLint + Prettier  
- Docker-ready configuration  

---

## 📂 Folder Structure
```
src/
 ├── app/
 │    ├── modules/
 │    │    ├── auth/
 │    │    ├── tours/
 │    │    ├── booking/
 │    │    ├── reviews/
 │    │    ├── payment/
 │    │    ├── messages/
 │    │    └── admin/
 │    │
 │    ├── middlewares/
 │    ├── utils/
 │    ├── interfaces/
 │    └── config/
 │
 ├── server.ts
 └── app.ts
```

---

## ⚙️ Installation & Setup
### **1️⃣ Clone the repository**
```sh
git clone https://github.com/yourusername/local-guide-backend.git
cd local-guide-backend
```

### **2️⃣ Install dependencies**
```sh
npm install
```

### **3️⃣ Environment variables**
Create a `.env` file:

```
DATABASE_URL=mongodb+srv://...
JWT_ACCESS_SECRET=your_token
JWT_REFRESH_SECRET=your_refresh_token
SSL_STORE_ID=xxx
SSL_STORE_PASSWORD=xxx
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
PORT=5000
```

### **4️⃣ Run development server**
```sh
npm run dev
```

### **5️⃣ Build for production**
```sh
npm run build
npm start
```

---

## 🧪 Testing (Optional)
```sh
npm run test
```

---

## 🤝 Contribution Guide
1. Fork the project  
2. Create your feature branch  
3. Commit changes with meaningful messages  
4. Open a Pull Request  

---

## 📜 License
This project is licensed under the **MIT License**.

---

## 📧 Contact
If you need help or want to collaborate:  
**Email:** support@localguide.com  
**Website:** https://localguide.com
