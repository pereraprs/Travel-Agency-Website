import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import Header from "./component/Header";
import Home from "./component/Home";
import Register from "./component/Register";
import Login from "./component/Login";
import ForgotPassword from "./component/ForgotPassword";
import Destinations from "./component/Destinations";
import Packages from "./component/Packages";
import CustomPackage from "./component/CustomPackage";
import Footer from "./component/Footer";
import PageTransition from "./component/PageTransition";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Fetch user profile from Firestore
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            // Merge Firestore profile data into user object
            currentUser.firstName = userData.firstName;
            currentUser.lastName = userData.lastName;
            currentUser.fullName = `${userData.firstName} ${userData.lastName}`;
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <Router>
      <Header user={user} />
      <PageTransition>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/destinations" element={<Destinations user={user} />} />
          <Route path="/packages" element={<Packages user={user} />} />
          <Route path="/custom-package" element={<CustomPackage user={user} />} />
         
        </Routes>
      </PageTransition>
      <Footer />
    </Router>
  );
}

export default App;