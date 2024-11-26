import React from "react";
import Button from "@mui/material/Button";
import { Stack } from "@mui/material";

interface PlayerProps {
  accessToken: string;
}

function Player({ accessToken }: PlayerProps) {
  const [player, setPlayer] = React.useState(undefined);
  const [deviceId, setDeviceId] = React.useState(undefined);

  React.useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    let pl;

    window["onSpotifyWebPlaybackSDKReady"] = () => {
      const player = new window.Spotify.Player({
        name: "Web Playback SDK",
        getOAuthToken: (cb) => {
          cb(accessToken);
        },
        volume: 0.5,
      });

      setPlayer(player);

      player.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
        setDeviceId(device_id);
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
        setDeviceId((d) => {
          if (device_id === d) return undefined;
          return d;
        });
      });

      player.connect();
      window["_player"] = player;
      pl = player;
    };

    return () => {
      if (pl) pl.disconnect();
    };
  }, []);

  const handlePlay = async () => {
    player.togglePlay();
  };

  const handlePickMusic = () => {
    // Function to start playback using Spotify Web API
    const startPlayback = async (deviceId: string) => {
      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: ["spotify:track:7xGfFoTpQ2E7fRF5lN10tr"], // Example track URI
          }),
        }
      );
    };

    startPlayback(deviceId);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Stack spacing={2}>
        <Button variant="contained" onClick={handlePlay}>
          Toggle Play
        </Button>

        <Button variant="contained" onClick={handlePickMusic}>
          Pick Music
        </Button>
      </Stack>
    </div>
  );
}

export default Player;
