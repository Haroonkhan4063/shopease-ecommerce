# ShopEase 🛒 - Full-Stack Multi-Vendor E-Commerce Platform

ShopEase is a production-ready, full-stack multi-vendor marketplace built as the flagship project for the Dev Weekends '26 Fellowship. It features secure role-based access, a real Stripe payment integration, automated order splitting across multiple sellers, and dynamic catalog seeding using the Pexels API.

🔗 **[Live Application](https://shopease-ecommerce-one.vercel.app/)**
📄 **[Read the Full Case Study (PDF)](./ShopEase-Case-Study.pdf)**

## 🚀 Key Features

* **Multi-Vendor Order Splitting:** A single customer checkout cart is automatically and securely divided into independent, per-seller orders sharing a common `orderGroupId`.
* **Real Payment Processing:** Integrated Stripe checkout (Test Mode) with strict server-side verification of every PaymentIntent — never relying purely on client-side success reports.
* **Role-Based Access Control (RBAC):** Distinct interfaces and JWT-based authorization for Buyers (shopping & reviews), Sellers (product & order management), and Admins (platform oversight).
* **Intelligent Data Seeding:** A custom Node.js backend script that queries the Pexels API live to fetch accurately-matched product images, instead of static or randomly-mismatched placeholders.
* **Secure Authentication:** Full auth flow including bcrypt password hashing, forgot/reset password via hashed time-limited tokens (Nodemailer), and a change-password flow for logged-in users.

## 🛠️ Tech Stack

* **Frontend:** React 18 (Vite), Tailwind CSS, React Router DOM, Axios, Lucide React, Stripe.js
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas, Mongoose (Object Data Modeling)
* **Cloud & External Services:** Cloudinary (Image Hosting), Nodemailer (Transactional Emails), Pexels API, Stripe API

## 💻 Local Setup & Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Haroonkhan4063/shopease-ecommerce.git
   cd shopease-ecommerce
   ```

2. **Install dependencies**

   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```

3. **Environment configuration**

   Create `.env` files in both `frontend` and `backend` directories using the provided `.env.example` templates. Add your MongoDB URI, JWT secret, Stripe keys, Cloudinary credentials, SMTP credentials, and Pexels API key.

4. **Seed the database** (optional — populates 52 demo products + an admin account)

   ```bash
   cd backend
   node scripts/seed.js
   ```

5. **Run development servers**

   ```bash
   # Terminal 1
   cd backend && npm run dev

   # Terminal 2
   cd frontend && npm run dev
   ```

## 👨‍💻 Developer

**Muhammad Haroon Khan**
BSCS (7th Semester) | Software Engineer & Web Development Fellow