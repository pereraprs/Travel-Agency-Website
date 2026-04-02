import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { sendCustomPackageEmail, sendTeamCustomPackageNotification } from "../SendEmail";
import "./Style/CustomPackage.css";

// Popular destinations in Sri Lanka
const DESTINATIONS = [
  "Sigiriya - Lion Rock Fortress",
  "Anuradhapura - Ancient City",
  "Sinharaja - Rainforest Trek",
  "Galle - Fort & Beaches",
  "Ella - Hill Country",
  "Kandy - Temple of the Tooth",
  "Mirissa - Whale Watching",
  "Nuwara Eliya - Hill Station",
  "Colombo - City",
  "Polonnaruwa - Ancient Ruins",
  "Adam's Peak - Mountain",
  "Arugambe - Surf Beach",
];

function CustomPackage({ user }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    destinations: [],
    travelDate: "",
    needsAirportPickup: false,
    arrivalDate: "",
    arrivalTime: "",
    planeName: "",
    specialRequests: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [destinationInput, setDestinationInput] = useState("");
  const [filteredDestinations, setFilteredDestinations] = useState([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Filter destinations as user types
  const handleDestinationInputChange = (e) => {
    const value = e.target.value;
    setDestinationInput(value);

    if (value.trim()) {
      const filtered = DESTINATIONS.filter((dest) =>
        dest.toLowerCase().includes(value.toLowerCase()) &&
        !formData.destinations.includes(dest)
      );
      setFilteredDestinations(filtered);
    } else {
      setFilteredDestinations([]);
    }
  };

  // Add destination from suggestions
  const addDestination = (destination) => {
    setFormData((prev) => ({
      ...prev,
      destinations: [...prev.destinations, destination],
    }));
    setDestinationInput("");
    setFilteredDestinations([]);
  };

  // Remove destination
  const removeDestination = (destination) => {
    setFormData((prev) => ({
      ...prev,
      destinations: prev.destinations.filter((d) => d !== destination),
    }));
  };

  // Handle checkbox change for airport pickup
  const handleCheckboxChange = (e) => {
    const { checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      needsAirportPickup: checked,
      // Clear the fields when unchecked
      ...(checked ? {} : { arrivalDate: "", arrivalTime: "", planeName: "" }),
    }));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Validate form data
      if (formData.destinations.length === 0) {
        setMessage("Please select at least one destination");
        setLoading(false);
        return;
      }

      if (!formData.travelDate) {
        setMessage("Please select a travel date");
        setLoading(false);
        return;
      }

      // Validate airport pickup fields if checkbox is checked
      if (formData.needsAirportPickup) {
        if (!formData.arrivalDate) {
          setMessage("Please select arrival date");
          setLoading(false);
          return;
        }
        if (!formData.arrivalTime) {
          setMessage("Please select arrival time");
          setLoading(false);
          return;
        }
        if (!formData.planeName.trim()) {
          setMessage("Please enter plane name");
          setLoading(false);
          return;
        }
      }

      // Prepare booking data
      const bookingData = {
        userId: user.uid,
        userName: user.fullName || `${user.firstName} ${user.lastName}` || user.email,
        userEmail: user.email,
        destinations: formData.destinations.join(", "),
        travelDate: formData.travelDate,
        needsAirportPickup: formData.needsAirportPickup,
        ...(formData.needsAirportPickup && {
          arrivalDate: formData.arrivalDate,
          arrivalTime: formData.arrivalTime,
          planeName: formData.planeName,
        }),
        specialRequests: formData.specialRequests,
        createdAt: new Date(),
        status: "pending",
        requestId: "CPR-" + Date.now(),
      };

      // Save to Firestore
      const docRef = await addDoc(
        collection(db, "customPackageRequests"),
        bookingData
      );

      // Send confirmation email to user
      await sendCustomPackageEmail(user, bookingData);

      // Send notification email to team
      await sendTeamCustomPackageNotification(bookingData);

      // Show success message
      setMessage(
        `Custom package request submitted successfully! Request ID: ${bookingData.requestId}`
      );

      // Reset form
      setFormData({
        destinations: [],
        travelDate: "",
        needsAirportPickup: false,
        arrivalDate: "",
        arrivalTime: "",
        planeName: "",
        specialRequests: "",
      });

      // Redirect to packages page after 2 seconds
      setTimeout(() => {
        navigate("/packages");
      }, 2000);
    } catch (error) {
      console.error("Error submitting custom package:", error);
      setMessage("❌ Error submitting request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <section className="custom-package-section">
      <div className="custom-package-container">
        <div className="custom-package-header">
          <span className="eyebrow">Create Your Perfect Trip</span>
          <h1>Custom Package Request</h1>
          <p>Tell us about your dream destination and we'll create the perfect package for you</p>
        </div>

        <div className="custom-package-form-wrapper">
          <form onSubmit={handleSubmit} className="custom-package-form">
            {/* Destinations */}
            <div className="form-group">
              <label htmlFor="destinations">Select Destinations *</label>
              <div className="destination-input-wrapper">
                <input
                  type="text"
                  placeholder="Type a destination name..."
                  value={destinationInput}
                  onChange={handleDestinationInputChange}
                  className="destination-input"
                />
                {filteredDestinations.length > 0 && (
                  <div className="destination-suggestions">
                    {filteredDestinations.map((dest) => (
                      <button
                        key={dest}
                        type="button"
                        className="suggestion-item"
                        onClick={() => addDestination(dest)}
                      >
                        + {dest}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected destinations */}
              {formData.destinations.length > 0 && (
                <div className="selected-destinations">
                  {formData.destinations.map((dest) => (
                    <div key={dest} className="destination-badge">
                      <span>{dest}</span>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeDestination(dest)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {formData.destinations.length === 0 && (
                <p className="form-hint">No destinations selected yet</p>
              )}
            </div>

            {/* Travel Date */}
            <div className="form-group">
              <label htmlFor="travelDate">Date of Travel *</label>
              <input
                type="date"
                id="travelDate"
                name="travelDate"
                value={formData.travelDate}
                onChange={handleInputChange}
                className="form-input"
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

           {/* Airport Pickup */}
<div className="checkbox-group">
  <label className="checkbox-label">
    <span>Need Airport Pickup?</span>
    <input
      type="checkbox"
      name="needsAirportPickup"
      checked={formData.needsAirportPickup}
      onChange={handleCheckboxChange}
      className="form-checkbox"
    />
    
  </label>
</div>

            {/* Arrival Details - Conditional */}
            {formData.needsAirportPickup && (
              <>
                <div className="form-group">
                  <label htmlFor="arrivalDate">Arrival Date *</label>
                  <input
                    type="date"
                    id="arrivalDate"
                    name="arrivalDate"
                    value={formData.arrivalDate}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="arrivalTime">Arrival Time *</label>
                  <input
                    type="time"
                    id="arrivalTime"
                    name="arrivalTime"
                    value={formData.arrivalTime}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="planeName">Plane Name *</label>
                  <input
                    type="text"
                    id="planeName"
                    name="planeName"
                    placeholder="e.g., SriLankan Airlines UL 210"
                    value={formData.planeName}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </>
            )}

            {/* Special Requests */}
            <div className="form-group">
              <label htmlFor="specialRequests">Special Requests (Optional)</label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                placeholder="Tell us about any special requirements, dietary preferences, or specific activities you'd like to include..."
                className="form-textarea"
                rows="4"
              />
            </div>

            {/* Message Display */}
            {message && (
              <div
                className={`form-message ${
                  message.includes("successfully") ? "success" : "error"
                }`}
              >
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
            >
              {loading ? "Submitting..." : "Submit Custom Package Request"}
            </button>

            <p className="form-disclaimer">
              ✓ We'll review your request and contact you within 24 hours with a custom quote
            </p>
          </form>

          {/* Info Card */}
          <div className="info-card">
            <h3>Why Choose Custom Packages?</h3>
            <ul className="benefits-list">
              <li>✓ Personalized itineraries tailored to your preferences</li>
              <li>✓ Flexible dates and duration</li>
              <li>✓ Expert local guides</li>
              <li>✓ Competitive pricing</li>
              <li>✓ 24/7 customer support</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CustomPackage;
