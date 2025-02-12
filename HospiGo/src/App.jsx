import React, { useState, useEffect, useRef } from "react";
import { GoogleAuthProvider, signInWithPopup, getAuth, signOut } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { LoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import { AppBar, Toolbar, Typography, IconButton, Button, Grid, Paper, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import Lottie from "react-lottie";
import mapAnimation from "./assets/map.json";
import "./App.css";

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
  measurementId: process.env.measurementId
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

function App() {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const mapRef = useRef(null);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Login Failed", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setLocation(null);
    setHospitals([]);
  };

  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
        },
        (error) => console.error("Error fetching location", error),
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" className="app-bar">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Hospital Finder
          </Typography>
          <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Grid container spacing={3} className="grid-container">
        <Grid item xs={12} md={5}>
          <Paper elevation={3} className="paper-container">
            {user ? (
              <>
                <Typography variant="h6">Welcome, {user.displayName}</Typography>
                <Button variant="contained" color="error" className="btn" onClick={handleLogout}>
                  Logout
                </Button>
                <Button variant="contained" color="primary" className="btn" onClick={fetchLocation}>
                  Get My Location
                </Button>
              </>
            ) : (
              <Button variant="contained" color="primary" className="btn" onClick={handleLogin}>
                Login with Google
              </Button>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Lottie options={{ animationData: mapAnimation, loop: true, autoplay: true }} height={300} width={300} />
        </Grid>
      </Grid>

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
    </ThemeProvider>
  );
}

export default App;
