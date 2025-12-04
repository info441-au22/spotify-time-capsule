import React, { useEffect, useState } from "react";
import { Button, Flex, Text } from "@aws-amplify/ui-react";

const CLIENT_ID = "1afe16f7b5c44f1ab21bc53d0af990fb";
const SPOTIFY_AUTHORIZE_ENDPOINT = "https://accounts.spotify.com/authorize";
const REDIRECT_URI = "http://localhost:3000/";

const SCOPES = [
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-read-private",
  "playlist-modify-private",
];
const SCOPES_COMBINED = SCOPES.join("%20");

interface SpotifyAuthParams {
  access_token: string;
  expires_in: string;
  token_type: string;
}

function parseSpotifyHash(hash: string): SpotifyAuthParams | null {
  if (!hash.startsWith("#")) return null;

  const params = hash
    .substring(1)
    .split("&")
    .reduce<Record<string, string>>((acc, pair) => {
      const [key, value] = pair.split("=");
      if (key && value) acc[key] = decodeURIComponent(value);
      return acc;
    }, {});

  if (!params.access_token) return null;

  return {
    access_token: params.access_token,
    expires_in: params.expires_in,
    token_type: params.token_type,
  };
}

const Header: React.FC = () => {
  const [isLoggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const parsed = parseSpotifyHash(window.location.hash);
    if (!parsed) return;

    localStorage.setItem("accessToken", parsed.access_token);
    localStorage.setItem("expiresIn", parsed.expires_in);
    localStorage.setItem("tokenType", parsed.token_type);

    setLoggedIn(true);

    const expirationMs = Number(parsed.expires_in) * 1000;
    const timeout = setTimeout(() => {
      setLoggedIn(false);
      localStorage.removeItem("accessToken");
    }, expirationMs);

    // clear hash without redirect
    window.history.replaceState(null, "", window.location.pathname);

    return () => clearTimeout(timeout);
  }, []);

  const handleLogin = () => {
    const loginUrl =
      `${SPOTIFY_AUTHORIZE_ENDPOINT}?client_id=${CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&scope=${SCOPES_COMBINED}` +
      `&response_type=token&show_dialog=true`;

    window.location.href = loginUrl;
  };

  return (
    <Flex direction="column" justifyContent="center" alignItems="center" gap="1rem">
      <Button variation="primary" onClick={handleLogin} aria-label="login">
        <i className="fab fa-spotify" /> LOGIN WITH SPOTIFY
      </Button>

      {isLoggedIn && (
        <Text fontWeight={600} fontSize="0.75rem" aria-label="login-success">
          YOU ARE LOGGED IN!
        </Text>
      )}
    </Flex>
  );
};

export default Header;