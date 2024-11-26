import React from "react";
import Button from "@mui/material/Button";
import { Alert, MenuItem, Select, Stack } from "@mui/material";
import QRCodeScanner from "./QRCodeScanner";

interface PlayerProps {
  accessToken: string;
}

function Player({ accessToken }: PlayerProps) {
  const [player, setPlayer] = React.useState(undefined);
  const [thisPageDeviceId, setThisPageDeviceId] = React.useState(undefined);
  const [deviceId, setDeviceId] = React.useState(undefined);
  const [qrReader, setQrReader] = React.useState(false);
  const [error, setError] = React.useState([]);
  const [devices, setDevices] = React.useState();
  const [currentUri, setCurrentUri] = React.useState();

  React.useEffect(() => {
    // start web player
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
        setDeviceId(device_id);
        setThisPageDeviceId(device_id);
      });

      player.addListener("not_ready", ({ device_id }) => {
        setDeviceId((d) => {
          if (device_id === d) return undefined;
        });
        setThisPageDeviceId((d) => {
          if (device_id === d) return undefined;
        });
      });

      player.on("initialization_error", ({ message }) => {
        setError((x) => x.concat("initialization_error: " + message));
      });
      player.on("authentication_error", ({ message }) => {
        setError((x) => x.concat("authentication_error: " + message));
      });
      player.on("account_error", ({ message }) => {
        setError((x) => x.concat("account_error: " + message));
      });
      player.on("playback_error", ({ message }) => {
        setError((x) => x.concat("playback_error: " + message));
      });

      player.connect();
      window["_player"] = player;
      pl = player;
    };

    return () => {
      if (pl) pl.disconnect();
    };
  }, []);

  React.useEffect(() => {
    // fetch devices
    const fetchDevices = async () => {
      try {
        const response = await fetch(
          "https://api.spotify.com/v1/me/player/devices",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await response.json();
        if (data?.error?.message) {
          setError((x) => x.concat(data?.error?.message));
        }
        setDevices(() => {
          if (!data.devices) return [];
          if (thisPageDeviceId) {
            if (!data.devices.find((d) => d.id === thisPageDeviceId)) {
              return [
                { id: thisPageDeviceId, name: "This App", type: "SDK" },
              ].concat(data.devices);
            }
          }
          return data.devices;
        });
      } catch (error) {
        setError((x) => x.concat("Failed to fetch devices: " + error.message));
      }
    };

    fetchDevices();
  }, [accessToken, thisPageDeviceId]);

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
              setCurrentUri(`spotify:track:${trackId}`);
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
      <Stack spacing={2} sx={{ width: 300 }}>
        {error?.length > 0 && (
          <Alert severity="error">
            {error?.map((e) => (
              <>
                {e}
                <br />
              </>
            ))}
          </Alert>
        )}

        <Select value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
          {devices?.map((device) => (
            <MenuItem key={device.id} value={device.id}>
              {device.name} ({device.type})
            </MenuItem>
          ))}
        </Select>

        <Button
          variant="contained"
          onClick={handlePlay}
          disabled={!deviceId || !currentUri}
        >
          Pause/Play
        </Button>

        <Button
          variant="contained"
          onClick={() => {
            setQrReader(true);
          }}
        >
          Pick Music
        </Button>
      </Stack>
    </div>
  );
}

export default Player;
