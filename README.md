PEARL PASSAGE – Sri Lanka Travel Experience & Booking Platform
================================================================

Pearl Passage is a single-page travel experience and booking platform focused on Sri Lanka. It lets users:

- Explore destinations across Sri Lanka using intelligent search, interactive maps, and live photos.
- Browse curated tour packages (cultural, nature, hill country, beach, wildlife) with rich detail.
- Book preset packages with traveler details and optional airport pickup.
- Request fully custom travel itineraries tailored to their preferences.
- Register and log in using email/password or Google authentication.
- Share travel reviews that are stored in Firestore and displayed on the home page.

The app is built with React, Firebase, and EmailJS and can be run either locally with `npm start` or in Docker using the provided Dockerfile.

---

Features
--------

- **Landing & brand story (Home)**
	- Animated introduction text describing Pearl Passage and its heritage.
	- "What Our Travelers Say" review section, combining seed reviews with live reviews from Firestore.
	- Logged-in users can add reviews via a modal form; data is stored in the `reviews` collection.

- **Smart destination explorer (Destinations)**
	- Search for any Sri Lankan city, beach, temple, or landmark via OpenStreetMap (Nominatim) API.
	- Filters results to Sri Lanka bounds and shows key details: coordinates, category, address, links.
	- Embedded Google Maps iframe centers on the selected destination.
	- Photo gallery powered by:
		- Wikimedia Commons API (primary source),
		- Wikipedia page images (fallback),
		- Unsplash API (final fallback).
	- Lightbox viewer with keyboard navigation and full-screen photo viewing.

- **Curated packages (Packages)**
	- Predefined packages such as Sinharaja Rainforest Trek, Sigiriya Lion Rock, Galle Fort & Southern Coast, Yala Wildlife Safari, etc.
	- Each card shows category, duration, group size, rating, highlights, and what’s included.
	- Detail modal with enhanced description and stats.
	- Logged-in users can book directly; guests are redirected to the login page.

- **Package booking (Packages → BookingModal)**
	- Collects traveler data: passport number, adults, children, travel date, language preference.
	- Optional Bandaranaike International Airport pickup with arrival date/time and flight number.
	- Calculates total travelers (2 children = 1 adult equivalent) and total price.
	- Saves bookings to the `booked_packages` Firestore collection with metadata.
	- Shows a confirmation state including booking summary and total amount.

- **Custom package requests (CustomPackage)**
	- Authenticated users can design their own trip by choosing multiple destinations from a curated Sri Lankan list.
	- Optional airport pickup details (arrival date/time, plane details).
	- Free-text special requests field (dietary needs, specific activities, etc.).
	- Saves requests to the `customPackageRequests` Firestore collection with a generated `CPR-<timestamp>` ID.
	- Sends confirmation emails to the user and notification emails to the team via EmailJS.

- **Authentication & user profile**
	- Email/password registration with profile fields (first name, last name, country).
	- Google OAuth sign-up/sign-in via Firebase Authentication.
	- On sign-up, a user document is stored in the `users` Firestore collection.
	- On login, the app merges Firestore profile data (first/last name) into the Firebase user object for convenient use in the UI and emails.

- **Email notifications (EmailJS)**
	- Sends booking confirmation emails for standard package bookings.
	- Sends confirmation and internal team notifications for custom package requests.
	- Email templates are configured in EmailJS and referenced in the app via service and template IDs.

- **UI & UX**
	- Responsive layout and custom CSS modules for each major section.
	- Animated page transitions (PageTransition component).
	- Consistent, modern forms with validation and inline error messaging.

---

Tech Stack
---------

- **Frontend**: React 18 (Create React App), React Router v6
- **Styling**: Plain CSS modules under `src/component/Style/`
- **Backend-as-a-Service**: Firebase (Authentication, Firestore, Analytics)
- **Email service**: EmailJS (client-side email sending)
- **Mapping & data APIs**:
	- OpenStreetMap Nominatim (place search for Sri Lanka)
	- Wikimedia / Wikipedia APIs (images)
	- Unsplash API (image fallback)
- **Utilities & libraries**:
	- countries-list (country selection in registration)
	- react-icons, react-scroll, react-toastify (UI enhancements)

---

Project Structure
-----------------

Key parts of the codebase:

- `src/App.jsx` – Top-level router and layout (Header, Footer, routes, auth listener).
- `src/index.jsx` – React entry point and global style imports.
- `src/firebase.jsx` – Firebase initialization and exports for `auth`, `db`, and helper functions.
- `src/SendEmail.jsx` – EmailJS helper functions for booking and custom package notifications.
- `src/component/Header.jsx` – Navigation bar and links to main sections.
- `src/component/Home.jsx` – Hero section, animated brand text, reviews, and about section.
- `src/component/Destinations.jsx` – Destination search, suggestions, maps, and photo gallery.
- `src/component/Packages.jsx` – Package listing, details, and booking modal.
- `src/component/CustomPackage.jsx` – Custom package request form and submission logic.
- `src/component/Login.jsx` – Login form with email/password and Google sign-in.
- `src/component/Register.jsx` – Registration form, validation, and user profile storage in Firestore.
- `src/component/ForgotPassword.jsx` – Password reset (if implemented in your version).
- `src/component/Style/*.css` – Page-specific styling.

The production build is output to the `build/` directory and is used by the Docker image to serve the app via Nginx.

---

Getting Started (Local Development)
-----------------------------------

### Prerequisites

- Node.js (LTS recommended)
- npm (comes with Node.js)
- A Firebase project (for auth and Firestore)
- An EmailJS account (for email sending)

### 1. Install dependencies

In the project root, run:

```bash
npm install
```

### 2. Configure Firebase

The Firebase configuration currently lives in `src/firebase.jsx`. To point the app to your own Firebase project:

1. Create a Firebase project in the Firebase console.
2. Enable **Email/Password** and **Google** providers in Authentication.
3. Create a Firestore database in "production" or "test" mode.
4. Replace the `firebaseConfig` object in `src/firebase.jsx` with your project’s config values.

Collections used in Firestore include (but are not limited to):

- `users` – user profile documents created at registration or Google sign-up.
- `reviews` – reviews submitted from the Home page.
- `booked_packages` – bookings created from package bookings.
- `customPackageRequests` – requests submitted from the Custom Package page.

> For production, consider moving Firebase credentials to environment variables (e.g. `.env` with `REACT_APP_FIREBASE_...` keys) and importing them in `src/firebase.jsx`.

### 3. Configure EmailJS

Email helper functions live in `src/SendEmail.jsx`. To enable email sending:

1. Create an account on EmailJS.
2. Create an email service and note the **service ID**.
3. Create email templates for:
	 - booking confirmations,
	 - custom package confirmations,
	 - internal team notifications.
4. Replace the `service_...`, `template_...`, and public key values in `src/SendEmail.jsx` with your own IDs.

Again, for production, consider storing these identifiers in environment variables rather than hard-coding them.

### 4. Run the app in development

```bash
npm start
```

This starts the development server (by default on [http://localhost:3000](http://localhost:3000)). The page reloads automatically as you edit the source files.

### 5. Build for production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

---

Running with Docker
-------------------

This repository includes a Dockerfile that builds and serves the production build using Nginx.

1. Build the image:

	 ```bash
	 docker build -t travel-website .
	 ```

2. Run the container:

	 ```bash
	 docker run -p 3000:80 --name travel-website travel-website
	 ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to access the app.

---

Environment & Security Notes
----------------------------

- The sample project includes Firebase and EmailJS configuration values in the source for convenience.
- For real-world deployments, you should:
	- Move any keys or IDs into environment variables (`.env`) where possible.
	- Restrict Firebase security rules appropriately (e.g. read/write rules on `reviews`, `booked_packages`, and `customPackageRequests`).
	- Regenerate any public keys if this repository has been made public.

---

Contributing / Customizing
--------------------------

- Adjust package content, images, and pricing in `src/component/Packages.jsx`.
- Update the brand story, initial reviews, and about text in `src/component/Home.jsx`.
- Extend or change auth flows in `src/component/Login.jsx` and `src/component/Register.jsx`.
- Modify styling via the CSS files in `src/component/Style/`.

You can fork this project and adapt it to other destinations or agencies by replacing the Sri Lanka–specific content while keeping the same booking and custom package flows.

---

License
-------

This project is intended as an application template for a travel agency–style booking platform. Add your own license text here if you plan to open source or distribute it.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
#PEARL PASSAGE – Sri Lanka Travel Experience & Booking Platform
================================================================

Pearl Passage is a single-page travel experience and booking platform focused on Sri Lanka. It lets users:

- Explore destinations across Sri Lanka using intelligent search, interactive maps, and live photos.
- Browse curated tour packages (cultural, nature, hill country, beach, wildlife) with rich detail.
- Book preset packages with traveler details and optional airport pickup.
- Request fully custom travel itineraries tailored to their preferences.
- Register and log in using email/password or Google authentication.
- Share travel reviews that are stored in Firestore and displayed on the home page.

The app is built with React, Firebase, and EmailJS and can be run either locally with `npm start` or in Docker using the provided Dockerfile.

---

Features
--------

- **Landing & brand story (Home)**
	- Animated introduction text describing Pearl Passage and its heritage.
	- "What Our Travelers Say" review section, combining seed reviews with live reviews from Firestore.
	- Logged-in users can add reviews via a modal form; data is stored in the `reviews` collection.

- **Smart destination explorer (Destinations)**
	- Search for any Sri Lankan city, beach, temple, or landmark via OpenStreetMap (Nominatim) API.
	- Filters results to Sri Lanka bounds and shows key details: coordinates, category, address, links.
	- Embedded Google Maps iframe centers on the selected destination.
	- Photo gallery powered by:
		- Wikimedia Commons API (primary source),
		- Wikipedia page images (fallback),
		- Unsplash API (final fallback).
	- Lightbox viewer with keyboard navigation and full-screen photo viewing.

- **Curated packages (Packages)**
	- Predefined packages such as Sinharaja Rainforest Trek, Sigiriya Lion Rock, Galle Fort & Southern Coast, Yala Wildlife Safari, etc.
	- Each card shows category, duration, group size, rating, highlights, and what’s included.
	- Detail modal with enhanced description and stats.
	- Logged-in users can book directly; guests are redirected to the login page.

- **Package booking (Packages → BookingModal)**
	- Collects traveler data: passport number, adults, children, travel date, language preference.
	- Optional Bandaranaike International Airport pickup with arrival date/time and flight number.
	- Calculates total travelers (2 children = 1 adult equivalent) and total price.
	- Saves bookings to the `booked_packages` Firestore collection with metadata.
	- Shows a confirmation state including booking summary and total amount.

- **Custom package requests (CustomPackage)**
	- Authenticated users can design their own trip by choosing multiple destinations from a curated Sri Lankan list.
	- Optional airport pickup details (arrival date/time, plane details).
	- Free-text special requests field (dietary needs, specific activities, etc.).
	- Saves requests to the `customPackageRequests` Firestore collection with a generated `CPR-<timestamp>` ID.
	- Sends confirmation emails to the user and notification emails to the team via EmailJS.

- **Authentication & user profile**
	- Email/password registration with profile fields (first name, last name, country).
	- Google OAuth sign-up/sign-in via Firebase Authentication.
	- On sign-up, a user document is stored in the `users` Firestore collection.
	- On login, the app merges Firestore profile data (first/last name) into the Firebase user object for convenient use in the UI and emails.

- **Email notifications (EmailJS)**
	- Sends booking confirmation emails for standard package bookings.
	- Sends confirmation and internal team notifications for custom package requests.
	- Email templates are configured in EmailJS and referenced in the app via service and template IDs.

- **UI & UX**
	- Responsive layout and custom CSS modules for each major section.
	- Animated page transitions (PageTransition component).
	- Consistent, modern forms with validation and inline error messaging.

---

Tech Stack
---------

- **Frontend**: React 18 (Create React App), React Router v6
- **Styling**: Plain CSS modules under `src/component/Style/`
- **Backend-as-a-Service**: Firebase (Authentication, Firestore, Analytics)
- **Email service**: EmailJS (client-side email sending)
- **Mapping & data APIs**:
	- OpenStreetMap Nominatim (place search for Sri Lanka)
	- Wikimedia / Wikipedia APIs (images)
	- Unsplash API (image fallback)
- **Utilities & libraries**:
	- countries-list (country selection in registration)
	- react-icons, react-scroll, react-toastify (UI enhancements)

---

Project Structure
-----------------

Key parts of the codebase:

- `src/App.jsx` – Top-level router and layout (Header, Footer, routes, auth listener).
- `src/index.jsx` – React entry point and global style imports.
- `src/firebase.jsx` – Firebase initialization and exports for `auth`, `db`, and helper functions.
- `src/SendEmail.jsx` – EmailJS helper functions for booking and custom package notifications.
- `src/component/Header.jsx` – Navigation bar and links to main sections.
- `src/component/Home.jsx` – Hero section, animated brand text, reviews, and about section.
- `src/component/Destinations.jsx` – Destination search, suggestions, maps, and photo gallery.
- `src/component/Packages.jsx` – Package listing, details, and booking modal.
- `src/component/CustomPackage.jsx` – Custom package request form and submission logic.
- `src/component/Login.jsx` – Login form with email/password and Google sign-in.
- `src/component/Register.jsx` – Registration form, validation, and user profile storage in Firestore.
- `src/component/ForgotPassword.jsx` – Password reset (if implemented in your version).
- `src/component/Style/*.css` – Page-specific styling.

The production build is output to the `build/` directory and is used by the Docker image to serve the app via Nginx.

---

Getting Started (Local Development)
-----------------------------------

### Prerequisites

- Node.js (LTS recommended)
- npm (comes with Node.js)
- A Firebase project (for auth and Firestore)
- An EmailJS account (for email sending)

### 1. Install dependencies

In the project root, run:

```bash
npm install
```

### 2. Configure Firebase

The Firebase configuration currently lives in `src/firebase.jsx`. To point the app to your own Firebase project:

1. Create a Firebase project in the Firebase console.
2. Enable **Email/Password** and **Google** providers in Authentication.
3. Create a Firestore database in "production" or "test" mode.
4. Replace the `firebaseConfig` object in `src/firebase.jsx` with your project’s config values.

Collections used in Firestore include (but are not limited to):

- `users` – user profile documents created at registration or Google sign-up.
- `reviews` – reviews submitted from the Home page.
- `booked_packages` – bookings created from package bookings.
- `customPackageRequests` – requests submitted from the Custom Package page.

> For production, consider moving Firebase credentials to environment variables (e.g. `.env` with `REACT_APP_FIREBASE_...` keys) and importing them in `src/firebase.jsx`.

### 3. Configure EmailJS

Email helper functions live in `src/SendEmail.jsx`. To enable email sending:

1. Create an account on EmailJS.
2. Create an email service and note the **service ID**.
3. Create email templates for:
	 - booking confirmations,
	 - custom package confirmations,
	 - internal team notifications.
4. Replace the `service_...`, `template_...`, and public key values in `src/SendEmail.jsx` with your own IDs.

Again, for production, consider storing these identifiers in environment variables rather than hard-coding them.

### 4. Run the app in development

```bash
npm start
```

This starts the development server (by default on [http://localhost:3000](http://localhost:3000)). The page reloads automatically as you edit the source files.

### 5. Build for production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

---

Running with Docker
-------------------

This repository includes a Dockerfile that builds and serves the production build using Nginx.

1. Build the image:

	 ```bash
	 docker build -t travel-website .
	 ```

2. Run the container:

	 ```bash
	 docker run -p 3000:80 --name travel-website travel-website
	 ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to access the app.

---

Environment & Security Notes
----------------------------

- The sample project includes Firebase and EmailJS configuration values in the source for convenience.
- For real-world deployments, you should:
	- Move any keys or IDs into environment variables (`.env`) where possible.
	- Restrict Firebase security rules appropriately (e.g. read/write rules on `reviews`, `booked_packages`, and `customPackageRequests`).
	- Regenerate any public keys if this repository has been made public.

---

Contributing / Customizing
--------------------------

- Adjust package content, images, and pricing in `src/component/Packages.jsx`.
- Update the brand story, initial reviews, and about text in `src/component/Home.jsx`.
- Extend or change auth flows in `src/component/Login.jsx` and `src/component/Register.jsx`.
- Modify styling via the CSS files in `src/component/Style/`.

You can fork this project and adapt it to other destinations or agencies by replacing the Sri Lanka–specific content while keeping the same booking and custom package flows.

---

License
-------

This project is intended as an application template for a travel agency–style booking platform. Add your own license text here if you plan to open source or distribute it.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
#   T r a v e l - A g e n c y - W e b s i t e 
 
 
