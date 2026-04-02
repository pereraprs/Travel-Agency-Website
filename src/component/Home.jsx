import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import "./Style/Home.css";

const fullText = `Welcome to PEARL PASSAGE, where every journey becomes a story worth telling. Established in 1985, we have spent decades crafting unforgettable travel experiences for explorers from around the world. With a deep passion for discovery and a commitment to excellence, we specialize in creating personalized tours that showcase the true beauty, culture, and heritage of each destination.\n\nAt PEARL PASSAGE, we believe travel is more than just visiting places—it's about meaningful connections, authentic experiences, and lifelong memories. Our experienced guides and carefully curated itineraries ensure that every trip is seamless, safe, and truly enriching. Whether you seek adventure, relaxation, or cultural exploration, we are here to guide you every step of the way.\n\nLet PEARL PASSAGE be your trusted companion in discovering the world—one remarkable journey at a time.`;

const initialReviews = [
  {
    name: "Sarah Mitchell",
    rating: 5,
    text: "Pearl Passage made our Sri Lanka trip truly magical. Every detail was perfectly arranged — from the ancient temples to the lush tea estates. Absolutely unforgettable!"
  },
  {
    name: "James & Lena Kowalski",
    rating: 5,
    text: "We've traveled with many agencies, but Pearl Passage stands apart. Our guide was knowledgeable, warm, and genuinely passionate about Sri Lanka's culture. 10/10!"
  },
  {
    name: "Aiko Tanaka",
    rating: 4,
    text: "A beautifully curated itinerary with great attention to detail. The elephant sanctuary visit was a highlight. Would definitely book again for our next adventure."
  },
  {
    name: "David Okafor",
    rating: 5,
    text: "From Sigiriya to the southern beaches — every moment felt special. Pearl Passage truly understands what travelers need. Seamless, safe, and enriching."
  },
  {
    name: "Priya Nair",
    rating: 5,
    text: "As a solo traveler, safety was my top priority. Pearl Passage ensured I was comfortable at every step while still giving me authentic local experiences. Highly recommend!"
  },
  {
    name: "Tom & Rachel Brennan",
    rating: 4,
    text: "Our family trip to Sri Lanka was a dream come true thanks to Pearl Passage. The kids loved every moment, and we parents finally got to relax. Brilliant service!"
  }
];

const StarRating = ({ rating }) => (
  <div className="review-rating">
    {Array.from({ length: 5 }, (_, i) => (
      <span key={i}>{i < rating ? '★' : '☆'}</span>
    ))}
  </div>
);

function Home({ user }) {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [reviews, setReviews] = useState(initialReviews);
  const [formData, setFormData] = useState({ name: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const indexRef = useRef(0);

  // Load reviews from Firestore on mount
  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreReviews = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        rating: doc.data().rating,
        text: doc.data().comment
      }));
      if (firestoreReviews.length > 0) {
        setReviews([...firestoreReviews, ...initialReviews]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Pre-fill name if user is logged in
  useEffect(() => {
    if (user && user.fullName) {
      setFormData(prev => ({ ...prev, name: user.fullName }));
    }
  }, [user]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.comment.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        name: formData.name,
        rating: formData.rating,
        comment: formData.comment,
        timestamp: new Date(),
        userId: user?.uid || null
      });
      setFormData({ name: user?.fullName || '', rating: 5, comment: '' });
    } catch (error) {
      console.error('Error adding review:', error);
      alert('Error submitting review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  // Typing animation effect
  useEffect(() => {
    const typingInterval = setInterval(() => {
      if (indexRef.current < fullText.length) {
        setDisplayedText(fullText.slice(0, indexRef.current + 1));
        indexRef.current += 1;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => setShowCursor(false), 1000);
      }
    }, 18);

    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      clearInterval(typingInterval);
      clearInterval(cursorInterval);
    };
  }, []);

  const renderText = () => {
    return displayedText.split('\n\n').map((para, i) => (
      <React.Fragment key={i}>
        {para}
        {i < displayedText.split('\n\n').length - 1 && <><br /><br /></>}
      </React.Fragment>
    ));
  };

  return (
    <>
      {/* Hero / Intro Section */}
      <div className='home' id='home'>
        <h1 className='home-title'><em>Explor the Sri Lanka with PEARL PASSAGE</em></h1>
        <p>
          {renderText()}
          <span style={{
            display: 'inline-block',
            width: '2px',
            height: '1em',
            backgroundColor: '#BF7E58',
            marginLeft: '2px',
            verticalAlign: 'text-bottom',
            opacity: showCursor ? 1 : 0,
            transition: 'opacity 0.1s'
          }} />
        </p>
      </div>

      {/* Reviews Section */}
      <section className='reviews' id='reviews'>
        <h2 className='reviews-title'>What Our Travelers Say</h2>

        {/* Add Review Button - Only for logged-in users */}
        {user && (
          <button className='add-review-btn' onClick={() => setShowModal(true)}>
            <span className='plus-icon'>+</span>
          </button>
        )}

        {/* Review Modal */}
        {showModal && (
          <div className='modal-overlay' onClick={() => setShowModal(false)}>
            <div className='modal-content' onClick={(e) => e.stopPropagation()}>
              <button className='modal-close' onClick={() => setShowModal(false)}>×</button>
              <h3>Share Your Experience</h3>
              <form onSubmit={(e) => {
                handleReviewSubmit(e);
                setShowModal(false);
              }}>
                <div className='form-group'>
                  <label htmlFor='name'>Your Name</label>
                  <input
                    type='text'
                    id='name'
                    name='name'
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder='Your name'
                    required
                  />
                </div>
                <div className='form-group'>
                  <label htmlFor='rating'>Rating</label>
                  <div className='rating-selector'>
                    {[1, 2, 3, 4, 5].map(num => (
                      <button
                        key={num}
                        type='button'
                        className={`star-btn ${formData.rating >= num ? 'active' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, rating: num }))}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div className='form-group'>
                  <label htmlFor='comment'>Your Review</label>
                  <textarea
                    id='comment'
                    name='comment'
                    value={formData.comment}
                    onChange={handleFormChange}
                    placeholder='Share your travel experience...'
                    rows='4'
                    required
                  />
                </div>
                <button type='submit' className='submit-btn' disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          </div>
        )}

        <div className='reviews-container'>
          {reviews.map((review, index) => (
            <div className='review-card' key={review.id || index}>
              <div className='review-header'>
                <p className='review-name'>{review.name}</p>
                <StarRating rating={review.rating} />
              </div>
              <p className='review-text'>"{review.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Us Section */}
      <section className='about-us' id='about'>
        <div className='about-container'>
          <h2 className='about-title'>About PEARL PASSAGE</h2>
          <div className='about-content'>
            <div className='about-text'>
              <p>Founded in 1985, PEARL PASSAGE has been a leader in crafting extraordinary travel experiences for adventurers and explorers worldwide. With nearly four decades of expertise, we've perfected the art of creating journeys that blend comfort, culture, and discovery.</p>
              <p>Our mission is simple: to transform travel into unforgettable stories. We believe that every journey should be personal, authentic, and enriching revealing not just the sights, but the soul of each destination.</p>
            </div>
            <div className='about-highlights'>
              <div className='highlight-box'>
                <h3>Global Expertise</h3>
                <p>40+ years of experience in crafting world-class travel experiences across continents</p>
              </div>
              <div className='highlight-box'>
                <h3>Expert Guides</h3>
                <p>Passionate, knowledgeable local guides who share authentic stories and hidden gems</p>
              </div>
              <div className='highlight-box'>
                <h3>Personalized Journeys</h3>
                <p>Carefully curated itineraries tailored to your preferences and travel style</p>
              </div>
              <div className='highlight-box'>
                <h3>Safety First</h3>
                <p>Seamless, secure travel planning with 24/7 support and comprehensive care</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;