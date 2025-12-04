import React from "react";
import { TextField, Flex, View, Button, Text } from "@aws-amplify/ui-react";
import { Dropdown } from "react-bootstrap";
import { Season } from "../utils/dateUtils";

interface TimeCapsuleProps {
  handleSongLimitAndRecommendationCallback: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  songLimit: number;
  randomSongsLength: number;
  handlePlaylistNameCallback: (e: React.ChangeEvent<HTMLInputElement>) => void;
  playlistName: string;
  handleCreatePlaylistCallback: () => void;
  handleAddSongsToPlaylistCallback: () => void;
  year: number | "";
  season: Season | "";
  dropDownOptionsComponent: React.ReactNode;
  dropDownSeasonComponent: React.ReactNode;
  throwErrorState: boolean;
  createdPlaylistIdsCount: number;
}

const TimeCapsule: React.FC<TimeCapsuleProps> = ({
  handleSongLimitAndRecommendationCallback,
  songLimit,
  randomSongsLength,
  handlePlaylistNameCallback,
  playlistName,
  handleCreatePlaylistCallback,
  handleAddSongsToPlaylistCallback,
  year,
  season,
  dropDownOptionsComponent,
  dropDownSeasonComponent,
  throwErrorState,
  createdPlaylistIdsCount,
}) => {
  const isTimeframeSelected = !!season && !!year;

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      gap="1rem"
    >
      {throwErrorState && (
        <Flex direction="column" alignItems="center" padding="2rem" gap="1rem">
          <Text
            color="red"
            fontSize="0.85rem"
            textAlign="center"
            ariaLabel="Invalid timeframe error"
          >
            Error: No songs found or rate limit exceeded. Try another timeframe.
          </Text>

          <Button variation="primary" onClick={() => window.location.reload()}>
            OK
          </Button>
        </Flex>
      )}

      <View
        as="div"
        padding="1.5rem"
        width="100%"
        maxWidth="600px"
        borderRadius="6px"
        style={{
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Dropdown style={{ paddingBottom: "1rem" }}>
          <Dropdown.Toggle variant="success">SEASON</Dropdown.Toggle>
          <Dropdown.Menu>{dropDownSeasonComponent}</Dropdown.Menu>
        </Dropdown>

        <Dropdown style={{ paddingBottom: "1rem" }}>
          <Dropdown.Toggle variant="success">YEAR</Dropdown.Toggle>
          <Dropdown.Menu>{dropDownOptionsComponent}</Dropdown.Menu>
        </Dropdown>

        {isTimeframeSelected ? (
          <Text color="#188754" fontWeight={600} fontSize="1rem">
            Your time frame is {season}, {year}
          </Text>
        ) : (
          <Text fontWeight={600} fontSize="1rem">
            Select a season and year
          </Text>
        )}

        <TextField
          label="Number of Songs"
          ariaLabel="Song limit input"
          type="number"
          variation="quiet"
          placeholder="Enter number of songs"
          isDisabled={!isTimeframeSelected}
          isRequired
          onChange={handleSongLimitAndRecommendationCallback}
          marginBlockStart="1rem"
        />

        {randomSongsLength > 0 && (
          <Text fontSize="0.8rem" marginBlockStart="0.5rem" color="#188754">
            {randomSongsLength} songs matched. (Max 100)
          </Text>
        )}

        <TextField
          label="Playlist Name"
          ariaLabel="Playlist name input"
          type="text"
          variation="quiet"
          placeholder="Choose a playlist name"
          isRequired
          onChange={handlePlaylistNameCallback}
          marginBlockStart="1rem"
        />
      </View>

      <Button
        variation="primary"
        ariaLabel="Create playlist"
        onClick={handleCreatePlaylistCallback}
        isDisabled={!playlistName.trim()}
      >
        CREATE PLAYLIST
      </Button>

      <Button
        variation="primary"
        ariaLabel="Add songs to playlist"
        onClick={handleAddSongsToPlaylistCallback}
      >
        ADD SONGS TO PLAYLIST
      </Button>

      <Text fontSize="0.75rem">Songs may repeat based on your library.</Text>

      {createdPlaylistIdsCount > 0 && (
        <Text fontSize="1rem">
          Users have created <strong>{createdPlaylistIdsCount}</strong>{" "}
          playlists since 2022.
        </Text>
      )}
    </Flex>
  );
};

export default TimeCapsule;
