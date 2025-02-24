import { PlayArrow, Replay } from "@mui/icons-material";
import {
  Alert,
  FormControl,
  Grid2,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import React from "react";

interface PlayerProps {
  accessToken: string;
}

const TRACK_ITEM_EXAMPLE = {
  added_at: "2020-09-05T17:36:09Z",
  added_by: {
    external_urls: {
      spotify: "https://open.spotify.com/user/12165988862",
    },
    href: "https://api.spotify.com/v1/users/12165988862",
    id: "12165988862",
    type: "user",
    uri: "spotify:user:12165988862",
  },
  is_local: false,
  primary_color: null,
  track: {
    preview_url: null,
    explicit: false,
    type: "track",
    episode: false,
    track: true,
    album: {
      type: "album",
      album_type: "album",
      href: "https://api.spotify.com/v1/albums/20dajOAVyBvhLXxjE6UHcu",
      id: "20dajOAVyBvhLXxjE6UHcu",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab67616d0000b273f4fb6b34d657bf8db2968f04",
          width: 640,
        },
        {
          height: 300,
          url: "https://i.scdn.co/image/ab67616d00001e02f4fb6b34d657bf8db2968f04",
          width: 300,
        },
        {
          height: 64,
          url: "https://i.scdn.co/image/ab67616d00004851f4fb6b34d657bf8db2968f04",
          width: 64,
        },
      ],
      name: '"Ribbon" Singles Complete',
      release_date: "2007",
      release_date_precision: "year",
      uri: "spotify:album:20dajOAVyBvhLXxjE6UHcu",
      artists: [
        {
          external_urls: {
            spotify: "https://open.spotify.com/artist/0FqsOs6Hgnv2xydqQSYn15",
          },
          href: "https://api.spotify.com/v1/artists/0FqsOs6Hgnv2xydqQSYn15",
          id: "0FqsOs6Hgnv2xydqQSYn15",
          name: "Ribbon",
          type: "artist",
          uri: "spotify:artist:0FqsOs6Hgnv2xydqQSYn15",
        },
      ],
      external_urls: {
        spotify: "https://open.spotify.com/album/20dajOAVyBvhLXxjE6UHcu",
      },
      total_tracks: 27,
    },
    artists: [
      {
        external_urls: {
          spotify: "https://open.spotify.com/artist/0FqsOs6Hgnv2xydqQSYn15",
        },
        href: "https://api.spotify.com/v1/artists/0FqsOs6Hgnv2xydqQSYn15",
        id: "0FqsOs6Hgnv2xydqQSYn15",
        name: "Ribbon",
        type: "artist",
        uri: "spotify:artist:0FqsOs6Hgnv2xydqQSYn15",
      },
    ],
    disc_number: 1,
    track_number: 1,
    duration_ms: 252026,
    external_ids: {
      isrc: "JPPC08905420",
    },
    external_urls: {
      spotify: "https://open.spotify.com/track/4DtbQ1f4zaixwrZqfQ9EL9",
    },
    href: "https://api.spotify.com/v1/tracks/4DtbQ1f4zaixwrZqfQ9EL9",
    id: "4DtbQ1f4zaixwrZqfQ9EL9",
    name: "Little☆Date",
    popularity: 30,
    uri: "spotify:track:4DtbQ1f4zaixwrZqfQ9EL9",
    is_local: false,
  },
  video_thumbnail: {
    url: null,
  },
};
type GetTrackItem = typeof TRACK_ITEM_EXAMPLE;
type PlaylistTracks = { items: GetTrackItem[] };

function Player({ accessToken }: PlayerProps) {
  const [deviceId, setDeviceId] = React.useState(undefined);
  const [error, setError] = React.useState([]);
  const [devices, setDevices] = React.useState();
  const [playlist, setPlaylist] = React.useState<PlaylistTracks>();
  const [reloadDevicesCount, setReloadDevicesCount] = React.useState(0);

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
          return data.devices;
        });
      } catch (error) {
        setError((x) => x.concat("Failed to fetch devices: " + error.message));
      }
    };

    fetchDevices();
  }, [accessToken, reloadDevicesCount]);

  return (
    <>
      <Paper
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "10px",
        }}
        elevation={3}
      >
        <Grid2 container alignItems={"center"}>
          <Grid2 size={8}>
            <FormControl fullWidth>
              <InputLabel id="player-select-label">Player</InputLabel>
              <Select
                labelId="player-select-label"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                label="Player"
              >
                {devices?.map((device) => (
                  <MenuItem key={device.id} value={device.id}>
                    {device.name} ({device.type})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid2>
          <Grid2 size={4}>
            <Button
              type="button"
              fullwidth
              onClick={() => setReloadDevicesCount((i) => i + 1)}
            >
              <Replay />
            </Button>
          </Grid2>
        </Grid2>
      </Paper>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Stack spacing={2} width={300}>
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

          {!playlist ? (
            <PlaylistPicker
              accessToken={accessToken}
              setPlaylist={setPlaylist}
              setError={setError}
            />
          ) : (
            <>
              <Grid2 container alignItems={"center"}>
                <Grid2 size={4}>
                  <Typography>Tracks: {playlist?.items?.length}</Typography>
                </Grid2>
                <Grid2 size={4}>
                  <Button
                    type="button"
                    fullwidth
                    onClick={() => setPlaylist(null)}
                  >
                    Unload
                  </Button>
                </Grid2>
              </Grid2>

              <TrackPicker
                tracks={playlist?.items}
                deviceId={deviceId}
                accessToken={accessToken}
              />
            </>
          )}
        </Stack>
      </div>
    </>
  );
}

const PlaylistPicker = ({ accessToken, setPlaylist, setError }) => {
  // reads music list from spotify playlist
  const handleSubmit = (e) => {
    e.preventDefault();
    (async () => {
      const playlistId = e.target.playlistId.value;
      try {
        const response = await fetch(
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await response.json();
        if (data?.error?.message) {
          setError((x) => x.concat(data?.error?.message));
          return;
        }
        setPlaylist(data);
        console.log(data);
      } catch (error) {
        setError((x) => x.concat("Failed to fetch playlist: " + error.message));
      }
    })();
  };

  const [playlists, setPlaylists] = React.useState([]);
  React.useEffect(() => {
    (async () => {
      try {
        const response = await fetch(
          `https://api.spotify.com/v1/me/playlists`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await response.json();
        if (data?.error?.message) {
          setError((x) => x.concat(data?.error?.message));
          return;
        }
        setPlaylists(data.items);
      } catch (error) {
        setError((x) => x.concat("Failed to fetch playlist: " + error.message));
      }
    })();
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="row" spacing={1}>
        <FormControl fullWidth>
          <InputLabel id="playlist-select-label">Playlist</InputLabel>
          <Select
            labelId="playlist-select-label"
            label="Playlist"
            name="playlistId"
          >
            {playlists?.map((playlist) => (
              <MenuItem key={playlist.id} value={playlist.id}>
                {playlist.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" size="large">
          <PlayArrow />
        </Button>
      </Stack>
    </form>
  );
};

const TrackPicker = ({
  tracks,
  accessToken,
  deviceId,
}: {
  tracks: GetTrackItem[];
  accessToken;
  deviceId;
}) => {
  const [pickedTracks, setPickedTracks] = React.useState<GetTrackItem[]>([]);
  const [currentTrack, setCurrentTrack] = React.useState<GetTrackItem>();
  const [hideTrack, setHideTrack] = React.useState(false);

  const pickARandomTrack = () => {
    const track = tracks[Math.floor(Math.random() * tracks.length)];
    setPickedTracks((x) => x.concat(track));
    setHideTrack(true);
    setCurrentTrack(track);
    const musicUri = track.track.uri;
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
  };

  if (currentTrack) {
    return (
      <Stack spacing={2} alignItems={"center"}>
        <Paper
          sx={{
            width: 240,
            height: 240,
            display: "flex",
            backgroundImage: hideTrack
              ? undefined
              : currentTrack?.track?.album?.images?.[0]?.url
              ? `url(${currentTrack?.track?.album?.images?.[0]?.url})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            alignItems: "stretch",
            justifyContent: "stretch",
          }}
        >
          {hideTrack ? (
            <Button
              type="button"
              sx={{ flexGrow: 1, alignSelf: "stretch" }}
              onClick={() => setHideTrack(false)}
            >
              Reveal
            </Button>
          ) : (
            <div
              style={{
                backgroundColor: "rgba(0,0,0,0.5)",
                color: "white",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                flexGrow: 1,
                alignSelf: "stretch",
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              <Typography>
                {currentTrack?.track?.artists?.map((r) => r.name).join(", ")}
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: "4em" }}>
                {currentTrack?.track?.album?.release_date?.substring(0, 4)}
              </Typography>
              <Typography>{currentTrack?.track?.name}</Typography>
            </div>
          )}
        </Paper>
        <Button
          fullWidth
          color="success"
          size="large"
          disabled={!deviceId}
          onClick={() => {
            pickARandomTrack();
          }}
        >
          Próxima música
        </Button>
      </Stack>
    );
  }

  return (
    <>
      <Button
        fullWidth
        color="success"
        size="large"
        variant="contained"
        disabled={!deviceId}
        onClick={() => {
          pickARandomTrack();
        }}
      >
        Start
      </Button>
    </>
  );
};

export default Player;
