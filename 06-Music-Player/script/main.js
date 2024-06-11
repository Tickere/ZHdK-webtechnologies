const SPOTIFY_CLIENT_ID = "67b411e20d594f30bf7a8d3bbde54285";
const SPOTIFY_CLIENT_SECRET = "161fc5e3df004b95af3ba8c62f3eaf54";
const PLAYLIST_ID = "7fXKDSXrj7RljWC4QTixrd";
const container = document.querySelector('div[data-js="tracks"]');
const albumImage = document.getElementById("album-image");

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

  items.forEach((item) => {
    console.log("track: ", item.track);
    const li = document.createElement("li");

    li.classList.add("list-item");

    li.innerHTML = `
      <p>${item.track.name} by ${item.track.artists
      .map((artist) => artist.name)
      .join(", ")}</p>

      ${
        item.track.album.images[0]
          ? `<img src="${item.track.album.images[0].url}" alt="Album Art">`
          : "<p>No Image available</p>"
      }

      ${
        item.track.preview_url
          ? `<audio controls src="${item.track.preview_url}"></audio>`
          : "<p>No preview available</p>"
      }
    `;

    ul.appendChild(li);
  });
  container.appendChild(ul);

  const audioElements = document.querySelectorAll("audio");
  audioElements.forEach((audio, index) => {
    audio.addEventListener("play", () => {
      if (currentlyPlayingAudio && currentlyPlayingAudio !== audio) {
        currentlyPlayingAudio.pause();
      }
      currentlyPlayingAudio = audio;
      const albumArt = items[index].track.album.images[0].url;
      albumImage.src = albumArt;
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
