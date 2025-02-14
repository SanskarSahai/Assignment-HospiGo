//testing commits
import React, { useState, useEffect, useRef } from "react";
import { GoogleAuthProvider, signInWithPopup, getAuth, signOut } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { LoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import "./App.css"; // Importing CSS

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCpPASKG0D_HZWJMYY7w30QzCEluNLaWb8",
  authDomain: "hospigo-140c9.firebaseapp.com",
  projectId: "hospigo-140c9",
  storageBucket: "hospigo-140c9.firebasestorage.app",
  messagingSenderId: "847493570377",
  appId: "1:847493570377:web:63d6fd5ebf6800ca37c498",
  measurementId: "G-R6D3B37L9H"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";

function App() {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const mapRef = useRef(null);

  // Handle Google Login
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Login Failed", error);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setLocation(null);
    setHospitals([]);
  };

  // Get User Location
  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { lat: latitude, lng: longitude };
          setLocation(newLocation);
        },
        (error) => console.error("Error fetching location", error),
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Fetch Nearby Hospitals when location is set
  useEffect(() => {
    if (location && window.google) {
      const service = new window.google.maps.places.PlacesService(mapRef.current);

      const request = {
        location: new window.google.maps.LatLng(location.lat, location.lng),
        radius: 5000,
        type: ["hospital"],
      };

      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setHospitals(results);
        } else {
          console.error("Places API Error: ", status);
        }
      });
    }
  }, [location]);

  return (
    <div className="app-container">
      <h1>Hospital Finder</h1>
      {user ? (
        <div className="user-section">
          <p>Welcome, {user.displayName}</p>
          <button className="btn logout" onClick={handleLogout}>Logout</button>
          <button className="btn location" onClick={fetchLocation}>Get My Location</button>
        </div>
      ) : (
        <button className="btn login" onClick={handleLogin}>Login with Google</button>
      )}

      {location && (
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
          <div className="map-container">
            <GoogleMap
              center={location}
              zoom={14}
              mapContainerClassName="map"
              onLoad={(map) => (mapRef.current = map)}
            >
              <Marker position={location} />
              {hospitals.map((hospital, index) => (
                <Marker
                  key={index}
                  position={{
                    lat: hospital.geometry.location.lat(),
                    lng: hospital.geometry.location.lng(),
                  }}
                  title={hospital.name}
                />
              ))}
            </GoogleMap>
          </div>
        </LoadScript>
      )}
    </div>
  );
}

export default App;
