import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Style/Packages.css";


// Per-person base costs per day (USD)
const HOTEL_COSTS   = { budget: 8, standard: 17, luxury: 36 };
const MEAL_COSTS    = { budget: 2.50, standard: 5.50, luxury: 12 };
const TRANSPORT_DAY = 11; // flat per day for vehicle

// ─────────────────────────────────────────────────────────────────────────────
// PRESET PACKAGES
// ─────────────────────────────────────────────────────────────────────────────
const PACKAGES = [
  {
    id: 1, title: "Sinharaja Rainforest Trek", location: "Sinharaja · Ratnapura",
    category: "Nature", duration: "3 Days", groupSize: "2–8", price: 99,
    badge: "Eco Tour", badgeType: "eco", rating: 4.9, reviews: 87,
    description: "Step into Sri Lanka's last ancient rainforest — a UNESCO World Heritage Site teeming with endemic birds, purple-faced langurs, and giant butterflies.",
    highlights: ["UNESCO Heritage", "Bird Watching", "Nature Trek", "Guided Walk"],
    image: "https://i.pinimg.com/originals/ea/b5/51/eab551c472de16df9f3af59e0a492ce5.jpg",
    includes: ["Transport", "Guide", "Meals", "Accommodation"],
  },
  {
    id: 2, title: "Sigiriya Lion Rock Fortress", location: "Sigiriya · Central Province",
    category: "Cultural", duration: "2 Days", groupSize: "2–15", price: 85,
    badge: "Bestseller", badgeType: "bestseller", rating: 5.0, reviews: 203,
    description: "Ascend the legendary 5th-century rock fortress rising 200m above the jungle — ancient frescoes, water gardens, and panoramic views await.",
    highlights: ["Lion Rock Climb", "Ancient Frescoes", "Water Gardens", "Sunset View"],
    image: "https://www.atlasandboots.com/wp-content/uploads/2017/03/Sigiriya-Rock-Fortress-1.jpg",
    includes: ["Transport", "Guide", "Entry Tickets", "Hotel"],
  },
  {
    id: 3, title: "Anuradhapura Ancient City", location: "Anuradhapura · North Central",
    category: "Cultural", duration: "2 Days", groupSize: "2–20", price: 75,
    badge: "Heritage", badgeType: "heritage", rating: 4.8, reviews: 156,
    description: "Explore one of the world's oldest continuously inhabited cities — sacred Bodhi tree, colossal dagobas, moonstone carvings, and ancient royal palaces.",
    highlights: ["Sacred Bodhi Tree", "Ruwanwelisaya Stupa", "Royal Palace", "Moonstone Art"],
    image: "https://i.pinimg.com/originals/aa/42/01/aa420128b3407ef845e54fbf341cf4bf.jpg",
    includes: ["Transport", "Guide", "Entry Tickets", "Hotel"],
  },
  {
    id: 4, title: "Upcountry Waterfalls & Nine Arch Bridge", location: "Ella · Nuwara Eliya",
    category: "Hill Country", duration: "4 Days", groupSize: "2–12", price: 135,
    badge: "Popular", badgeType: "popular", rating: 4.9, reviews: 248,
    description: "Ride the iconic blue train across the Nine Arch Bridge, chase Ravana and Diyaluma waterfalls, hike Little Adam's Peak, and breathe cool misty hill air.",
    highlights: ["Nine Arch Bridge", "Blue Train", "Ravana Falls", "Tea Estate"],
    image: "https://srilankatravelnotes.com/wp-content/uploads/2023/08/p73619-Exploring-the-Beauty-of-Sri-Lanka_-Must-Visit-Places-in-2023-f8acc45af9-753444330.jpg",
    includes: ["Train Tickets", "Guide", "Meals", "Hill Hotel"],
  },
  {
    id: 5, title: "Galle Fort & Southern Coast", location: "Galle · Unawatuna · Mirissa",
    category: "Beach", duration: "3 Days", groupSize: "2–12", price: 115,
    badge: "Featured", badgeType: "featured", rating: 4.8, reviews: 174,
    description: "Stroll the 17th-century Dutch ramparts of Galle Fort, relax on golden beaches, watch blue whales off Mirissa, and explore vibrant coral reefs.",
    highlights: ["Dutch Fort", "Whale Watching", "Snorkeling", "Beach Sunset"],
    image: "https://digitaltravelcouple.com/wp-content/uploads/2020/01/hikkaduwa-beach-drone-1.jpg",
    includes: ["Transport", "Guide", "Boat Trip", "Beach Hotel"],
  },
  {
    id: 6, title: "Yala Wildlife Safari", location: "Yala National Park · Hambantota",
    category: "Wildlife", duration: "3 Days", groupSize: "2–8", price: 129,
    badge: "Thrilling", badgeType: "thrilling", rating: 4.9, reviews: 131,
    description: "Yala holds the world's highest density of leopards. Dawn and dusk jeep safaris, elephants, sloth bears, crocodiles, peacocks and rare endemic birds.",
    highlights: ["Leopard Safari", "Elephant Herds", "Sloth Bear", "Bird Watching"],
    image: "https://img.traveltriangle.com/apac/attachments/pictures/840613/original/Leopard_in_Yala_National_Park_1.jpg",
    includes: ["Jeep Safari", "Park Fees", "Guide", "Safari Lodge"],
  },
];

const CATEGORIES = ["All", "Cultural", "Nature", "Hill Country", "Beach", "Wildlife"];

// ─────────────────────────────────────────────────────────────────────────────
// MOCK USER STORE  (replace with real auth in production)
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_USERS = [{ email: "demo@srilanka.lk", password: "demo123", name: "Kasun" }];

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
const IPin   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IClock = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IUsers = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ICheck = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IStar  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;


// ─────────────────────────────────────────────────────────────────────────────
// PACKAGE CARD
// ─────────────────────────────────────────────────────────────────────────────
function PackageCard({ pkg, onView, onBook, user }) {
  const [wish, setWish] = useState(false);
  const navigate = useNavigate();

  const handleBookingClick = () => {
    if (!user) {
      navigate('/login');
    } else {
      onBook(pkg);
    }
  };

  return (
    <div className="pkg-card">
      <div className="pkg-img-wrap">
        <img src={pkg.image} alt={pkg.title} loading="lazy" />
        <span className={`pkg-badge pkg-badge--${pkg.badgeType}`}>{pkg.badge}</span>
        <div className="pkg-cat-pill">{pkg.category}</div>
      </div>
      <div className="pkg-body">
        <div className="pkg-rating">
          <span className="pkg-stars"><IStar />{pkg.rating}</span>
          <span className="pkg-rev">({pkg.reviews} reviews)</span>
        </div>
        <div className="pkg-loc"><IPin />{pkg.location}</div>
        <h3 className="pkg-title">{pkg.title}</h3>
        <p className="pkg-desc">{pkg.description}</p>
        <div className="pkg-meta">
          <span className="pkg-meta-item"><IClock />{pkg.duration}</span>
          <span className="pkg-meta-item"><IUsers />{pkg.groupSize} pax</span>
        </div>
        <div className="pkg-tags">{pkg.highlights.map(h => <span key={h} className="pkg-tag">{h}</span>)}</div>
        <div className="pkg-includes">{pkg.includes.map(i => <span key={i} className="pkg-include"><ICheck />{i}</span>)}</div>
        <div className="pkg-footer">
          <div className="pkg-price">
            <span className="pkg-price-label">From</span>
            <span className="pkg-price-val">${pkg.price}<span className="pkg-price-sub"> / person</span></span>
          </div>
          <button 
            className="pkg-btn" 
            onClick={user ? () => onBook(pkg) : () => navigate('/login')}
          >
            {user ? 'Book This Package' : 'Login to Book'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DETAIL MODAL
// ─────────────────────────────────────────────────────────────────────────────
function DetailModal({ pkg, onClose, user, onBook }) {
  const navigate = useNavigate();

  const handleBook = () => {
    if (!user) {
      navigate('/login');
      onClose();
    } else {
      onBook(pkg);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box detail-modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="detail-hero">
          <img src={pkg.image} alt={pkg.title} />
          <div className="detail-hero-overlay">
            <span className={`pkg-badge pkg-badge--${pkg.badgeType}`}>{pkg.badge}</span>
            <h2>{pkg.title}</h2>
            <div className="detail-loc"><IPin />{pkg.location}</div>
          </div>
        </div>
        <div className="detail-body">
          <div className="detail-stats">
            <div className="dstat"><span className="dstat-val">{pkg.duration}</span><span className="dstat-lbl">Duration</span></div>
            <div className="dstat"><span className="dstat-val">{pkg.groupSize}</span><span className="dstat-lbl">Group Size</span></div>
            <div className="dstat"><span className="dstat-val">{pkg.rating} ★</span><span className="dstat-lbl">{pkg.reviews} Reviews</span></div>
            <div className="dstat"><span className="dstat-val">${pkg.price}</span><span className="dstat-lbl">Per Person</span></div>
          </div>
          <p className="detail-desc">{pkg.description}</p>
          <div className="detail-section"><h4>Highlights</h4><div className="pkg-tags">{pkg.highlights.map(h => <span key={h} className="pkg-tag">{h}</span>)}</div></div>
          <div className="detail-section"><h4>Included</h4><div className="detail-includes">{pkg.includes.map(i => <span key={i} className="detail-include"><ICheck />{i}</span>)}</div></div>
          <button className="pkg-btn detail-book-btn" onClick={handleBook}>
            {user ? 'Book This Package →' : 'View Details →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── helpers (keep yours or import from utils) ──────────────────────
function formatUSD(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function calcTotal(pkg, adults, children) {
  const base = pkg.price ?? 0;
  // 2 children = 1 adult equivalent
  const childEquivalent = Math.floor(children / 2);
  return base * (adults + childEquivalent);
}
const languages = {
  en: { name: "English" },
  si: { name: "Sinhala" },
  ta: { name: "Tamil" },
  fr: { name: "French" },
  de: { name: "German" },
  es: { name: "Spanish" },
  zh: { name: "Chinese" },
  ja: { name: "Japanese" }
};
// ──────────────────────────────────────────────────────────────────
//

//}
function BookingModal({ pkg, user, onClose }) {
  const [formData, setFormData] = useState({
    passportNumber: "",
    preferredLanguage: "English",
    adults: 1,
    children: 0,
    travelDate: "",
    needsAirportPickup: false,
    arrivalDate: "",
    arrivalTime: "",
    flightNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // clear error like Register
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  //  VALIDATION 
  const validateForm = () => {
    const newErrors = {};

    if (!formData.passportNumber.trim())
      newErrors.passportNumber = "Required";

    if (!formData.travelDate)
      newErrors.travelDate = "Required";

    if (formData.needsAirportPickup) {
      if (!formData.arrivalDate)
        newErrors.arrivalDate = "Required";

      if (!formData.arrivalTime)
        newErrors.arrivalTime = "Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const adults = Math.max(1, parseInt(formData.adults) || 1);
  const children = Math.max(0, parseInt(formData.children) || 0);
  const childEquivalent = Math.floor(children / 2);
  const totalPersons = adults + childEquivalent;
  const total = calcTotal(pkg, adults, children);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      await addDoc(collection(db, "booked_packages"), {
        passport_no: formData.passportNumber,
        language: formData.preferredLanguage,
        no_persons: totalPersons,
        travel_date: formData.travelDate,
        arrival_date: formData.needsAirportPickup ? formData.arrivalDate : "",
        arrival_time: formData.needsAirportPickup ? formData.arrivalTime : "",
        package_name: pkg.title,
        user_email: user?.email || "",
        adults,
        children,
        total_amount: total,
        flight_number: formData.flightNumber || "",
        created_at: new Date(),
      });

      setSubmitted(true);
      setIsSubmitting(false);

      setTimeout(() => {
        onClose();
        setSubmitted(false);
      }, 2500);

    } catch (error) {
      console.error("Error saving booking:", error);
      alert("Failed to save booking");
      setIsSubmitting(false);
    }
  };

  // ── Success state ──
  if (submitted) {
    return (
      <div
        className="modal-overlay"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="modal-box booking-modal">
          <div className="success-box">
            <div className="success-icon">✓</div>
            <h3>Booking Confirmed!</h3>
            <div className="success-summary">
              {pkg.title} · {adults} adult{adults !== 1 ? "s" : ""}
              {children > 0 ? ` · ${children} children` : ""} ·{" "}
              {formatUSD(total)}
            </div>
            <p>Confirmation will be sent to {user?.email}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Main modal ──
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box booking-modal">

        <div className="booking-header">
          <div>
            <h3>Complete Your Booking</h3>
            <p className="booking-pkg-title">{pkg.title}</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form className="booking-form" onSubmit={handleSubmit}>

          {/* Passport */}
          <div className="form-group">
            <label>
              Passport Number <span className="req">*</span>
            </label>
            <input
              type="text"
              name="passportNumber"
              placeholder="e.g. N1234567"
              value={formData.passportNumber}
              onChange={handleChange}
            />
            {errors.passportNumber && (
              <small className="error-text">{errors.passportNumber}</small>
            )}
          </div>

          {/* Travellers */}
          <div className="form-row">
            <div className="form-group">
              <label>Adults <span className="req">*</span></label>
              <input
                type="number"
                name="adults"
                min="1"
                value={formData.adults}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Children</label>
              <input
                type="number"
                name="children"
                min="0"
                value={formData.children}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Travel date + Language */}
          <div className="form-row">
            <div className="form-group">
              <label>
                Travel Date <span className="req">*</span>
              </label>
              <input
                type="date"
                name="travelDate"
                value={formData.travelDate}
                onChange={handleChange}
              />
              {errors.travelDate && (
                <small className="error-text">{errors.travelDate}</small>
              )}
            </div>

            <div className="form-group">
              <label>Preferred Language</label>
              <select
                name="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={handleChange}
              >
                <option>English</option>
                <option>German</option>
                <option>Spanish</option>
                <option>Chinese</option>
                <option>Japanese</option>
                <option>Arabic</option>
                <option>Hindi</option>
                <option>Korean</option>
              </select>
            </div>
          </div>

          <div className="form-divider" />

          {/* Airport toggle */}
          <div className="airport-toggle-card">
            <label>
              <input
                type="checkbox"
                name="needsAirportPickup"
                checked={formData.needsAirportPickup}
                onChange={handleChange}
              />
              <div className="airport-toggle-label">
                <strong>Airport Pickup</strong>
                <span>Add a pickup from Bandaranaike International Airport</span>
              </div>
            </label>
          </div>

          {/* Airport details */}
          {formData.needsAirportPickup && (
            <div className="airport-detail-panel">
              <p className="panel-title">✈ Arrival Details</p>

              <div className="form-row">
                <div className="form-group">
                  <label>Arrival Date <span className="req">*</span></label>
                  <input
                    type="date"
                    name="arrivalDate"
                    value={formData.arrivalDate}
                    onChange={handleChange}
                  />
                  {errors.arrivalDate && (
                    <small className="error-text">{errors.arrivalDate}</small>
                  )}
                </div>

                <div className="form-group">
                  <label>Arrival Time <span className="req">*</span></label>
                  <input
                    type="time"
                    name="arrivalTime"
                    value={formData.arrivalTime}
                    onChange={handleChange}
                  />
                  {errors.arrivalTime && (
                    <small className="error-text">{errors.arrivalTime}</small>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Flight Number</label>
                <input
                  type="text"
                  name="flightNumber"
                  placeholder="e.g. UL 224"
                  value={formData.flightNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="pkg-btn booking-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting…" : `Confirm Booking · ${formatUSD(total)}`}
          </button>

        </form>
      </div>
    </div>
  );
}

//export default BookingModal;
// ─────────────────────────────────────────────────────────────────────────────
// AUTH MODAL  (Login / Register)
// ─────────────────────────────────────────────────────────────────────────────
function AuthModal({ onClose, onAuth }) {
  const [mode, setMode]   = useState("login"); // "login" | "register"
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [err, setErr]     = useState("");

  const submit = () => {
    setErr("");
    if (!email || !pass) { setErr("Please fill in all fields."); return; }
    if (mode === "register") {
      if (!name) { setErr("Please enter your name."); return; }
      if (pass.length < 6) { setErr("Password must be at least 6 characters."); return; }
      // In real app: call API. Here we just accept and log in.
      onAuth({ name, email });
    } else {
      const user = MOCK_USERS.find(u => u.email === email && u.password === pass);
      if (!user) { setErr("Invalid email or password. Try demo@srilanka.lk / demo123"); return; }
      onAuth({ name: user.name, email: user.email });
    }
  };


}



//────────────────────────────────────────────────────────────────────────────
export default function Packages({ user }) {
  const [filter, setFilter]     = useState("All");
  const [viewPkg, setViewPkg]   = useState(null);
  const [bookingPkg, setBookingPkg] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  const filtered = filter === "All" ? PACKAGES : PACKAGES.filter(p => p.category === filter);

  return (
    <section className="packages-section">

      <div className="pkg-section-header">
        {/* <span className="eyebrow">🇱🇰 Pearl of the Indian Ocean</span> */}
        <h2><em>Travel Packages</em></h2>
        <p>From ancient kingdoms and misty highlands to golden beaches and wild safaris handcrafted journeys across the most beautiful island on earth.</p>
      </div>

      <div className="pkg-filters">
        {CATEGORIES.map(c => (
          <button key={c} className={`filter-btn ${filter === c ? "active" : ""}`} onClick={() => setFilter(c)}>{c}</button>
        ))}
      </div>

      <div className="pkg-container">
        <div className="pkg-grid">
          {filtered.map(pkg => <PackageCard key={pkg.id} pkg={pkg} onView={setViewPkg} onBook={setBookingPkg} user={user} />)}
        </div>
      </div>

      {/* Modals */}
      {viewPkg   && <DetailModal   pkg={viewPkg} onClose={() => setViewPkg(null)} user={user} onBook={setBookingPkg} />}
      {bookingPkg && user && <BookingModal pkg={bookingPkg} user={user} onClose={() => setBookingPkg(null)} />}

    </section>
  );
}