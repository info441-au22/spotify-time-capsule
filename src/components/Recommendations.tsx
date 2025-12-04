import React from "react";
import { Flex, Button, Heading, TextField } from "@aws-amplify/ui-react";
import {
  DataGrid,
  GridSelectionModel,
  GridColDef,
  GridRowsProp,
} from "@mui/x-data-grid";
import { DataTableRow } from "./Filters";

interface RecommendationsProps {
  dataTableArr: DataTableRow[];
  columns: GridColDef[];
  handleGetRecommendationsCallback: () => void;
  genreCheckboxComponent: React.ReactNode;
  setRecommendationsCallback: (items: GridSelectionModel) => void;
  handleRecommendationPlaylistNameCallback: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  createRecommendationPlaylistCallback: () => void;
  addSongsToRecommendationPlaylistCallback: () => void;
  checkboxCounter: number;
  setHandlePlaylistNameCheck: (value: boolean) => void;
  handlePlaylistNameCheck: boolean;
  setCreatePlaylistCheck: (value: boolean) => void;
  handleCreatePlaylistCheck: boolean;
  setAddSongsButton: (value: boolean) => void;
  handleAddSongsButton: boolean;
  setRecommendationsURI: (uris: string[]) => void;
}

const Recommendations: React.FC<RecommendationsProps> = (props) => {
  const {
    dataTableArr,
    columns,
    handleGetRecommendationsCallback,
    genreCheckboxComponent,
    setRecommendationsCallback,
    handleRecommendationPlaylistNameCallback,
    createRecommendationPlaylistCallback,
    addSongsToRecommendationPlaylistCallback,
    checkboxCounter,
    setHandlePlaylistNameCheck,
    handlePlaylistNameCheck,
    setCreatePlaylistCheck,
    handleCreatePlaylistCheck,
    setAddSongsButton,
    handleAddSongsButton,
    setRecommendationsURI,
  } = props;

  const rows: GridRowsProp = dataTableArr;

  return (
    <Flex direction="column" alignItems="center" padding="2rem" gap="1rem">
      <Heading level={1}>Select Your Genre</Heading>

      <Flex direction="row" alignItems="center" gap="1rem">
        {genreCheckboxComponent}
      </Flex>

      <Button
        variation="primary"
        size="large"
        aria-label="get-recommendations"
        isDisabled={checkboxCounter === 0 || checkboxCounter > 3}
        onClick={handleGetRecommendationsCallback}
      >
        GET SONG RECOMMENDATIONS
      </Button>

      <Flex direction="row" alignItems="flex-start" gap="1rem" height="625px">
        <DataGrid
          rows={dataTableArr}
          columns={columns}
          checkboxSelection
          disableSelectionOnClick
          pageSize={5}
          rowsPerPageOptions={[5]}
          rowHeight={100}
          onSelectionModelChange={(selection) => {
            const selected = selection as GridSelectionModel;
            setHandlePlaylistNameCheck(selected.length === 0);
            setRecommendationsCallback(selected);
          }}
          sx={{ width: "100%", maxWidth: "1100px" }}
        />

        <Flex direction="column" gap="0.75rem" width="400px">
          <TextField
            aria-label="playlist-name-input"
            label=""
            id="playlistName"
            name="playlistName"
            placeholder="Choose a playlist name"
            isRequired
            isDisabled={handlePlaylistNameCheck}
            onChange={(e) => {
              handleRecommendationPlaylistNameCallback(e);
              setCreatePlaylistCheck(e.target.value.trim() === "");
            }}
          />

          <Button
            aria-label="create-playlist"
            isDisabled={handleCreatePlaylistCheck}
            onClick={() => {
              createRecommendationPlaylistCallback();
              setAddSongsButton(false);
            }}
          >
            CREATE PLAYLIST
          </Button>

          <Button
            aria-label="add-songs"
            isDisabled={handleAddSongsButton}
            onClick={() => {
              addSongsToRecommendationPlaylistCallback();
              setRecommendationsURI([]);
            }}
          >
            ADD SONGS TO THE PLAYLIST
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Recommendations;
