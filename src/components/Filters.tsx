import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Tabs, CheckboxField } from "@aws-amplify/ui-react";
import { Dropdown } from "react-bootstrap";

import TimeCapsule from "./TimeCapsule";
import Recommendations from "./Recommendations";

import { useSpotifyAuth } from "../hooks/useSpotifyAuth";
import { useError } from "../hooks/useError";
import { escapeHTML } from "../utils/escape";
import { buildSeasonMap, getSeasonRange, Season } from "../utils/dateUtils";
import { SpotifyPlaylist, SpotifyTrackItem } from "../types/spotify";

const PLAYLIST_ENDPOINT = "https://api.spotify.com/v1/me/playlists?limit=50";
const USER_ID_ENDPOINT = "https://api.spotify.com/v1/me";
const ADD_SONGS_TO_PLAYLIST = "https://api.spotify.com/v1/playlists";
const CREATE_CUSTOM_PLAYLIST = "https://api.spotify.com/v1/users";

type Genre =
  | "classical"
  | "hip-hop"
  | "chill"
  | "alternative"
  | "disco"
  | "afro-beat";

export interface DataTableRow {
  id: number;
  uri: string;
  name: string;
  artists: string;
  album: string;
  image: string;
  release_date: string;
  popularity: number;
  song_link: string;
}

const years = [2019, 2020, 2021, 2022];
const seasons: Season[] = ["Spring", "Summer", "Fall", "Winter"];
const genres: Genre[] = [
  "classical",
  "hip-hop",
  "chill",
  "alternative",
  "disco",
  "afro-beat",
];

const seasonMap = buildSeasonMap(years);

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const Filters: React.FC = () => {
  const token = useSpotifyAuth();
  const { error, reportError, clearError } = useError();

  const [userId, setUserId] = useState<string | null>(null);
  const [createdPlaylistId, setCreatedPlaylistId] = useState("");
  const [playlistName, setPlaylistName] = useState("");
  const [songLimit, setSongLimit] = useState(1);
  const [randomSongsLength, setRandomSongsLength] = useState(0);
  const [playlistURIs, setPlaylistURIs] = useState<string[]>([]);
  const [throwError, setThrowError] = useState(false);
  const [createdPlaylistIdsCount, setCreatedPlaylistIdsCount] = useState(0);

  const [year, setYear] = useState<number | "">("");
  const [season, setSeason] = useState<Season | "">("");

  const [userSongsList, setUserSongsList] = useState<string[]>([]);
  const [userArtistList, setUserArtistList] = useState<string[]>([]);
  const [userGenresArr, setUserGenresArr] = useState<Genre[]>([]);
  const [dataTableArr, setDataTableArr] = useState<DataTableRow[]>([]);
  const [recommendationsURI, setRecommendationsURI] = useState<string[]>([]);
  const [recommendationPlaylistName, setRecommendationPlaylistName] =
    useState("");
  const [recommendationPlaylistID, setRecommendationPlaylistID] =
    useState("");

  const [checkboxCounter, setCheckboxCounter] = useState(0);
  const [playlistNameDisabled, setPlaylistNameDisabled] = useState(true);
  const [createPlaylistDisabled, setCreatePlaylistDisabled] = useState(true);
  const [addSongsDisabled, setAddSongsDisabled] = useState(true);
  const [recommendationTabEnabled, setRecommendationTabEnabled] =
    useState(false);

  useEffect(() => {
    if (!token) return;

    async function fetchUserId() {
      try {
        const res = await axios.get(USER_ID_ENDPOINT, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserId(res.data.id);
      } catch {
        reportError("Failed to load Spotify user profile.");
      }
    }
    fetchUserId();
  }, [token, reportError]);

  useEffect(() => {
    async function loadCount() {
      try {
        const res = await axios.get<{ count: number }>(
          "http://localhost:8080/api/playlists/playlistIds"
        );
        setCreatedPlaylistIdsCount(res.data.count);
      } catch {}
    }
    loadCount();
  }, []);

  const dropDownSeasonComponent = useMemo(
    () =>
      seasons.map((s) => (
        <Dropdown.Item key={s} onClick={() => setSeason(s)}>
          {s}
        </Dropdown.Item>
      )),
    []
  );

  const dropDownOptionsComponent = useMemo(
    () =>
      years.map((y) => (
        <Dropdown.Item key={y} onClick={() => setYear(y)}>
          {y}
        </Dropdown.Item>
      )),
    []
  );

  const genreCheckboxComponent = useMemo(
    () =>
      genres.map((genre) => (
        <CheckboxField
          key={genre}
          size="small"
          label={genre}
          value={genre}
          name={genre}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const checked = e.target.checked;
            setUserGenresArr((prev) =>
              checked ? [...prev, genre] : prev.filter((g) => g !== genre)
            );
            setCheckboxCounter((c) => (checked ? c + 1 : c - 1));
          }}
        />
      )),
    []
  );

  const handleSongLimitAndRecommendation = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    clearError();
    if (!token) {
      reportError("Please log in with Spotify first.");
      return;
    }

    const raw = escapeHTML(e.target.value);
    const value = Number(raw);

    if (!value || value <= 0) {
      setSongLimit(0);
      setRecommendationTabEnabled(false);
      return;
    }

    const limit = Math.min(value, 100);
    setSongLimit(limit);

    if (year && season) {
      loadTimeCapsuleSongs(limit, year, season);
      setRecommendationTabEnabled(true);
    }
  };

  const loadTimeCapsuleSongs = async (
    limit: number,
    selectedYear: number,
    selectedSeason: Season
  ) => {
    if (!token) return;

    try {
      const playlists = await axios.get<{ items: SpotifyPlaylist[] }>(
        PLAYLIST_ENDPOINT,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const allTracks: SpotifyTrackItem[] = [];

      for (const playlist of playlists.data.items) {
        const tracksRes = await axios.get<{ items: SpotifyTrackItem[] }>(
          playlist.tracks.href,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        allTracks.push(...tracksRes.data.items);
      }

      setUserSongsList(allTracks.map((t) => t.track.id));
      setUserArtistList(
        allTracks.map((t) => t.track.artists[0]?.id).filter(Boolean)
      );

      const range = getSeasonRange(seasonMap, selectedYear, selectedSeason);
      if (!range) return;

      const from = Date.parse(range.start);
      const to = Date.parse(range.end);

      const filtered = allTracks.filter((t) => {
        const added = Date.parse(t.added_at);
        return added >= from && added <= to;
      });

      if (filtered.length === 0) {
        setThrowError(true);
        reportError("No songs found in this time period.");
        return;
      }

      const limited = shuffle(filtered).slice(0, limit);
      const uris = limited.map((t) => t.track.uri);

      setRandomSongsLength(uris.length);
      setPlaylistURIs(uris);
    } catch {
      reportError("Error fetching Spotify playlist data.");
    }
  };

  const handleCreatePlaylist = async () => {
    if (!token || !userId || !playlistName) return;

    try {
      const res = await axios.post(
        `${CREATE_CUSTOM_PLAYLIST}/${userId}/playlists`,
        {
          name: playlistName,
          description: "Time capsule playlist",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setCreatedPlaylistId(res.data.id);
      await savePlaylistId(res.data.id);
      alert("Playlist created!");
    } catch {
      reportError("Failed to create playlist.");
    }
  };

  const handleAddSongsToPlaylist = async () => {
    if (!token || !createdPlaylistId || playlistURIs.length === 0) return;

    try {
      const uris = playlistURIs.slice(0, Math.min(songLimit, 100));

      await axios.post(
        `${ADD_SONGS_TO_PLAYLIST}/${createdPlaylistId}/tracks`,
        { uris, position: 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      reportError("Failed to add songs.");
    }
  };

  const recommendationsUrl = useMemo(() => {
    if (!userSongsList.length || !userArtistList.length || !userGenresArr.length)
      return null;

    return (
      "https://api.spotify.com/v1/recommendations" +
      `?seed_artists=${userArtistList[0]}` +
      `&seed_genres=${userGenresArr.join(",")}` +
      `&seed_tracks=${userSongsList[0]}` +
      "&limit=20"
    );
  }, [userSongsList, userArtistList, userGenresArr]);

  const handleGetRecommendations = async () => {
    if (!token || !recommendationsUrl) return;

    try {
      const res = await axios.get(recommendationsUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rows: DataTableRow[] = res.data.tracks.map(
        (song: any, index: number) => ({
          id: index + 1,
          uri: song.uri,
          name: song.name,
          artists: song.artists.map((a: any) => a.name).join(", "),
          album: song.album.name,
          image: song.album.images?.[0]?.url,
          release_date: song.album.release_date,
          popularity: song.popularity,
          song_link: song.external_urls.spotify,
        })
      );

      setDataTableArr(rows);
    } catch {
      reportError("Could not load Spotify recommendations.");
    }
  };

  const setRecommendationsCallback = (ids: (string | number)[]) => {
    const selected = dataTableArr.filter((row) => ids.includes(row.id));
    setRecommendationsURI(selected.map((row) => row.uri));
  };

  const handleRecommendationPlaylistNameCallback = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRecommendationPlaylistName(escapeHTML(e.target.value));
  };

  const createRecommendationPlaylist = async () => {
    if (!token || !userId || !recommendationPlaylistName) return;

    try {
      const res = await axios.post(
        `${CREATE_CUSTOM_PLAYLIST}/${userId}/playlists`,
        {
          name: recommendationPlaylistName,
          description: "Recommendation playlist",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setRecommendationPlaylistID(res.data.id);
      await savePlaylistId(res.data.id);
      setAddSongsDisabled(false);
    } catch {
      reportError("Failed to create playlist.");
    }
  };

  const addSongsToRecommendationPlaylist = async () => {
    if (!token || !recommendationPlaylistID || !recommendationsURI.length)
      return;

    try {
      await axios.post(
        `${ADD_SONGS_TO_PLAYLIST}/${recommendationPlaylistID}/tracks`,
        { uris: recommendationsURI, position: 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRecommendationsURI([]);
      setAddSongsDisabled(true);
    } catch {
      reportError("Failed to add songs to playlist.");
    }
  };

  const savePlaylistId = async (playlistId: string) => {
    try {
      await axios.post(
        "http://localhost:8080/api/playlists/",
        { playlistId },
        { headers: { "Content-Type": "application/json" } }
      );

      const res = await axios.get<{ count: number }>(
        "http://localhost:8080/api/playlists/playlistIds"
      );
      setCreatedPlaylistIdsCount(res.data.count);
    } catch {}
  };

  const columns = useMemo(
    () => [
      { field: "id", headerName: "ID", width: 70 },
      { field: "uri", headerName: "URI", width: 0, hide: true },
      { field: "name", headerName: "Track Name", width: 200 },
      { field: "artists", headerName: "Artist/Artists", width: 250 },
      { field: "album", headerName: "Album", width: 250 },
      {
        field: "image",
        headerName: "Album",
        width: 150,
        renderCell: (params: any) => (
          <img
            height="80px"
            width="80px"
            alt="Album Cover"
            src={params.row.image}
          />
        ),
      },
      { field: "release_date", headerName: "Release Date" },
      {
        field: "popularity",
        headerName: "Popularity",
        width: 150,
        sortable: true,
      },
      {
        field: "song_link",
        headerName: "Song Link",
        width: 150,
        renderCell: (params: any) => (
          <a href={params.row.song_link} target="_blank" rel="noreferrer">
            Link
          </a>
        ),
      },
    ],
    []
  );

  return (
    <div>
      {error && (
        <p style={{ color: "red", textAlign: "center", marginTop: "1rem" }}>
          {error}
        </p>
      )}

      <Tabs.Container defaultValue="time">
        <Tabs.List spacing="equal" justifyContent="center">
          <Tabs.Item value="time">Time Capsule</Tabs.Item>
          <Tabs.Item value="recommendations" isDisabled={!recommendationTabEnabled}>
            Recommendations
          </Tabs.Item>
        </Tabs.List>

        <Tabs.Panel value="time">
          <TimeCapsule
            handleSongLimitAndRecommendationCallback={
              handleSongLimitAndRecommendation
            }
            songLimit={songLimit}
            randomSongsLength={randomSongsLength}
            handlePlaylistNameCallback={(e) =>
              setPlaylistName(escapeHTML(e.target.value))
            }
            playlistName={playlistName}
            handleCreatePlaylistCallback={handleCreatePlaylist}
            handleAddSongsToPlaylistCallback={handleAddSongsToPlaylist}
            dropDownOptionsComponent={dropDownOptionsComponent}
            dropDownSeasonComponent={dropDownSeasonComponent}
            year={year}
            season={season}
            throwErrorState={throwError}
            createdPlaylistIdsCount={createdPlaylistIdsCount}
          />
        </Tabs.Panel>

        <Tabs.Panel value="recommendations">
          <Recommendations
            dataTableArr={dataTableArr}
            columns={columns}
            handleGetRecommendationsCallback={handleGetRecommendations}
            genreCheckboxComponent={genreCheckboxComponent}
            setRecommendationsCallback={setRecommendationsCallback}
            handleRecommendationPlaylistNameCallback={
              handleRecommendationPlaylistNameCallback
            }
            createRecommendationPlaylistCallback={
              createRecommendationPlaylist
            }
            addSongsToRecommendationPlaylistCallback={
              addSongsToRecommendationPlaylist
            }
            checkboxCounter={checkboxCounter}
            setHandlePlaylistNameCheck={setPlaylistNameDisabled}
            setCreatePlaylistCheck={setCreatePlaylistDisabled}
            handleCreatePlaylistCheck={createPlaylistDisabled}
            handlePlaylistNameCheck={playlistNameDisabled}
            setAddSongsButton={setAddSongsDisabled}
            handleAddSongsButton={addSongsDisabled}
            setRecommendationsURI={setRecommendationsURI}
          />
        </Tabs.Panel>
      </Tabs.Container>
    </div>
  );
};

export default Filters;
