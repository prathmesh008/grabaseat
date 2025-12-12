# GrabASeat - Project Interview Guide

## 1. Project Overview
**GrabASeat** is a full-stack, production-ready event booking platform designed for university campuses and organizations. It allows users to discover events, book specific seats in real-time, and manage their bookings. For administrators, it offers a comprehensive dashboard to track revenue, manage events, and analyze user engagement.

---

## 2. Technology Stack

### **Frontend (Client-Side)**
*   **Framework:** **Next.js 14 (App Router)** - Chosen for its server-side rendering (SSR) capabilities, SEO benefits, and robust routing system.
*   **Styling:** **Tailwind CSS** - Used for rapid, utility-first styling. Implemented a custom **Glassmorphism** design system (translucent, blurred backgrounds) to give a modern, premium "startup" aesthetic.
*   **Animations:** **Framer Motion** - Powers the smooth page transitions, card hover effects, and entrance animations, creating a highly interactive user experience.
*   **UI Components:** 
    *   **Radix UI Primitives:** For accessible, unstyled functional components (icons, slots).
    *   **NextUI:** For polished pre-built components like Buttons and inputs.
    *   **Sonner:** For clean, toast notifications (success/error alerts).
*   **State Management:** React Hooks (`useState`, `useEffect`, `useMemo`) for local state.
*   **Data Fetching:** **Axios** - For making HTTP requests to the backend API.

### **Backend (Server-Side)**
*   **Runtime:** **Node.js** with **Express.js** - Provides a lightweight, scalable REST API architecture.
*   **Database:** **MongoDB** with **Mongoose ODM** - Storing flexible data structures for Users, Events (with nested seat schemas), and Bookings.
*   **Real-Time Engine:** **Socket.io** - Enables real-time capabilities. Specifically used to lock seats instantly when a user selects them, preventing double-bookings by other users viewing the same event.
*   **Authentication:** **JWT (JSON Web Tokens)** - Stateless authentication. Access tokens are verified via middleware (`authJwt`) to protect private routes.
*   **Security:** `bcryptjs` for password hashing. `cors` for cross-origin resource sharing.

### **Integrations & Tools**
*   **Razorpay:** Integrated for handling secure payment processing during the checkout flow.
*   **Multer:** Middleware for handling `multipart/form-data`, specifically for uploading event posters and banners directly to the server memory/database.
*   **Date-fns:** utilized for robust date formatting and relative time calculations (e.g., "booked 3 hours ago").

---

## 3. Key Feature Breakdown

### **A. User Module (Student/Customer)**

1.  **Secure Authentication Flow:**
    *   Sign Up/Login with JWT-based session management.
    *   Role-based redirection: Admins go to Dashboard, Users go to Home.
    *   **Tech:** `auth.controller.js`, `authCheck` hook.

2.  **Event Discovery (Home Page):**
    *   **Hero Section:** Cinematic, immersive landing experience.
    *   **Search & Filter:** Real-time filtering of events by title or category.
    *   **Event Cards:** Premium glass-cards showing posters, dates, and prices.
    *   **Tech:** Next.js Server Components, Framer Motion animations.

3.  **Real-Time Interactive Booking:**
    *   **Dynamic Seat Map:** Visual representation of sections (General, VIP).
    *   **Seat Selection:** Users can click to select seats.
    *   **Real-Time Locking:** When a seat is selected, `Socket.io` emits an event to all other clients to "gray out" that seat instantly.
    *   **Tech:** Socket.io Client, React State.

4.  **Checkout & Payment:**
    *   Order summary with tax calculation.
    *   Integration with **Razorpay** test mode for seamless transactions.
    *   **Generation of QR Code:** Upon success, a digital ticket with a QR code is generated for entry.

5.  **User Dashboard:**
    *   "My Bookings" page displaying past and upcoming tickets.
    *   Ticket-style UI cards.

### **B. Admin Module (Organizer)**

1.  **Production-Grade Dashboard:**
    *   **Analytics Overview:** Cards displaying Total Revenue, Total Events, Bookings, and Active Events.
    *   **Visual Charts:** Revenue Trend (Bar Chart) and Category Distribution (Progress Bars) using real aggregated data from MongoDB.
    *   **Tech:** MongoDB Aggregation Pipeline, Framer Motion.

2.  **Event Management:**
    *   **Create Event:** Complex form with file uploads (Poster/Banner) and dynamic section configuration (define rows/cols/price for VIP vs General).
    *   **Events List:** View all managed events with "Booked vs Capacity" progress bars.

3.  **Live Activity Feed:**
    *   Real-time list of "Recent Registrations" showing who booked what and when.

---

## 4. Key Technical Challenges & Solutions (Interview Gold)

**1. Handling Image Uploads:**
*   *Challenge:* Storing and retrieving images efficiently without an external cloud bucket (like AWS S3) for this MVP.
*   *Solution:* Implemented **Multer** to handle `multipart/form-data` and stored images as **Buffers** directly in MongoDB. On the frontend, created a utility (`bufferToBase64`) to convert these binary buffers into viewable base64 image strings dynamically.

**2. Hydration Mismatches:**
*   *Challenge:* The Admin Navbar showed a hydration error because the server rendered "User" while the client immediately tried to render the specific admin name from LocalStorage.
*   *Solution:* Implemented a `mounted` state check. The component renders a consistent default on the server, and `useEffect` handles the client-side data update only after the component has mounted in the browser.

**3. Real-Time Concurrency:**
*   *Challenge:* Two users trying to book the same seat at the same time.
*   *Solution:* Integrated **Socket.io**. As soon as User A clicks seat "A1", a socket event broadcasts to User B, disabling "A1" on their screen immediately.

---

## 5. System Architecture
`[Client (Next.js)]` <--> `[API (Express + Node)]` <--> `[Database (MongoDB)]`
                                   ^
                                   |
                          `[Socket.io Server]`
                                   |
                          `[Real-time updates]`
