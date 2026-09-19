# ShopEase 🛒 - Full-Stack Multi-Vendor E-Commerce Platform

ShopEase is a production-ready, full-stack multi-vendor marketplace built as the flagship project for the Dev Weekends '26 Fellowship. It features secure role-based access, a real Stripe payment integration, automated order splitting across multiple sellers, and dynamic catalog seeding using the Pexels API.

🔗 **[Live Application URL](Link_bhi_aayega)**
📄 **[Read the Full Architecture Case Study (PDF)](./ShopEase-Case-Study.pdf)**

## 🚀 Key Features

* **Multi-Vendor Order Splitting:** A single customer checkout cart is automatically and securely divided into independent, per-seller orders sharing a common `orderGroupId`.
* **Real Payment Processing:** Integrated Stripe checkout (Test Mode) with strict server-side webhook verification—never relying purely on client-side success reports.
* **Role-Based Access Control (RBAC):** Distinct interfaces and robust JWT authorization for Buyers (shopping & reviews), Sellers (product & order management), and Admins (platform oversight).
* **Intelligent Data Seeding:** Custom Node.js backend scripts utilizing the Pexels API to dynamically fetch and match realistic product images, eliminating broken or mismatched placeholders.
* **Secure Authentication:** Complete authentication flows including secure password hashing and SMTP-driven password reset emails (Nodemailer).

## 🛠️ Tech Stack

* **Frontend:** React 18 (Vite), Tailwind CSS, React Router DOM, Axios, Lucide React, Stripe.js
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas, Mongoose (Object Data Modeling)
* **Cloud & External Services:** Cloudinary (Image Hosting), Nodemailer (Transactional Emails), Pexels API, Stripe API

## 💻 Local Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Haroonkhan4063/shopease-ecommerce.git](https://github.com/Haroonkhan4063/shopease-ecommerce.git)
   cd shopease-ecommerce
Install Dependencies:

Bash
cd frontend && npm install
cd ../backend && npm install
Environment Configuration:
Create .env files in both frontend and backend directories using the provided .env.example templates. Add your MongoDB URI, Stripe keys, Cloudinary credentials, and Pexels API key.

Seed the Database:

Bash
cd backend
node scripts/seed.js
Run Development Servers:

Bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev

👨‍💻 Developer
Muhammad Haroon Khan

BSCS (7th Semester) | Software Engineer & Web Development Fellow