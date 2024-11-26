import React from "react";
import Button from "@mui/material/Button";
import { Stack } from "@mui/material";
import QRCodeScanner from "./QRCodeScanner";

interface PlayerProps {
  accessToken: string;
}

function Player({ accessToken }: PlayerProps) {
  const [player, setPlayer] = React.useState(undefined);
  const [deviceId, setDeviceId] = React.useState(undefined);
  const [qrReader, setQrReader] = React.useState(false);

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

  const handlePickMusic = (musicUri) => {
    if (musicUri && deviceId) {
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
              uris: [musicUri], // Example track URI
            }),
          }
        );
      };
      startPlayback(deviceId);
    }
  };

  if (qrReader) {
    return (
      <QRCodeScanner
        onScan={(code) => {
          setQrReader(false);
          if (code.startsWith("https://open.spotify.com/")) {
            const trackId = /track\/(\w{1,})/.exec(code)?.[1];
            if (trackId) {
              handlePickMusic(`spotify:track:${trackId}`);
            }
          }
        }}
      />
    );
  }

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
        <Button variant="contained" onClick={handlePlay} disabled={!deviceId}>
          Pause/Play
        </Button>

        <Button
          variant="contained"
          onClick={() => {
            setQrReader(true);
            // handlePickMusic("spotify:track:3BIf974vl0lIEo3EY1XvD1");
          }}
          disabled={!deviceId}
        >
          Pick Music
        </Button>
      </Stack>
    </div>
  );
}

export default Player;
