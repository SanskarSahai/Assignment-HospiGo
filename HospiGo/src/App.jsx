import React, { useState, useEffect, useRef } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  getAuth,
  signOut,
} from "firebase/auth";
import { initializeApp } from "firebase/app";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { LoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import Lottie from "react-lottie";
import animationData from "./assets/map.json";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";

// Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
// 🔹 Global AppBar Component
function AppBarComponent() {
  return (
    <AppBar position="fixed" sx={{ width: "100%", left: 0, top: 0 }}>
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu">
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Hospital Finder
        </Typography>
        <Button color="inherit">Login</Button>
      </Toolbar>
    </AppBar>
  );
}

// 🔹 Home Page Component
function Home() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        paddingTop: "64px",
        textAlign: { xs: "center", md: "left" },
      }}
    >
      {/* Left Section - Text */}
      <Box sx={{ flex: 1, padding: "20px" }}>
        <Typography variant="h4">Let's see what's nearby you</Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ marginTop: "10px" }}
          onClick={() => navigate("/login")}
        >
          Let's get started
        </Button>
      </Box>

      {/* Right Section - Animation */}
      <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <Lottie
          options={{ animationData, loop: true, autoplay: true }}
          height={300}
          width={300}
        />
      </Box>
    </Box>
  );
}

// 🔹 Login Page Component
function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      console.log("User logged in:", result.user);
      navigate("/map");
    } catch (error) {
      console.error("Login Failed", error);
      alert("Login failed: " + error.message);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "100px",
      }}
    >
      <Typography variant="h5" sx={{ marginBottom: "20px" }}>
        Login to Continue
      </Typography>
      <Button variant="contained" color="primary" onClick={handleLogin}>
        Login with Google
      </Button>
    </Box>
  );
}

// 🔹 Map Page Component
function MapView() {
  const [location, setLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
        },
        (error) => console.error("Error fetching location", error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  useEffect(() => {
    if (location && window.google) {
      const service = new window.google.maps.places.PlacesService(
        mapRef.current
      );
      const request = {
        location: new window.google.maps.LatLng(location.lat, location.lng),
        radius: 5000,
        type: ["hospital"],
      };
      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setHospitals(results);
        }
      });
    }
  }, [location]);

  return (
    <Box sx={{ width: "100vw", height: "100vh" }}>
      {location && (
        <LoadScript
          googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          libraries={["places"]}
        >
          <GoogleMap
            center={location}
            zoom={14}
            mapContainerStyle={{
              width: "100%",
              height: "90vh",
              marginTop: "64px",
            }}
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
        </LoadScript>
      )}
    </Box>
  );
}

// 🔹 Main App Component
export default function App() {
  return (
    <Router>
      {/* ✅ AppBar is now Global */}
      <AppBarComponent />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/map" element={<MapView />} />
      </Routes>
    </Router>
  );
}