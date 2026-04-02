import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import './Style/Destinations.css';

const SL_BOUNDS = { minLat: 5.8, maxLat: 9.9, minLon: 79.5, maxLon: 81.9 };

const isInSriLanka = (lat, lon) =>
  lat >= SL_BOUNDS.minLat && lat <= SL_BOUNDS.maxLat &&
  lon >= SL_BOUNDS.minLon && lon <= SL_BOUNDS.maxLon;

const PHOTO_COUNT = 6;

// Wikimedia Commons image search — free, no API key, real photos
const fetchWikimediaPhotos = async (placeName) => {
  try {
    const query = encodeURIComponent(placeName + ' Sri Lanka');
    const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&gsrnamespace=6&gsrlimit=20&prop=imageinfo&iiprop=url|size&iiurlwidth=800&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data?.query?.pages;
    if (!pages) return [];

    return Object.values(pages)
      .filter(p => p.imageinfo?.[0]?.url)
      .filter(p => {
        const u = (p.imageinfo[0].thumburl || p.imageinfo[0].url).toLowerCase();
        return (u.includes('.jpg') || u.includes('.jpeg') || u.includes('.png') || u.includes('.webp'))
          && !u.includes('icon') && !u.includes('logo') && !u.includes('flag')
          && !u.includes('map') && !u.includes('seal') && !u.includes('symbol');
      })
      .map(p => p.imageinfo[0].thumburl || p.imageinfo[0].url)
      .slice(0, PHOTO_COUNT);
  } catch (err) {
    console.error('Wikimedia fetch error:', err);
    return [];
  }
};

// Fallback: pull images linked from the Wikipedia article for the place
const fetchWikipediaPageImages = async (placeName) => {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(placeName)}&prop=images&imlimit=20&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data?.query?.pages;
    if (!pages) return [];

    const imageNames = Object.values(pages)
      .flatMap(p => (p.images || []).map(img => img.title))
      .filter(t => {
        const l = t.toLowerCase();
        return (l.endsWith('.jpg') || l.endsWith('.jpeg') || l.endsWith('.png'))
          && !l.includes('icon') && !l.includes('logo') && !l.includes('flag') && !l.includes('map');
      })
      .slice(0, PHOTO_COUNT);

    if (!imageNames.length) return [];

    const infoUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(imageNames.join('|'))}&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json&origin=*`;
    const infoRes = await fetch(infoUrl);
    const infoData = await infoRes.json();
    const infoPages = infoData?.query?.pages;
    if (!infoPages) return [];

    return Object.values(infoPages)
      .filter(p => p.imageinfo?.[0]?.url)
      .map(p => p.imageinfo[0].thumburl || p.imageinfo[0].url)
      .slice(0, PHOTO_COUNT);
  } catch (err) {
    console.error('Wikipedia page images error:', err);
    return [];
  }
};

// Fallback: fetch from Unsplash (Google-like image search)
const fetchGoogleFallbackPhotos = async (placeName) => {
  try {
    const query = encodeURIComponent(placeName + ' Sri Lanka');
    const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=6&client_id=vhWBQ3b5jxEaYKBndKIRbYHe-q0oIgEQxLcD5Cwd2h4`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.results || data.results.length === 0) return [];
    
    return data.results
      .map(photo => photo.urls.regular || photo.urls.full)
      .slice(0, PHOTO_COUNT);
  } catch (err) {
    console.error('Unsplash fallback fetch error:', err);
    return [];
  }
};

const Destinations = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [mapKey, setMapKey] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (lightboxIdx === null) return;
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowRight') setLightboxIdx(i => (i + 1) % photos.length);
      if (e.key === 'ArrowLeft') setLightboxIdx(i => (i - 1 + photos.length) % photos.length);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [lightboxIdx, photos.length]);

  // Check for search query in URL params on mount
  

// THEN update the useEffect
useEffect(() => {
  const searchQuery_param = searchParams.get('search');
  if (!searchQuery_param) return;

  setSearchQuery(searchQuery_param);

  const autoSearch = async () => {
    setSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery_param)}&format=json&countrycodes=lk&limit=8&addressdetails=1&extratags=1`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'en', 'User-Agent': 'SriLankaTravelApp/1.0' }
      });
      const data = await res.json();
      const results = data
        .filter(p => isInSriLanka(parseFloat(p.lat), parseFloat(p.lon)))
        .map(p => ({
          id: p.place_id,
          name: p.display_name.split(',')[0],
          lat: parseFloat(p.lat),
          lon: parseFloat(p.lon),
          type: p.type || p.class || 'place',
          category: p.class || '',
          address: [p.address?.suburb, p.address?.city || p.address?.town || p.address?.village, p.address?.state].filter(Boolean).join(', '),
          wiki: p.extratags?.wikipedia,
          website: p.extratags?.website,
        }));

      if (results.length > 0) {
        const first = results[0];
        setSelectedPlace(first);
        setMapKey(k => k + 1);
        loadPhotos(first);
      }
    } catch (err) {
      console.error('Auto-search error:', err);
    } finally {
      setSearching(false);
    }
  };

  autoSearch();
}, [searchParams]); 

  const loadPhotos = async (place) => {
    setPhotosLoading(true);
    setPhotos([]);
    let imgs = await fetchWikimediaPhotos(place.name);
    if (imgs.length < 2) imgs = await fetchWikipediaPageImages(place.name);
    if (imgs.length === 0) imgs = await fetchGoogleFallbackPhotos(place.name);
    setPhotos(imgs);
    setPhotosLoading(false);
  };

  const fetchSuggestions = async (query) => {
    if (!query.trim()) { setSuggestions([]); setShowSuggestions(false); return; }
    setSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&countrycodes=lk&limit=8&addressdetails=1&extratags=1`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en', 'User-Agent': 'SriLankaTravelApp/1.0' } });
      const data = await res.json();
      const results = data
        .filter(p => isInSriLanka(parseFloat(p.lat), parseFloat(p.lon)))
        .map(p => ({
          id: p.place_id,
          name: p.display_name.split(',')[0],
          lat: parseFloat(p.lat),
          lon: parseFloat(p.lon),
          type: p.type || p.class || 'place',
          category: p.class || '',
          address: [p.address?.suburb, p.address?.city || p.address?.town || p.address?.village, p.address?.state].filter(Boolean).join(', '),
          wiki: p.extratags?.wikipedia,
          website: p.extratags?.website,
        }));
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleInput = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 350);
  };

  const handleSelect = (place) => {
    setSelectedPlace(place);
    setSearchQuery(place.name);
    setShowSuggestions(false);
    setMapKey(k => k + 1);
    loadPhotos(place);
  };

  
  const getTypeLabel = (type) => type?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Place';

  const mapSrc = selectedPlace
    ? `https://www.google.com/maps?q=${selectedPlace.lat},${selectedPlace.lon}&z=15&output=embed`
    : `https://www.google.com/maps?q=Sri+Lanka&z=8&output=embed`;

  return (
    <div className="destinations-page">
      {/* Hero */}
      <div className="dest-hero">
        <div className="dest-hero-content">
          <p className="dest-subtitle">Explore the Pearl of the Indian Ocean</p>
          <h1 className="dest-title"><em>Find Your Destination</em></h1>
          <div className="dest-search-wrapper" ref={wrapperRef}>
            <div className="dest-search-bar">
              <span className="search-icon"></span>
              <input
                type="text"
                placeholder="Search temples, beaches, cities in Sri Lanka…"
                value={searchQuery}
                onChange={handleInput}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                autoComplete="off"
              />
              {searching && <span className="search-spinner" />}
              {searchQuery && (
                <button className="clear-btn" onClick={() => { setSearchQuery(''); setSuggestions([]); setShowSuggestions(false); setSelectedPlace(null); setPhotos([]); }}>✕</button>
              )}
            </div>
            {showSuggestions && (
              <ul className="dest-suggestions">
                {suggestions.map(place => (
                  <li key={place.id} className="suggestion-item" onClick={() => handleSelect(place)}>
                     <div className="sug-text">
                      <span className="sug-name">{place.name}</span>
                      {place.address && <span className="sug-address">{place.address}</span>}
                    </div>
                    <span className="sug-type">{getTypeLabel(place.type)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="dest-main">
        <div className="dest-details-panel">
          {selectedPlace ? (
            <div className="place-card">
              <div className="place-card-header">
               
                <div>
                  <h2 className="place-name">{selectedPlace.name}</h2>
                  <span className="place-badge">{getTypeLabel(selectedPlace.type)}</span>
                </div>
              </div>

              {/* Photo Gallery */}
              <div className="place-photos">
                <div className="photos-label">Photos</div>
                {photosLoading ? (
                  <div className="photos-loading">
                    <span className="search-spinner" style={{ width: 22, height: 22 }} />
                    <span>Loading photos…</span>
                  </div>
                ) : photos.length > 0 ? (
                  <div className="photos-grid">
                    {photos.slice(0, PHOTO_COUNT).map((src, i) => (
                      <button
                        key={i}
                        className={`photo-thumb ${i === 0 ? 'photo-thumb--featured' : ''}`}
                        onClick={() => setLightboxIdx(i)}
                        aria-label={`View photo ${i + 1}`}
                      >
                       <img src={src} alt={`${selectedPlace.name} view ${i + 1}`} loading="lazy" />
                        <div className="photo-overlay"><span className="photo-expand-icon">⤢</span></div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="photos-empty">No photos found for this location.</div>
                )}
              </div>

              <div className="place-info-rows">
                {selectedPlace.address && (
                  <div className="info-row">
                    <span className="info-label">Location</span>
                    <span className="info-value">{selectedPlace.address}, Sri Lanka</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">Coordinates</span>
                  <span className="info-value">{selectedPlace.lat.toFixed(5)}, {selectedPlace.lon.toFixed(5)}</span>
                </div>
                {selectedPlace.category && (
                  <div className="info-row">
                    <span className="info-label">Category</span>
                    <span className="info-value">{getTypeLabel(selectedPlace.category)}</span>
                  </div>
                )}
                {selectedPlace.website && (
                  <div className="info-row">
                    <span className="info-label">Website</span>
                    <a href={selectedPlace.website} target="_blank" rel="noreferrer" className="info-link">Visit website ↗</a>
                  </div>
                )}
                {selectedPlace.wiki && (
                  <div className="info-row">
                    <span className="info-label">Wikipedia</span>
                    <a href={`https://en.wikipedia.org/wiki/${selectedPlace.wiki.replace('en:', '')}`} target="_blank" rel="noreferrer" className="info-link">Read more ↗</a>
                  </div>
                )}
              </div>

              <a
                className="directions-btn"
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lon}`}
                target="_blank" rel="noreferrer"
              >
               Get Directions
              </a>
            </div>
          ) : (
            <div className="empty-state">
              <h3>Search a destination</h3>
              <p>Type a beach, temple, city, or national park to see details, photos, and its location on the map.</p>
              <div className="suggestions-chips">
                {['Sigiriya', 'Galle Fort', 'Ella', 'Mirissa Beach', 'Kandy'].map(s => (
                  <button key={s} className="chip" onClick={() => { setSearchQuery(s); fetchSuggestions(s); }}>{s}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="dest-map-panel">
          <iframe
            key={mapKey}
            title="Google Map"
            src={mapSrc}
            width="100%"
            height="100%"
            style={{ border: 0, borderRadius: '16px' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && photos.length > 0 && (
        <div className="lightbox-overlay" onClick={() => setLightboxIdx(null)}>
          <button className="lightbox-close" onClick={() => setLightboxIdx(null)}>✕</button>
          <button className="lightbox-nav lightbox-nav--prev" onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i - 1 + photos.length) % photos.length); }}>‹</button>
          <div className="lightbox-img-wrap" onClick={e => e.stopPropagation()}>
            <img src={photos[lightboxIdx]} alt={`${selectedPlace?.name} photo ${lightboxIdx + 1}`} className="lightbox-img" />
            <div className="lightbox-caption">{selectedPlace?.name} · {lightboxIdx + 1} / {photos.length}</div>
          </div>
          <button className="lightbox-nav lightbox-nav--next" onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i + 1) % photos.length); }}>›</button>
        </div>
      )}
    </div>
  );
};

export default Destinations;