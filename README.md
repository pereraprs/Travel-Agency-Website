---

# 🌴 PEARL PASSAGE – Sri Lanka Travel Experience & Booking Platform

**Pearl Passage** is a modern single-page travel experience and booking platform focused on Sri Lanka. It allows users to explore destinations, book curated travel packages, and request fully customized itineraries.

Built with **React, Firebase, and EmailJS**, the platform delivers a seamless and interactive travel planning experience.

---

## ✨ Features

### 🏠 Home (Landing & Brand Story)

* Animated introduction showcasing the Pearl Passage brand.
* “What Our Travelers Say” section:

  * Combines static and real-time reviews from Firestore.
* Logged-in users can submit reviews (stored in `reviews` collection).

---

### 🌍 Smart Destination Explorer

* Search Sri Lankan locations using **OpenStreetMap (Nominatim)**.
* Displays:

  * Coordinates, category, address, and links.
* Integrated **Google Maps view**.
* Image gallery powered by:

  * Wikimedia Commons (primary)
  * Wikipedia (fallback)
  * Unsplash (final fallback)
* Lightbox viewer with full-screen navigation.

---

### 📦 Curated Travel Packages

* Predefined packages:

  * Cultural, Wildlife, Beach, Hill Country, Nature
* Each package includes:

  * Duration, group size, rating, highlights, pricing
* Detailed modal view for each package
* Logged-in users can book directly

---

### 🧾 Package Booking System

* Collects traveler details:

  * Passport number, adults/children, travel date, language
* Optional airport pickup:

  * Flight number, arrival date/time
* Automatic:

  * Traveler calculation (2 children = 1 adult)
  * Total price calculation
* Stored in Firestore (`booked_packages`)
* Booking confirmation summary shown to user

---

### 🧳 Custom Package Requests

* Users can design their own trips:

  * Select multiple destinations
  * Add special requirements
* Optional airport pickup details
* Stored in `customPackageRequests`
* Generates unique ID: `CPR-<timestamp>`
* Sends:

  * Confirmation email to user
  * Notification email to admin (via EmailJS)

---

### 🔐 Authentication & User Profiles

* Email/Password authentication
* Google OAuth login
* Stores user data in `users` collection:

  * First name, last name, country
* Merges profile data with Firebase user session

---

### 📧 Email Notifications (EmailJS)

* Booking confirmation emails
* Custom request confirmations
* Internal team alerts

---

### 🎨 UI/UX

* Fully responsive design
* Clean CSS modules
* Animated page transitions
* Form validation with real-time feedback

---

## 🛠️ Tech Stack

**Frontend**

* React 18 (Create React App)
* React Router v6

**Styling**

* CSS Modules

**Backend (BaaS)**

* Firebase Authentication
* Firestore Database
* Firebase Analytics

**Email Service**

* EmailJS

**APIs**

* OpenStreetMap (Nominatim)
* Wikimedia / Wikipedia APIs
* Unsplash API

**Libraries**

* countries-list
* react-icons
* react-scroll
* react-toastify

---

## 📁 Project Structure

```
src/
│
├── App.jsx                # Main router & layout
├── index.jsx              # Entry point
├── firebase.jsx           # Firebase config
├── SendEmail.jsx          # EmailJS logic
│
├── component/
│   ├── Header.jsx
│   ├── Home.jsx
│   ├── Destinations.jsx
│   ├── Packages.jsx
│   ├── CustomPackage.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── ForgotPassword.jsx
│   └── Style/             # CSS files
│
└── build/                 # Production build
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js (LTS)
* npm
* Firebase project
* EmailJS account

---

### 1. Install Dependencies

```bash
npm install
```

---

### 2. Configure Firebase

* Create project in Firebase Console
* Enable:

  * Email/Password auth
  * Google auth
* Create Firestore database
* Replace config in:

```bash
src/firebase.jsx
```

**Firestore Collections:**

* `users`
* `reviews`
* `booked_packages`
* `customPackageRequests`

---

### 3. Configure EmailJS

* Create EmailJS account
* Setup:

  * Service ID
  * Templates
* Update:

```bash
src/SendEmail.jsx
```

---

### 4. Run Development Server

```bash
npm start
```

---

### 5. Build for Production

```bash
npm run build
```

---

## 🐳 Docker Deployment

### Build Image

```bash
docker build -t travel-website .
```

### Run Container

```bash
docker run -p 3000:80 --name travel-website travel-website
```

Open: [http://localhost:3000](http://localhost:3000)

---

## 🔐 Environment & Security

For production:

* Use `.env` variables:

  * `REACT_APP_FIREBASE_*`
  * EmailJS keys
* Secure Firestore rules
* Avoid exposing API keys publicly

---

## ⚙️ Customization

* Update packages → `Packages.jsx`
* Edit homepage → `Home.jsx`
* Modify auth → `Login.jsx`, `Register.jsx`
* Style changes → `Style/` folder

---

## 📄 License

This project is a template for a travel booking platform. Add your own license if distributing.

---

## 📚 Learn More

* [https://reactjs.org/](https://reactjs.org/)
* [https://firebase.google.com/](https://firebase.google.com/)
* [https://www.emailjs.com/](https://www.emailjs.com/)

---

## 🧪 Available Scripts

```bash
npm start     # Run development server
npm test      # Run tests
npm run build # Production build
npm run eject # Eject config (irreversible)
```
