import env from './env';

let SPOTIFY_CODE = '';
let SPOTIFY_TOKEN = {
  access_token: '',
  token_type: '',
  scope: '',
  expires_in: 0,
  expires_at: 0,
  refresh_token: '',
};

const getDataHeaders = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${SPOTIFY_TOKEN.access_token}`,
};

const setDataHeaders = (token) => {
  getDataHeaders.Authorization = `Bearer ${token.access_token}`;
};

const spotifyAuthURL = `https://accounts.spotify.com/authorize?response_type=code&client_id=${env.clientID}&scope=${encodeURIComponent(env.scopes)}&redirect_uri=${encodeURIComponent(env.redirectURI)}`;

function clearUrl() {
  window.history.replaceState(null, 'Mini Player', '/');
}

function redirectToSpotifyAuth() {
  window.location.href = spotifyAuthURL;
}

function checkIfPathHasSpotifyAuthCode() {
  const url = new URL(window.location.href);
  const spotifyCode = url.searchParams.get('code');

  if (spotifyCode) {
    localStorage.setItem('spotifyCode', spotifyCode);
  }
}

function checkIfStorageHasSpotifyAuthCode() {
  const spotifyCode = localStorage.getItem('spotifyCode');

  return new Promise((resolve, reject) => {
    if (!spotifyCode) {
      redirectToSpotifyAuth();
      reject();
    } else {
      SPOTIFY_CODE = spotifyCode;
      clearUrl();
      resolve();
    }
  });
}

function storeToken(token) {
  const now = new Date().getTime();

  SPOTIFY_TOKEN = {
    ...token,
    expires_at: now + token.expires_in * 1000,
  };

  localStorage.setItem('spotifyToken', JSON.stringify(SPOTIFY_TOKEN));
}

function getSpotifyToken() {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Basic ${btoa(`${env.clientID}:${env.clientSecret}`)}`,
  };

  const getToken = (url, formData) => (
    fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    })
      .then((res) => res.json())
      .then((token) => {
        // console.log('b');
        storeToken(token);
      })
  );

  return {
    getNewToken: () => {
      const formData = new URLSearchParams();
      formData.append('grant_type', 'authorization_code');
      formData.append('redirect_uri', env.redirectURI);
      formData.append('code', SPOTIFY_CODE);

      return getToken('https://accounts.spotify.com/api/token', formData);
    },
    refreshToken: () => {
      const formData = new URLSearchParams();
      formData.append('grant_type', 'refresh_token');
      formData.append('refresh_token', SPOTIFY_TOKEN.refresh_token);

      return getToken('https://accounts.spotify.com/api/token', formData);
    },
  };
}

function login() {
  return new Promise((resolve) => {
    const loginStuff = async () => {
      localStorage.clear();

      checkIfPathHasSpotifyAuthCode();
      await checkIfStorageHasSpotifyAuthCode();
      // console.log('a');
      await getSpotifyToken().getNewToken();
      // console.log('c');

      const refreshIn = (SPOTIFY_TOKEN.expires_in - SPOTIFY_TOKEN.expires_in * 0.1) * 1000;

      if (SPOTIFY_TOKEN.refresh_token) {
        setInterval(() => {
          getSpotifyToken().refreshToken();
        }, refreshIn);
      }

      resolve();
    };

    loginStuff();
  });
}

function checkIfTokenExpired() {
  const now = new Date().getTime();
  const spotifyToken = JSON.parse(localStorage.getItem('spotifyToken'));

  SPOTIFY_TOKEN = {
    ...SPOTIFY_TOKEN,
    ...spotifyToken,
  };

  setDataHeaders(SPOTIFY_TOKEN);

  return new Promise((resolve) => {
    if (now > SPOTIFY_TOKEN.expires_at) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
}

export { getDataHeaders, checkIfTokenExpired, login };
