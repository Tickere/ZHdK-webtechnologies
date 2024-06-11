const SPOTIFY_CLIENT_ID = "67b411e20d594f30bf7a8d3bbde54285";
const SPOTIFY_CLIENT_SECRET = "161fc5e3df004b95af3ba8c62f3eaf54";
const PLAYLIST_ID = "7fXKDSXrj7RljWC4QTixrd";
const container = document.querySelector('div[data-js="tracks"]');
const albumImage = document.getElementById("album-image");
const currentTrackControls = document.getElementById("current-track-controls");

let currentlyPlayingAudio = null;

function fetchPlaylist(token, playlistId) {
  console.log("token: ", token);

  fetch(`https://api.spotify.com/v1/playlists/${PLAYLIST_ID}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      if (data.tracks && data.tracks.items) {
        data.tracks.items.forEach((item) => {
          console.log(item.track.name);
        });

        addTracksToPage(data.tracks.items);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function addTracksToPage(items) {
  const ul = document.createElement("ul");

  items.forEach((item, index) => {
    console.log("track: ", item.track);
    const li = document.createElement("li");

    li.classList.add("list-item");

    li.innerHTML = `
      <p>${item.track.name} by ${item.track.artists
      .map((artist) => artist.name)
      .join(", ")}</p>
      <button class="play-pause-button" data-index="${index}">Play</button>
    `;

    ul.appendChild(li);
  });
  container.appendChild(ul);

  const buttons = document.querySelectorAll(".play-pause-button");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const index = button.getAttribute("data-index");
      const track = items[index].track;

      // Stop any currently playing audio
      if (
        currentlyPlayingAudio &&
        currentlyPlayingAudio.src !== track.preview_url
      ) {
        currentlyPlayingAudio.pause();
        const prevButton = document.querySelector(
          `.play-pause-button[data-index="${currentlyPlayingAudio.getAttribute(
            "data-index"
          )}"]`
        );
        if (prevButton) {
          prevButton.textContent = "Play";
        }
      }

      // Update current track controls
      const trackName = track.name;
      const artistName = track.artists.map((artist) => artist.name).join(", ");
      const controlsHtml = `
        <p>Now playing: ${trackName} by ${artistName}</p>
        <audio controls id="current-audio" src="${track.preview_url}"></audio>
      `;
      currentTrackControls.innerHTML = controlsHtml;
      const currentAudio = document.getElementById("current-audio");

      if (
        currentlyPlayingAudio &&
        currentlyPlayingAudio.src === track.preview_url
      ) {
        if (currentlyPlayingAudio.paused) {
          currentlyPlayingAudio.play();
          button.textContent = "Pause";
        } else {
          currentlyPlayingAudio.pause();
          button.textContent = "Play";
        }
      } else {
        currentAudio.play();
        button.textContent = "Pause";
        currentlyPlayingAudio = currentAudio;
      }

      // Update album art
      const albumArt = track.album.images[0].url;
      albumImage.src = albumArt;

      // Handle play/pause for the current audio
      currentAudio.addEventListener("play", () => {
        button.textContent = "Pause";
      });

      currentAudio.addEventListener("pause", () => {
        button.textContent = "Play";
      });
    });
  });
}

function fetchAccessToken() {
  fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=client_credentials&client_id=${SPOTIFY_CLIENT_ID}&client_secret=${SPOTIFY_CLIENT_SECRET}`,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.access_token) {
        fetchPlaylist(data.access_token, PLAYLIST_ID);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

fetchAccessToken();
