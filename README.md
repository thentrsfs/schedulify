# Schedulify 🚀 - Automated Booking & Management System

**Schedulify** is a modern, full-stack Software-as-a-Service (SaaS) platform designed for service-based businesses (salons, gyms, clinics, and private practices) to automate appointment scheduling, manage team members, and streamline service offerings.

🔗 **Live Demo:** [schedulify-4tvf.vercel.app](https://schedulify-4tvf.vercel.app)

---

## 🛠️ Tech Stack & Architecture

This project is built using an industry-standard, modern tech stack optimized for performance, type safety, and seamless user experience:

* **Framework:** Next.js (App Router) – Utilizing Server-Side Rendering (SSR) and Server Actions for optimal speed and SEO.
* **Frontend:** React, TypeScript, Tailwind CSS, Shadcn/ui (Radix UI primitives).
* **Database & ORM:** PostgreSQL (Hosted on Neon Cloud) with Prisma ORM for robust data modeling and type-safe database queries.
* **Authentication:** Clerk – Secure, drop-in user management and multi-tenant authentication.
* **Hosting & CI/CD:** Vercel.

---

## ✨ Key Features

### 📅 Public Client Interface:
* **Instant Booking Flow:** A seamless, multi-step booking experience allowing clients to pick a service, select an employee, and choose an available date and time.
* **Fully Responsive:** Beautifully optimized UI that feels native on mobile, tablet, and desktop screens.

### 💼 Admin Dashboard (Protected Business Suite):
* **Middleware Protection:** Dashboard routes are fully secured via Clerk Middleware, ensuring only authenticated operators can access internal data.
* **Service Management:** Full CRUD functionality to create, update, and delete services, configure duration, and set pricing.
* **Staff Management:** Oversee employees and link them directly to the specific services they provide.
* **Real-time Appointment Tracking:** A centralized hub to view and monitor upcoming bookings as they come in.

---

## 🚀 Getting Started

To run this project locally, follow these steps:

### 1. Clone the repository & install dependencies

```bash
git clone [https://github.com/thentrsfs/schedulify](https://github.com/thentrsfs/schedulify)
cd schedulify
npm install

```

### 2. Set up environment variables

Create a .env file in the root directory and add your credentials:

# Database (Neon PostgreSQL)
DATABASE_URL="your_neon_postgresql_connection_string"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"

### 3. Run Prisma database migrations and generate client

```bash 
npx prisma db push
npx prisma generate
```

### 4. Start the development server

```bash 
npm run dev
```

Open http://localhost:3000 with your browser to see the result.

📝 License
This project is open-source and available under the MIT License.