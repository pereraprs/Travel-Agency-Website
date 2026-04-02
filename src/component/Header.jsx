import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "./Style/Header.css";

function Header({ user }) {
  const navigate = useNavigate();

const handleHome = () => {
    navigate("/");
  };

  const handleSignUp = () => {
    navigate("/register");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleDestinations = () => {
    navigate("/destinations");
  };

  const handlePackages= () => {
    navigate("/packages");
  };

  const handleCustomPackage = () => {
    navigate("/custom-package");
  };

  const handleContact = () => {
    const footerElement = document.querySelector('footer');
    if (footerElement) {
      footerElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
      <header className='header'>
            <div className='header-decoration'>
                <img src="logo.png" alt="decoration" className='header-wave'/>
            </div>
            <div className='container'>
                 <div className='logo'>
                    <span className='logo-text'></span>
                 </div>
                <ul className="nav">
                    <li><button onClick={handleHome} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit'}}>Home</button></li>
                    <li><button onClick={handleDestinations} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit'}}>Destinations</button></li>
                    <li><button onClick={handlePackages} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit'}}>Packages</button></li>
                    <li><button onClick={handleCustomPackage} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit'}}>Custom Package</button></li>
                    <li><button onClick={handleContact} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit'}}>Contact Us</button></li>
                </ul>
                
                <div className='auth-buttons'>
                    {user ? (
                      <button className='btn-logout' onClick={handleLogout}>Logout</button>
                    ) : (
                      <>
                        <button className='btn-login' onClick={handleLogin}>Login</button>
                        <button className='btn-signup' onClick={handleSignUp}>Sign Up</button>
                      </>
                    )}
                </div>
            </div> 
        </header>
  );
}

export default Header;

