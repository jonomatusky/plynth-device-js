// var rp = require('request-promise-native');
var request = require('request'); // "Request" library;

const projectUrl = 'https://' + process.env.PROJECT_DOMAIN + '.glitch.me';

const spotifyApiUrl = 'https://api.spotify.com/v1/';
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
// const redirectPath = '/auth-callback';
// const SPOTIFY_REDIRECT_URI = projectUrl + redirectPath;
const SPOTIFY_REDIRECT_URI = 'http://fullglass.ventures';

var base64String = Buffer(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64');

// var authOptions = {
//   uri: 'https://accounts.spotify.com/api/token',
//   headers: {
//     'Authorization': 'Basic ' + base64String
//   },
//   form: {
//     grant_type: 'client_credentials'
//   },
//   json: true
// };

// function getToken() {
//   console.log('Asking for Token');
//   console.log('Client ID: ' + SPOTIFY_CLIENT_ID);
//   request.post(authOptions, function(error, response, body) {
//     if (!error && response.statusCode === 200) {
//       console.log('Spotify Token Received');
//       var spotifyToken = body.access_token;
//       // use the access token to access the Spotify Web API
//       console.log('Token: ' + spotifyToken);
//       return spotifyToken;
//     }
//   });
// }

async function queryOptions(spotifyToken, safeGuess) {
  return {
    method: 'GET',
    uri: spotifyApiUrl + 'search?q=' + safeGuess + '&type=album',
    json: true,
    auth: {
        'bearer': spotifyToken
    }
  }
}

// function authQueryString(state) {
//   return {
//     client_id: SPOTIFY_CLIENT_ID,
//     response_type: "code",
//     redirect_uri: SPOTIFY_REDIRECT_URI,
//     state: state,
//     show_dialog: false
//   }
// }


// your application requests authorization

  // function getSpotifyToken() {
  //   const spotifyAuthOptions = authOptions();
  //   await rp(spotifyAuthOptions)
  //   .then(data => {
  //     return data.access_token;
  //   })
  //   .catch(err => handleError(res, err));
  // }

// function authOptions() {
//     return {
//     method: 'POST',
//     uri: 'https://accounts.spotify.com/api/token',
//     form: {
//       grant_type: 'client_credentials',
//       client_id: SPOTIFY_CLIENT_ID,
//       client_secret: SPOTIFY_CLIENT_SECRET,
//     },
//     json: true
//   } 
// }

// function setCookies(res, data) {
//   let spotifyAccessOptions = {
//     // Spotify sends token in seconds, express wants milliseconds
//     // remove 5 seconds to avoid race conditions.
//     maxAge: (data.expires_in - 5) * 1000
//   }
//   res.cookie('spotifyAccessToken', data.access_token, spotifyAccessOptions);
//   if (data.refresh_token) {
//     res.cookie('spotifyRefreshToken', data.refresh_token);
//   }
// }

// function refreshOptions(refreshToken) {
//   return {
//     method: 'post',
//     uri: 'https://accounts.spotify.com/api/token',
//     form: {
//       grant_type:  'refresh_token',
//       refresh_token: refreshToken,
//       client_id: SPOTIFY_CLIENT_ID,
//       client_secret: SPOTIFY_CLIENT_SECRET,
//     },
//     json: true
//   }
// }

// const embed = ['<iframe id="spotify-embed-iframe" src="https://open.spotify.com/embed?uri=spotify:album:', '" width="300" height="480" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>'];


module.exports = {
  queryOptions: queryOptions,
  // authQueryString: authQueryString,
  authOptions: authOptions,
  // setCookies: setCookies,
  // refreshOptions: refreshOptions,
  // embed: embed
}




