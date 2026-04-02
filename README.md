# 🌴 PEARL PASSAGE – Sri Lanka Travel Experience & Booking Platform

**Pearl Passage** is a modern single-page travel experience and booking platform focused on Sri Lanka. It allows users to explore destinations, book curated travel packages, and request fully customized itineraries.

Built with **React, Firebase, and EmailJS**, the platform delivers a seamless and interactive travel planning experience.

---

## ✨ Features

### 🏠 Home (Landing & Brand Story)
- Animated introduction showcasing the Pearl Passage brand.
- **What Our Travelers Say** section:
  - Combines static and real-time reviews from Firestore.
- Logged-in users can submit reviews (stored in `reviews` collection).

---

### 🌍 Smart Destination Explorer
- Search Sri Lankan locations using OpenStreetMap (Nominatim).
- Displays:
  - Coordinates, category, address, and links.
- Integrated Google Maps view.
- Image gallery powered by:
  - Wikimedia Commons (primary)
  - Wikipedia (fallback)
  - Unsplash (final fallback)
- Lightbox viewer with full-screen navigation.

---

### 📦 Curated Travel Packages
- Predefined packages:
  - Cultural, Wildlife, Beach, Hill Country, Nature
- Each package includes:
  - Duration, group size, rating, highlights, pricing
- Detailed modal view for each package
- Logged-in users can book directly.

---

### 🧾 Package Booking System
- Collects traveler details:
  - Passport number, adults/children, travel date, language
- Optional airport pickup:
  - Flight number, arrival date/time
- Automatic:
  - Traveler calculation (2 children = 1 adult)
  - Total price calculation
- Stored in Firestore (`booked_packages`)
- Booking confirmation summary shown to user.

---

### 🧳 Custom Package Requests
- Users can design their own trips:
  - Select multiple destinations
  - Add special requirements
- Optional airport pickup details
- Stored in `customPackageRequests`
- Generates unique ID: `CPR-<timestamp>`
- Sends:
  - Confirmation email to user
  - Notification email to admin (via EmailJS)

---

### 🔐 Authentication & User Profiles
- Email/Password authentication
- Google OAuth login
- Stores user data in `users` collection:
  - First name, last name, country
- Merges profile data with Firebase user session.

---

### 📧 Email Notifications (EmailJS)
- Booking confirmation emails
- Custom request confirmations
- Internal team alerts

---

### 🎨 UI/UX
- Fully responsive design
- Clean CSS modules
- Animated page transitions
- Form validation with real-time feedback

---

## 🛠️ Tech Stack

**Frontend**
- React 18 (Create React App)
- React Router v6

**Styling**
- CSS Modules

**Backend (BaaS)**
- Firebase Authentication
- Firestore Database
- Firebase Analytics

**Email Service**
- EmailJS

**APIs**
- OpenStreetMap (Nominatim)
- Wikimedia / Wikipedia APIs
- Unsplash API

**Libraries**
- countries-list
- react-icons
- react-scroll
- react-toastify

---

## 📁 Project Structure
