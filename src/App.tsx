import React from "react";
import { Button } from "@mui/material";
import PlaylistPlayer from "./PlaylistPlayer";

// Spotify OAuth configuration
const CLIENT_ID = "7d969b2eef6e4c14be8fa6981d47de08"; // Replace with your Spotify Client ID
const REDIRECT_URI = window.IS_SERVE
  ? "https://localhost:3000"
  : "https://spotify-controller-d1fc0.web.app"; // Replace with your redirect URI
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPE =
  "user-read-private user-read-email streaming app-remote-control user-read-playback-state user-modify-playback-state playlist-read-private playlist-read-collaborative"; // Add required scopes

const App = () => {
  const [token, setToken] = React.useState(() =>
    localStorage.getItem("spotify_access_token")
  );

  const handleLogin = () => {
    // Construct Spotify auth URL with required parameters
    const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;

    // Redirect to Spotify login
    window.location.href = authUrl;
  };
  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem("spotify_access_token");
    setToken(null);
  };

  React.useEffect(() => {
    // Extract token from URL hash after redirect
    const hash = window.location.hash;
    if (hash) {
      const token = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        ?.split("=")[1];

      if (token) {
        // Save token to localStorage
        localStorage.setItem("spotify_access_token", token);
        setToken(token);
        // Clear URL hash
        window.location.hash = "";
      }
    }
  }, []);

  if (token) {
    return (
      <div key="logged in">
        <div>
          <Button variant="contained" color="primary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
        <PlaylistPlayer accessToken={token} />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100dvh",
      }}
    >
      <Button variant="contained" color="primary" onClick={handleLogin}>
        Login with Spotify
      </Button>
    </div>
  );
};

export default App;
