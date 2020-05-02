import { getDataHeaders, checkIfTokenExpired, login } from './auth';
import env from './env';

// eslint-disable-next-line
// const { ipcRenderer } = __non_webpack_require__('electron');

(function init() {
  let IS_PLAYING = false;

  const container = document.querySelector('.container');
  const btnPlaylist = document.querySelector('.btn--playlist');
  const btnClose = document.querySelector('.btn--close');
  const playerRange = document.querySelector('.range');
  const playerProgress = document.querySelector('.progress');
  const btnPlay = document.querySelector('.control__play');
  const btnPrev = document.querySelector('.control__prev');
  const btnNext = document.querySelector('.control__next');
  const playlist = document.querySelector('.playlist__list');

  function playingNowTemplate(trackTitle, artistsNames) {
    return `
      <li class="playlist__list__item active">
        <span class="title">${trackTitle}</span>
        <span class="artist">${artistsNames.join(', ')}</span>
      </li>
    `;
  }

  function setPlayingState(isPLaying) {
    IS_PLAYING = isPLaying;
    btnPlay.setAttribute('data-play', isPLaying ? 1 : 0);
  }

  function setCurrentPositionPlayer(currentProgress, totalDuration) {
    playerProgress.value = currentProgress;
    playerProgress.max = totalDuration;
    playerRange.value = currentProgress;
    playerRange.max = totalDuration;
  }

  function getCurrentPlayingTrack() {
    fetch(`${env.spotify_API_URL}/currently-playing?market=from_token`, {
      headers: getDataHeaders,
    })
      .then((res) => res.text().then((text) => (
        text ? JSON.parse(text) : null
      )))
      .then(
        (data) => {
          if (data) {
            setCurrentPositionPlayer(data.progress_ms, data.item.duration_ms);

            playlist.innerHTML = playingNowTemplate(
              data.item.name,
              data.item.artists.map((artist) => artist.name),
            );

            setPlayingState(data.is_playing);

            setTimeout(() => {
              getCurrentPlayingTrack();
            }, 500);
          } else {
            setPlayingState(false);
          }
        },
        (err) => {
          console.log(err);
        },
      );
  }

  function startResumeUsersPlayback() {
    fetch(`${env.spotify_API_URL}/play`, {
      method: 'PUT',
      headers: getDataHeaders,
    })
      .then((res) => res.text().then((text) => (
        text ? JSON.parse(text) : null
      )))
      .then(
        (data) => {
          console.log(data);
        },
        (err) => {
          console.log(err);
        },
      );
  }

  function pauseUsersPlayback() {
    fetch(`${env.spotify_API_URL}/pause`, {
      method: 'PUT',
      headers: getDataHeaders,
    })
      .then((res) => res.text().then((text) => (
        text ? JSON.parse(text) : null
      )))
      .then(
        (data) => {
          console.log(data);
        },
        (err) => {
          console.log(err);
        },
      );
  }

  function skipUsersPlayback(direction) {
    fetch(`${env.spotify_API_URL}/${direction}`, {
      method: 'POST',
      headers: getDataHeaders,
    })
      .then((res) => res.text().then((text) => (
        text ? JSON.parse(text) : null
      )))
      .then(
        (data) => {
          console.log(data);
        },
        (err) => {
          console.log(err);
        },
      );
  }

  function setPositionPlayingTrack(position) {
    const url = new URL(`${env.spotify_API_URL}/seek`);
    url.searchParams.append('position_ms', position);

    fetch(url, {
      method: 'PUT',
      headers: getDataHeaders,
    })
      .then((res) => res.text().then((text) => (
        text ? JSON.parse(text) : null
      )))
      .then(
        (data) => {
          console.log(data);
        },
        (err) => {
          console.log(err);
        },
      );
  }

  function getSpotifyData() {
    getCurrentPlayingTrack();
  }

  btnPlaylist.addEventListener('click', () => {
    const { classList } = container;

    if (classList.contains('show')) {
      classList.remove('show');
      // ipcRenderer.send('resize', 192, 52);
    } else {
      classList.add('show');
      // ipcRenderer.send('resize', 192, 244);
    }
  });

  playerRange.addEventListener('click', (event) => {
    const { target } = event;
    setPositionPlayingTrack(target.value);
  });

  btnClose.addEventListener('click', () => {
    // ipcRenderer.sendSync('synchronous-message', { type: 'close' });
  });

  btnPlay.addEventListener('click', () => {
    if (IS_PLAYING) {
      pauseUsersPlayback();
    } else {
      startResumeUsersPlayback();
    }
  });

  btnPrev.addEventListener('click', () => {
    skipUsersPlayback('previous');
  });

  btnNext.addEventListener('click', () => {
    skipUsersPlayback('next');
  });

  checkIfTokenExpired()
    .then(async (expired) => {
      if (expired) {
        await login();
        getSpotifyData();
      } else {
        getSpotifyData();
      }
    });
}());
