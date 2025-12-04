# 🎧 Spotify Time Capsule

Spotify Time Capsule is a full-stack web application that allows users to generate **personalized playlists** based on their listening history, selected time periods, and preferred genres.

Users authenticate with Spotify, explore their listening patterns across seasons and years, create nostalgic “Time Capsule” playlists, or generate genre-driven song recommendations. The app interacts directly with the Spotify Web API and includes a backend service for storing playlist statistics.

---

## 🚀 Tech Stack

### **Frontend**
- **React (Hooks + Functional Components)**
- **AWS Amplify UI** — For layout, forms, buttons, tabs, modals
- **React Bootstrap** — Dropdowns and layout helpers
- **Material UI DataGrid** — Displays recommended track lists
- **Axios** — For HTTP requests to Spotify API and backend
- **LocalStorage** — Stores Spotify OAuth tokens

### **Backend**
- **Node.js + Express**
- REST API for storing user-created playlist IDs
  - `POST /api/playlists/`
  - `GET /api/playlists/playlistIds`

### **Authentication**
- **Spotify OAuth 2.0 (Implicit Grant Flow)**
- Stores:
  - `access_token`
  - `expires_in`
  - `token_type`

### **Spotify API Usage**
- `/v1/me` — Get user profile data  
- `/v1/me/playlists` — Get user playlists  
- `/v1/recommendations` — Get recommendations  
- `/v1/users/{id}/playlists` — Create user playlists  
- `/v1/playlists/{id}/tracks` — Add songs to playlists  

---

## ✨ Key Features

### 🎵 Time Capsule Playlist Generator
- Select **Year** and **Season**
- Choose number of songs (up to 100)
- App retrieves songs added during that time period
- Randomizes selection
- Creates playlist and populates it with filtered songs

### 💡 Genre-Based Song Recommendations
- Select 1–3 genres
- Fetch recommended tracks from Spotify
- View results in a scrollable, sortable DataGrid
- Select tracks and create a custom playlist
- Add selected tracks to the new playlist

### 🔐 Secure Spotify Login
- Instant login via OAuth
- Automatically stores and reads access tokens
- Updates interface reactively

### 📈 Playlist Statistics
- Backend tracks number of total playlists created
- Displayed dynamically on the Time Capsule page

### 🖥 User-Friendly UI
- AWS Amplify and Material UI for responsive, modern layout  
- Modal-based onboarding (Getting Started)
- Clear validation messages
- Disabled/enabled buttons based on user interaction logic

---

## 🧠 Architecture Overview

src/
┣ components/
┃ ┣ Filters.jsx              # Core Spotify logic (900+ lines)
┃ ┣ GettingStarted.jsx       # Onboarding modal
┃ ┣ Recommendations.jsx      # Recommendations UI
┃ ┣ TimeCapsule.jsx          # Time capsule UI
┃ ┣ SpotifyAuthButton.jsx    # OAuth login logic
┃ ┗ Sections.jsx
┣ controllers/               # Express controllers
┣ models/                    # PlaylistId storage model
┣ routes/                    # API routes
┣ server.js                  # Backend server entry
┣ App.js
┣ index.js
┗ styles.css

---

## 🛠 Planned Improvements

### 🔄 Convert Project to TypeScript
- Add strong typing for:
  - Spotify track objects
  - Recommendations
  - User playlists
  - API responses
  - Props for each component

### 📦 Modularize `Filters.jsx` (900+ lines → multiple clean files)
Split into:
- `useSpotifyAuth.ts`
- `useUserPlaylists.ts`
- `useTimeCapsule.ts`
- `useRecommendations.ts`
- `spotifyApi.ts` (Axios wrapper)
- `dateUtils.ts`
- `escape.ts`
- `types/spotify.ts`

This eliminates duplication and improves readability/testability.

### ⚠ Improve Error Handling
- Add centralized API error wrapper
- Show errors using UI components instead of `console.log`
- Handle rate limits with user-friendly messaging
- Validate state before API calls
- Use async/await instead of deeply nested `.then()`

### 🧹 Clean up state management
- Replace dozens of individual `useState` calls with:
  - `useReducer`, **or**
  - Zustand/Recoil (optional recommendation)

### 🔐 Migrate OAuth to Spotify PKCE Flow
Implicit flow is deprecated → PKCE is more secure.

---

# 🎯 Final Goal

A modern, testable, TypeScript-powered Spotify application with:

- Clean architecture  
- Smaller focused components  
- Strong API types  
- Centralized error handling  
- Reusable Spotify hooks  
- Professional-grade code suitable for portfolio & interviews  
